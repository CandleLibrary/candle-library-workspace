import { CSSNodeType, tools } from '@candlelib/css';
import { exp, ext, JSNode, JSNodeType, JSNodeTypeLU, stmt } from '@candlelib/js';
import { dir, log, trace, warn, debug } from '../common/logger.js';
import {
    HookHandlerPackage, HTMLHandler,
    HTMLNode, HTMLNodeType,
    HTMLNodeTypeLU,
    JSHandler, Node
} from "../types/all.js";
import { addIndirectHook } from './ast-build/hooks.js';
import {
    loadHTMLHandler,
    loadHTMLHandlerInternal,
    processBindingASTAsync as processBindingAsync,
    processSecondaryBindingASTAsync as processSecondaryBindingAsync
} from "./ast-parse/html.js";
import {
    loadJSParseHandler,
    loadJSParseHandlerInternal
} from "./ast-parse/js.js";
import {
    processFunctionDeclaration,
    processNodeAsync,
    processWickCSS_AST,
    processWickHTML_AST as processHTMLNode,
    processWickJS_AST as processJSNode
} from './ast-parse/parse.js';
import { parseComponentAST } from './ast-parse/source.js';
import {
    addBindingReference,
    addBindingVariable,
    addDefaultValueToBindingVariable,
    addNameToDeclaredVariables,
    addReadFlagToBindingVariable,
    addWriteFlagToBindingVariable,
    getBindingFromExternalName,
    getBindingStaticResolutionType,
    getComponentBinding
} from './common/binding.js';
import { getComponentSourceString, setPos } from './common/common.js';
import { css_selector_helpers } from './common/css.js';
import { getExtendTypeName, registerHookType } from './common/extended_types.js';
import { getElementAtIndex } from './common/html.js';
import { getFirstReferenceName } from './common/js.js';
import { importResource } from "./data/module.js";
import {
    getExpressionStaticResolutionType,
    getStaticAST,
    getStaticValue
} from "./data/static_resolution.js";
import { metrics } from './metrics.js';
import { Token } from '@candlelib/hydrocarbon';
import URI from '@candlelib/uri';

const registered_hook_handlers = new Map();

function generateWarning(id: string, message: string, source?: URI, loc?: Token) {

}

function generateError(id: string, message: string, error: Error, source: URI, loc: Token) {

}

function addResourceURI(id: string, message: string, error: Error, source: URI, loc: Token) {

}

export function registerHookHandler<InputNodeType, OutputNodeType>(hook_handler_obj:
    HookHandlerPackage<InputNodeType, OutputNodeType>) {
    //Verify Basic functions
    if (!hook_handler_obj)
        throw new Error("Missing Argument For hook_handler_obj");

    if (!Array.isArray(hook_handler_obj.types) || !hook_handler_obj.types.every(t => typeof t == "number"))
        throw new Error("hook_handler_obj.types should be an array of ExtendedType numbers");

    if (typeof hook_handler_obj.name != "string")
        throw new Error("Missing name string for hook_handler_obj");

    if (typeof hook_handler_obj.verify != "function")
        throw new Error("Missing verify function");

    if (typeof hook_handler_obj.buildJS != "function")
        throw new Error("Missing buildJS function");

    if (typeof hook_handler_obj.buildHTML != "function")
        throw new Error("Missing buildHTML function");

    if (registered_hook_handlers.has(hook_handler_obj.name))
        throw new Error(`A hook handler named ${hook_handler_obj.name} has already be registered`);

    registered_hook_handlers.set(hook_handler_obj.name, hook_handler_obj);
}
/*
*   Returns an array of active hookHandlerPackages
*/


export function getHookHandlers(): HookHandlerPackage[] {
    return [...registered_hook_handlers.values()];
}
;




const registration_system = {
    registerHookType<T>(extension_name: string, original_type: T) {
        return registerHookType(extension_name, original_type);
    },

    registerJSParserHandler(js_parse_handler: JSHandler<Node>, ...types: (JSNodeType | HTMLNodeType | CSSNodeType)[]) {
        debug(`    Registering JS Handler for ${types.map(g => JSNodeTypeLU[g]).join(" ")}`);
        loadJSParseHandler(<any>js_parse_handler, ...(<any>types));
    },

    registerHTMLParserHandler<T = HTMLNode, P = HTMLNode>(
        html_parse_handler: HTMLHandler<T, P>,
        ...types: HTMLNodeType[]
    ) {
        debug(`    Registering HTML Handler for ${types.map(g => HTMLNodeTypeLU[g]).join(" ")}`);
        loadHTMLHandler(<any>html_parse_handler, ...types);
    },

    registerCSSParserHandler() {
        throw Error("registerCSSHookHandler Not Implemented Yet");
    },

    registerHookHandler<InputNodeType, OutputNodeType>(
        hook_handler: HookHandlerPackage<InputNodeType, OutputNodeType>
    ) {
        debug(`    Registering Hook Handler for ${hook_handler.types.map(getExtendTypeName).join(" | ")}`);
        registerHookHandler(hook_handler);
    },

    registerRenderer(renderer) {
        throw Error("registerRenderer Not Implemented Yet");
    }
};

const unregistered_system = {
    registerHookType<T>(extension_name: string, original_type: T) {
        warn("registerHookType system not enabled");
    },

    registerJSParserHandler<T>(js_handler: JSHandler<T>, ...types: T[]) {
        warn("registerJSParserHandler system not enabled");
    },

    registerHTMLParserHandler<T = HTMLNode, P = HTMLNode>(
        html_parse_handler: HTMLHandler<T, P>
    ) {
        warn("registerHTMLParserHandler system not enabled");
    },

    registerCSSParserHandler() {
        throw Error("registerCSSHookHandler Not Implemented Yet");
    },

    registerHookHandler<InputNodeType, OutputNodeType>(
        hook_handler: HookHandlerPackage<InputNodeType, OutputNodeType>
    ) {
        registerHookHandler(hook_handler);
    },

    registerRenderer(renderer) {
        throw Error("registerRenderer Not Implemented Yet");
    }
};
/**
 * Primary build system for wick
 */
const build_system = {
    css: {
        matchAll: (string: string, html: HTMLNode) => tools.rules.matchAll(string, html, css_selector_helpers)
    },
    /**
     * Allows the build system to import a resource and 
     * register it with the active component.
     * 
     * This feature is only available during the parsing of
     * JS and HTML AST nodes using handlers registered with
     * registerJSParserHandler & registerHTMLParserHandler
     * methods.
     */
    importResource: importResource,
    addIndirectHook: addIndirectHook,
    addBindingVariable: addBindingVariable,
    addDefaultValueToBindingVariable: addDefaultValueToBindingVariable,
    addWriteFlagToBindingVariable: addWriteFlagToBindingVariable,
    addNameToDeclaredVariables: addNameToDeclaredVariables,
    addBindingReference: addBindingReference,
    addReadFlagToBindingVariable: addReadFlagToBindingVariable,
    processBindingAsync: processBindingAsync,
    processSecondaryBindingAsync: processSecondaryBindingAsync,
    parseComponentAST: parseComponentAST,
    componentNodeSource: getComponentSourceString,
    /**
     * Process for handling declaration of functions
     */
    processFunctionDeclaration: processFunctionDeclaration,

    /**
     * Takes an Wick JS/TS AST node as an input and incorporates
     * it into the component. 
     * 
     * Only enabled during parse process.
     */
    processJSNode: processJSNode,

    /**
     * Takes an Wick CSS AST node as an input and incorporates
     * it into the component. 
     * 
     * Only enabled during parse process.
     */
    processCSSNode: processWickCSS_AST,

    processNodeAsync: processNodeAsync,

    /**
     * Takes an Wick HTML AST node as an input and incorporates
     * it into the component. 
     * 
     * Only enabled during parse process.
     */
    processHTMLNode: processHTMLNode,


    /**
     * Returns the resolved value of the expression
     * if all variables can be resolved statically.
     * Otherwise returns null.
     * 
     * Only enabled in build contexts.
     */
    getStaticValue: getStaticValue,

    /**
     * Returns the resolved AST of the expression
     * if all variables can be resolved statically.
     * Otherwise returns null.
     * 
     * Only enabled in build contexts.
     */
    getStaticAST: getStaticAST,
    /**
     * Retrieve the HTMLNode at a givin index 
     * 
     * Only enabled in build contexts.
     */
    getElementAtIndex: getElementAtIndex,
    /**
     * Retrieve a binding by name.
     * 
     * Only enabled in build contexts.
     */
    getComponentBinding: getComponentBinding,
    getBindingFromExternalName: getBindingFromExternalName,
    /**
     * Return variable scope requirements do resolve the 
     * expression statically (server side resolution).
     * 
     * Only enabled in build contexts.
     */
    getExpressionStaticResolutionType: getExpressionStaticResolutionType,
    getBindingStaticResolutionType: getBindingStaticResolutionType,

    metrics: metrics,

    js: {

        getFirstReferenceName: getFirstReferenceName,

        /**
         * Parses a JS statement string and returns an AST representation of 
         * the expression, or null if the expression is invalid. 
         */
        stmt: <T = JSNode>(s: string): T => <T><any>stmt(s),
        /**
         * Parses a JS expression and returns an AST representation of 
         * the expression, or null if the expression is invalid. 
         */
        expr: <T = JSNode>(s: string): T => <T><any>exp(s),
    },
    /**
     * Useful tools for debugging.
     */
    debug: {
        /**
         * Logs a js node and after modifying type information to
         * make the resulting tree easier to read.
         * @param node 
         */
        logJSNode: (node: JSNode) => {
            dir(ext(node, true));
        }
    },
    /**
     * Sets the parser token for this node and all its descendants
     */
    setPos: setPos
};
type RegistrationFunction = (system: typeof build_system & typeof registration_system) => void | Promise<void>;


export function enableRegistrationFeatures() {
    Object.assign(build_system, registration_system);
}

let current_name = "";

export function enableInternalRegistrationFeatures() {
    enableRegistrationFeatures();
    Object.assign(build_system, {
        registerJSParserHandler(js_parse_handler: JSHandler<JSNode>, ...types: JSNodeType[]) {
            debug(`    Registering JS Handler for ${types.map(g => JSNodeTypeLU[g] ?? HTMLNodeTypeLU[g]).join(" | ")}`);

            loadJSParseHandlerInternal(js_parse_handler, ...types);
        },

        registerHTMLParserHandler<T = HTMLNode, P = HTMLNode>(
            html_parse_handler: HTMLHandler<T, P>,
            ...types: HTMLNodeType[]
        ) {
            debug(`    Registering HTML Handler for ${types.map(g => HTMLNodeTypeLU[g]).join(" | ")}`);
            loadHTMLHandlerInternal(<any>html_parse_handler, ...types);
        },
    });
}

export function disableRegistrationFeatures() {
    Object.assign(build_system, unregistered_system);
}

let feature_ref_count: Map<string, number> = new Map;
function enable_feature_function(name: string, enable_function: (...args) => any) {

    if (!feature_ref_count.has(name))
        feature_ref_count.set(name, 0);
    const ref_count = feature_ref_count.get(name);
    feature_ref_count.set(name, ref_count + 1);

    if (ref_count == 0)
        build_system[name] = enable_function;
}

function disable_feature_function(name: string, disable_function: (...args) => any) {

    if (!feature_ref_count.has(name))
        return;

    const ref_count = feature_ref_count.get(name);

    feature_ref_count.set(name, ref_count - 1);

    if (ref_count == 1)
        build_system[name] = disable_function;
}

export function enableBuildFeatures() {
    enable_feature_function("addBindingVariable", addBindingVariable);
    enable_feature_function("getStaticValue", getStaticValue);
    enable_feature_function("getElementAtIndex", getElementAtIndex);
    enable_feature_function("getComponentBinding", getComponentBinding);
    enable_feature_function("getExpressionStaticResolutionType", getExpressionStaticResolutionType);
}
export function disableBuildFeatures() {

    disable_feature_function("getStaticValue", () => { trace("getStaticValue is disabled outside of build contexts"); });
    disable_feature_function("getElementAtIndex", () => { trace("getElementAtIndex is disabled outside of build contexts"); });
    disable_feature_function("getComponentBinding", () => { trace("getComponentBinding is disabled outside of build contexts"); });
    disable_feature_function("getExpressionStaticResolutionType", () => { trace("getExpressionStaticResolutionType is disabled outside of build contexts"); });
    disable_feature_function("addBindingVariable", () => { trace("addBindingVariable is disabled outside of parsing contexts"); });
}

export function enableParserFeatures() {
    enable_feature_function("addDefaultValueToBindingVariable", addDefaultValueToBindingVariable);
    enable_feature_function("addBindingVariable", addBindingVariable);
    enable_feature_function("getStaticValue", getStaticValue);
    enable_feature_function("getElementAtIndex", getElementAtIndex);
    enable_feature_function("getComponentBinding", getComponentBinding);
    enable_feature_function("getExpressionStaticResolutionType", getExpressionStaticResolutionType);
    enable_feature_function("importResource", importResource);
    enable_feature_function("addIndirectHook", addIndirectHook);
    enable_feature_function("processJSNode", processJSNode);
    enable_feature_function("processHTMLNode", processHTMLNode);
    enable_feature_function("processBindingAsync", processBindingAsync);
    enable_feature_function("processSecondaryBindingAsync", processSecondaryBindingAsync);
}
export function disableParserFeatures() {
    enable_feature_function("addDefaultValueToBindingVariable", () => { trace("addDefaultValueToBindingVariable is disabled outside of parsing contexts"); });
    disable_feature_function("getStaticValue", () => { trace("getStaticValue is disabled outside of parsing contexts"); });
    disable_feature_function("getElementAtIndex", () => { trace("getElementAtIndex is disabled outside of parsing contexts"); });
    disable_feature_function("getComponentBinding", () => { trace("getComponentBinding is disabled outside of parsing contexts"); });
    disable_feature_function("getExpressionStaticResolutionType", () => { trace("getExpressionStaticResolutionType is disabled outside of parsing contexts"); });
    disable_feature_function("addBindingVariable", () => { trace("addBindingVariable is disabled outside of parsing contexts"); });
    disable_feature_function("importResource", () => { trace("importResource is disabled outside of parsing contexts"); });
    disable_feature_function("addIndirectHook", () => { trace("addIndirectHook is disabled outside of parsing contexts"); });
    disable_feature_function("processJSNode", () => { trace("processJSNode is disabled outside of parsing contexts"); });
    disable_feature_function("processHTMLNode", () => { trace("processHTMLNode is disabled outside of parsing contexts"); });
    disable_feature_function("processBindingAsync", () => { trace("processBindingAsync is disabled outside of parsing contexts"); });
    disable_feature_function("processSecondaryBindingAsync", () => { trace("processSecondaryBindingAsync is disabled outside of parsing contexts"); });
}


var pending_features: {
    register: RegistrationFunction,
    name: string;
}[] = [];

export function registerFeature(
    feature_name: string,
    registration_function: RegistrationFunction
) {

    if (!pending_features)
        pending_features = [];

    //Ensure registry_function is a usable value
    if (typeof registration_function != "function") {
        throw new Error("[registration_function] parameter of registerFeature must be a function.");
    }
    //Ensure feature_name is a usable value
    if (typeof feature_name != "string") {
        throw new Error("[feature_name] parameter of registerFeature must be a string.");
    }

    pending_features.push({ name: feature_name, register: registration_function });
}

export async function loadFeatures() {

    enableInternalRegistrationFeatures();

    for (const { name, register } of pending_features) {
        debug(`Loading feature [${name}]`);
        current_name = name;
        await register(<any>build_system);
    }

    current_name = "";

    disableRegistrationFeatures();

    pending_features.length = 0;
}