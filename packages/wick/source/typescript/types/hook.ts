import { CSSNode, CSSNodeType } from "@candlelib/css";
import { JSNode, JSNodeType, JSStatementClass } from "@candlelib/js";
import { Lexer } from "@candlelib/wind";
import { HookTemplatePackage, HTMLNode, HTMLNodeType } from "./all.js";
import { CompiledComponentClass } from "./class_information";
import { Node, WickBindingNode } from "./wick_ast.js";
import { ComponentData } from '../compiler/common/component.js';
import { Context } from '../compiler/common/context.js';
import { StaticDataPack } from '../compiler/data/static_resolution.js';
export type ExtendedType = CSSNodeType | JSNodeType | HTMLNodeType | number;

interface filterFunction {
    (node: JSNode | CSSNode | HTMLNode | IndirectHook<any>): boolean;
}

type DefaultJSHandlerNodeType = (JSNode | CSSNode | HTMLNode | IndirectHook<any> | undefined | null);

interface buildJSFunction<T, U = T> {
    description?: string;

    (
        /**
         * The root AST node containing the expression 
         * of the binding hook
         */
        node: T,

        /**
         * Static component data including the context object
         */
        static_data_pack: StaticDataPack,

        /**
         * The index number of the ele the hook belongs
         * to, or -1 if the hook has no association with
         * an existing element.
         */
        ele_index: number,

        /**
         * Add code that should execute when one or more
         * binding variable values are modified
         * 
         * Can optionally add any number of BindingIdentifiers
         * that represent binding interests of the ast but
         * are not descendent nodes of the ast. This allows
         * the build system to create code that will activate
         * the ast express when any of the bindings are modified.
         * @param ast
         */
        addOnUpdateAST: (ast: U, ...refs: (T | U)[]) => void,

        /**
         * Add code that should execute when the component
         * is initialized, such as event listeners and
         * context lookups.
         * @param ast
         */
        addOnInitAST: (ast: T | U) => void,

        /**
         * Add code that should execute when the component 
         * instance is destroyed, as in the case when 
         * the component is evacuated from a container
         * @param ast
         */
        addOnDestroy: (ast: T | U) => void
    ): (U | T) | Promise<(U | T)> | null;
}

interface buildHTMLFunction<T = IndirectHook<JSNode>> {
    (
        hook: T,
        /**
         * Static component data including the context object
         */
        static_data_pack: StaticDataPack,
    ): (HookTemplatePackage | null | void | Promise<HookTemplatePackage | null | void>);
}

export interface HookHandlerPackage<T = DefaultJSHandlerNodeType, U = DefaultJSHandlerNodeType> {
    description?: string,
    types: ExtendedType[];
    name: string;
    verify: filterFunction;
    /**
     * Build expression to meet the requirements
     * of the hook value and optionally assign
     * expressions to the Init, Deinit, and Update
     * code paths.
     */
    buildJS: buildJSFunction<T, U>;
    /**
     * Attempt to resolve the value of the hook
     * expression and assign the evaluated value
     * of the expression to the appropriate HTML
     * binding point ( text.data, ele.attribute );
     *
     * Return an HookTemplatePackage or Promise
     * that resolves to a HookTemplatePackage, or
     * null or Promise that resolves to null.
     */
    buildHTML: buildHTMLFunction<T>;
}


/**
 * Any variable within a component that is defined a GLOBAL value that
 * may be produced as the result of the following declaration/references:
 *  - a: Declared within the top most scope of component in a var statement.
 *  - b: Declared within a components import or export statements.
 *  - c: Declared within a components data flow statements describing flow between
 *       a component and its relatives.
 *  - d: Referenced within a binding expression.
 */


export const enum HOOK_TYPE {
    READ = 1,
    WRITE = 2,
    READONLY = 1,
    WRITE_ONLY = 2,
    READ_WRITE = 3
}

export const enum HOOK_SELECTOR {
    ELEMENT_SELECTOR_STRING = "esl",
    WATCHED_FRAME_METHOD_CALL = "wfm",
    METHOD_CALL = "mc",
    IMPORT_FROM_CHILD = "ifc",
    EXPORT_TO_CHILD = "etc",
    IMPORT_FROM_PARENT = "ifp",
    EXPORT_TO_PARENT = "etp",
    INPUT_VALUE = "imp",
    CHECKED_VALUE = "chk",
    CONTAINER_USE_IF = "cui",
    CONTAINER_USE_EMPTY = "cue"
}
/**
 * A hook is a dynamic expressions that handles
 * the update of various objects based on changes
 * to binding variables and hooked objects
 */
export interface IntermediateHook {
    html_element_index: number;
    selector: string;
    host_node: HTMLNode | JSNode;
    hook_value: WickBindingNode | any;
}


export interface ProcessedHook {
    component_variables: Map<string, { name: string; IS_OBJECT: boolean; }>;
    initialize_ast?: JSStatementClass;
    /**
     * Code that accesses the binding value
     */
    read_ast?: JSStatementClass;
    /**
     * Code that assigns a value to the binding
     */
    write_ast?: JSStatementClass;

    cleanup_ast?: JSStatementClass;

    type: HOOK_TYPE;

    pos: Lexer;

    name?: string;

    priority: number;

    IS_ASYNC?: boolean;
}

const enum ProcessedHookType {
    /**
     * Assigns this hooks AST to the initialization 
     * function of the runtime component.
     */
    INITIALIZE = 0,

    /**
     * Assigns this hooks AST to the async initialization 
     * function of the runtime component.
     */
    ASYNC_INITIALIZE = 1,

    /**
     * Assigns this hooks AST to an event driven
     * functions.  This AST may be joined with other 
     * hook ASTs of this type if they bear multiple 
     * dependencies 
     */
    VAR_UPDATE = 2,

    /**
     * Assigns this hooks AST to the de-initialize 
     * function of the runtime component
     */
    DESTROY = 4,
}

export interface ProcessedHookBeta {
    /**
     * The type of the hook. Used to determine the pipeline
     * which will render this hook.
     */
    type: ProcessedHookType;
    ast: JSNode;
}

export interface HookProcessor {
    priority: number;
    canProcessHook(hook_selector: HOOK_SELECTOR | string, node_type: string): boolean;

    processHook(
        hook_selector: HOOK_SELECTOR | string,
        hook_node: WickBindingNode,
        host_ast_node: Node,
        element_index: number,
        component: ComponentData,
        context?: Context,
        class_info?: CompiledComponentClass
    ): ProcessedHook;

    getDefaultHTMLValue(
        hook: IntermediateHook,
        component: ComponentData,
        context: Context,
        model: any,
        parent_component: ComponentData[],
    ): (HookTemplatePackage | Promise<HookTemplatePackage>);
}

/**
 * Indirect Hooks represent binding expressions ASTs that
 * are not directly part of the AST structure of any
 * component frame, and are subsequently incorporated into
 * the compiled component class during the build process.
 */
export interface IndirectHook<T> {

    type: ExtendedType,

    value: T;

    ele_index: number;

    /**
     * Allow the const static resolution of this 
     * hook to replace any dynamic code that may
     * be generated. This requires the static
     * resolution can occur without 
     * referencing any binding variables that 
     * have values that could change within a
     * runtime environnement.
     */
    ALLOW_STATIC_REPLACE: boolean;
}