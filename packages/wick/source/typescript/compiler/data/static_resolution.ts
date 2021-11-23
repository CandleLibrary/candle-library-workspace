import { traverse } from "@candlelib/conflagrate";
import {
    exp,
    JSExpressionClass,
    JSIdentifier,
    JSNode,
    JSNodeClass,
    JSNodeType,
    renderCompressed,
    tools
} from "@candlelib/js";
import {
    BindingVariable, BINDING_VARIABLE_TYPE, HTMLElementNode, HTMLNodeClass, Node, PLUGIN_TYPE,
    STATIC_RESOLUTION_TYPE, HookTemplatePackage
} from "../../types/all.js";
import {
    getBindingStaticResolutionType,
    getCompiledBindingVariableNameFromString,
    getComponentBinding,
    haveStaticPluginForRefName,
    Is_Statically_Resolvable_On_Server
} from '../common/binding.js';
import { ComponentData } from '../common/component.js';
import { Context } from '../common/context.js';
import { Is_Extend_Type, registerHookType } from '../common/extended_types.js';
import { AttributeHook, getAttribute } from '../common/html.js';
import { convertObjectToJSNode } from "../common/js.js";
import { BindingIdentifierBinding, BindingIdentifierReference } from "../common/js_hook_types.js";
import { parse_js_exp } from '../source-code-parse/parse.js';
import { AsyncFunction } from './AsyncFunction.js';


export interface StaticDataPack {
    root_element?: HTMLElementNode;
    self: ComponentData;
    model: object | null;
    context: Context;
    prev: StaticDataPack | null;

}

export async function getStaticAST(
    input_ast: JSNode & { cache_data: any; },
    static_data_pack: StaticDataPack,
    ASSUME_RUNTIME: boolean = false,
    ref: any = null
) {

    const input_args = new Map;

    return await getStaticValueAstFromSourceAST(
        input_ast, static_data_pack, ASSUME_RUNTIME, input_args
    );
}

/**
 * Retrieves the real default value of the given binding,
 * or returns null.
 */
export async function getStaticValue(
    input_ast: Node & { cache_data: any; },
    static_data_pack: StaticDataPack,
    ASSUME_RUNTIME: boolean = false,
    ref: any = null
): Promise<HookTemplatePackage> {

    const input_args = new Map;

    const ast = await getStaticValueAstFromSourceAST(
        input_ast, static_data_pack, ASSUME_RUNTIME, input_args
    );

    let html = null, value = null;

    if (ast) {
        if (ast.type & HTMLNodeClass.HTML_ELEMENT) {
            html = ast;
        } else {

            const data_string = renderCompressed(<any>ast);
            try {


                if (data_string)
                    if (ast.type == JSNodeType.ArrowFunction) {

                        const { ASYNC } = ast;

                        let fn = ASYNC
                            ? AsyncFunction(`return (${data_string})(...arguments)`)
                            : Function(`return (${data_string})(...arguments)`);

                        const data = await fn({
                            parseDir: () => []
                        });

                        value = data;
                    } else {
                        value = Function(...input_args.keys(), `return (${data_string})`)(...input_args.values());
                    }

                if (typeof value == "object"
                    && "type" in value
                    && (value.type & HTMLNodeClass.HTML_ELEMENT)
                ) {
                    html = value; value = null;
                }

            } catch (e) {
                // Keep these errors quiet - An error here simply means
                // That this expression will not be able to be resolved 
                // statically.
                // console.log(data_string);
                // console.error(e);
            }
        }
    }

    return { value, html };
}


/**
 * Returns a STATIC_RESOLUTION_TYPE value representing the static resolution
 * requirements of the expression.
 *
 * @param ast - A valid JSNode AST object
 *
 * @param comp  - A ComponentData object that can resolutions on binding variables
 *                that may be references in the ast.
 *
 * @param context - A Presets object that can provide resolution on plugin module
 *                  references within the ast.
 *
 * @param m - An optional empty Set that will be used to record all module bindings that
 *            are referenced in the ast.
 *
 * @param g - An optional empty Set that will be used to record all global reference bindings
 *            that are referenced in the ast.
 *
 * @returns {STATIC_RESOLUTION_TYPE}
 */

export function getExpressionStaticResolutionType(
    ast: JSNode,
    static_data_pack: StaticDataPack,
    m: Set<BindingVariable> | null = null,
    g: Set<BindingVariable> | null = null
): STATIC_RESOLUTION_TYPE {


    let type: number = STATIC_RESOLUTION_TYPE.CONSTANT_STATIC;

    for (const { node, meta } of traverse(ast, "nodes").makeSkippable()) {

        if (type == STATIC_RESOLUTION_TYPE.INVALID)
            break;

        switch (node.type) {

            case BindingIdentifierBinding: case BindingIdentifierReference:

                const name = tools.getIdentifierName(node);

                let binding = getComponentBinding(name, static_data_pack.self);

                type |= getBindingStaticResolutionType(binding, static_data_pack, m, g);

                break;

            case JSNodeType.ArrowFunction:


                for (const n of node.nodes)
                    type |= getExpressionStaticResolutionType(<any>n, static_data_pack, m, g);

                break;

            case JSNodeType.CallExpression: {

                const [name_node] = <JSIdentifier[]>node.nodes;

                if ((name_node.type & JSNodeClass.IDENTIFIER) > 0) {
                    if (haveStaticPluginForRefName(<string>name_node.value, static_data_pack.context)) {
                        for (const n of node.nodes.slice(1)) {
                            type |= getExpressionStaticResolutionType(n, static_data_pack, m, g);
                            meta.skip();
                        }
                    }
                }
            } break;

            case JSNodeType.FunctionDeclaration:
                type |= STATIC_RESOLUTION_TYPE.INVALID;
                break;

            default:

                if (Is_Extend_Type(node.type)) {
                    type |= STATIC_RESOLUTION_TYPE.INVALID;
                }
        }
    }


    return type;
}

export async function getDefaultBindingValueAST(
    name: string,
    static_data_pack: StaticDataPack,
    ASSUME_RUNTIME: boolean = false,
    node_lookups: Map<string, Node>
): Promise<JSExpressionClass | undefined> {

    const { self: comp, context, model } = static_data_pack;

    const binding = getComponentBinding(name, comp);

    if (binding) {

        if (binding.type == BINDING_VARIABLE_TYPE.CONSTANT_DATA_SOURCE) {

            if (binding.source_location?.ext == "json") {

                const value = await context.getDataSource(binding.source_location);

                return <any>convertObjectToJSNode(value?.[binding.external_name]);

            }

        } else if (binding.type == BINDING_VARIABLE_TYPE.CONFIG_GLOBAL) {
            if (context.globals)
                return await <any>convertObjectToJSNode(context.globals[binding.external_name]);

        } else if (binding.type == BINDING_VARIABLE_TYPE.TEMPLATE_CONSTANT) {

            if (context.active_template_data)
                return await <any>convertObjectToJSNode(context.active_template_data[binding.external_name]);

        } else if (binding.type == BINDING_VARIABLE_TYPE.ATTRIBUTE_VARIABLE) {

            //check current attributes on the guest element for any values

            const external_name = binding.external_name;
            //check the guest ast for the attribute bound to this name
            const attrib = getAttribute(external_name, static_data_pack.root_element);

            if (attrib) {

                return <any>attrib.value ?
                    <any>convertObjectToJSNode(attrib.value)
                    :
                    exp("true");

            } else if (static_data_pack.root_element && static_data_pack?.prev) {

                const parent = static_data_pack?.prev?.self;
                const index = static_data_pack.root_element.id;


                for (const hook of (<ComponentData><any>parent).indirect_hooks.filter(h => h.type == AttributeHook)) {
                    if (
                        hook.ele_index == index &&
                        hook.value[0].name == external_name
                    ) {
                        return <any>await getStaticValueAstFromSourceAST(
                            <any>hook.value[0].nodes[0],
                            static_data_pack.prev, // <- Ensure we are working within the parent scope
                            ASSUME_RUNTIME,
                            node_lookups
                        );
                    }
                }
            }

            //Use the component's own model to fulfill this variable
            if (model)
                return await <any>convertObjectToJSNode(model[binding.external_name]);

        } else if ((
            binding.type == BINDING_VARIABLE_TYPE.MODEL_VARIABLE
            ||
            binding.type == BINDING_VARIABLE_TYPE.UNDECLARED)) {

            if (model)
                return await <any>convertObjectToJSNode(model[binding.external_name]);

        } else if (binding.type == BINDING_VARIABLE_TYPE.GLOBAL_VARIABLE) {

            if (globalThis[name])
                return <JSExpressionClass>exp(name);

        } else if (ASSUME_RUNTIME
            && (
                binding.type == BINDING_VARIABLE_TYPE.MODULE_MEMBER_VARIABLE
                ||
                binding.type == BINDING_VARIABLE_TYPE.MODULE_VARIABLE
            )) {
            return <JSExpressionClass>exp(getCompiledBindingVariableNameFromString(binding.external_name, comp));

        } else if (ASSUME_RUNTIME) {
            if (getBindingStaticResolutionType(binding, static_data_pack) != STATIC_RESOLUTION_TYPE.INVALID)
                return <any>await getStaticValueAstFromSourceAST(
                    <any>binding.default_val,
                    static_data_pack,
                    ASSUME_RUNTIME,
                    node_lookups
                );
        } else if (Is_Statically_Resolvable_On_Server(binding, static_data_pack)) {

            return await <any>getStaticValueAstFromSourceAST(
                <any>binding.default_val,
                static_data_pack,
                false,
                node_lookups
            );

        }
    }

    return undefined;
}

/**
 * Returns a JSNode AST that represents the resolved value
 * of the node after taking into account BindingVariable references
 * and plugin return values.
 *
 * If ANY value cannot be resolved then undefined is returned instead
 * of a JSNode
 */

export async function getStaticValueAstFromSourceAST(
    input_node: Node,
    static_data_pack: StaticDataPack,
    ASSUME_RUNTIME: boolean = false,
    node_lookups: Map<string, Node>
): Promise<Node | undefined> {

    const { context, self: comp } = static_data_pack;

    const receiver = { ast: null };

    for (const { node, meta } of traverse(input_node, "nodes")
        .makeSkippable()
        .makeReplaceable()
        .extract(receiver)) {

        if (node.type & HTMLNodeClass.HTML_ELEMENT) {

            const name = "$" + node_lookups.size;

            node_lookups.set(name, node);

            meta.replace(<any>parse_js_exp(name));

            meta.skip();

        } else if (node.type == JSNodeType.PostExpression || node.type == JSNodeType.PreExpression) {

            const val = await getStaticValueAstFromSourceAST(
                <any>node.nodes[0],
                static_data_pack,
                ASSUME_RUNTIME,
                node_lookups
            );

            if (val === undefined)
                return undefined;

            meta.replace(val);

        } else if (node.type == JSNodeType.CallExpression) {

            const name = tools.getIdentifierName(node);

            if (haveStaticPluginForRefName(name, context)) {
                const vals = [];

                for (const n of node.nodes.slice(1)) {

                    const val = await getStaticValueAstFromSourceAST(
                        n,
                        static_data_pack,
                        ASSUME_RUNTIME,
                        node_lookups
                    );

                    if (val === undefined)
                        return undefined;

                    vals.push(val);
                }

                const val = await context.plugins.getPlugin(
                    PLUGIN_TYPE.STATIC_DATA_FETCH,
                    name
                )
                    .serverHandler?.(context, ...vals.map(v => eval(renderCompressed(v))));

                meta.replace(<JSNode>convertObjectToJSNode(val));
            }

        } else if (node.type == BindingIdentifierBinding
            || node.type == BindingIdentifierReference) {



            const name = tools.getIdentifierName(<any>node);

            /**
             * Only accept references whose value can be resolved through binding variable
             * resolution.
             */
            if (comp.root_frame.binding_variables?.has(name)) {

                const val = <any>await getDefaultBindingValueAST(
                    name,
                    static_data_pack,
                    ASSUME_RUNTIME,
                    node_lookups
                );

                if (val === undefined)
                    return undefined;

                if (val && val.type == JSNodeType.ObjectLiteral)
                    meta.replace({
                        type: JSNodeType.Parenthesized,
                        nodes: [val],
                        pos: val.pos
                    });

                else
                    meta.replace(val);
            }
            else {
                return undefined;
            }
        }
    }

    return <any>receiver.ast;
}


export function ExpressionIsConstantStatic(node: JSNode, static_data_pack: StaticDataPack) {

    const resolution_type = getExpressionStaticResolutionType(node, static_data_pack);

    return (resolution_type ^ STATIC_RESOLUTION_TYPE.CONSTANT_STATIC) == 0;
}