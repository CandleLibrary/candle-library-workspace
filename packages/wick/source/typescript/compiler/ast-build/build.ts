import { copy, traverse } from "@candlelib/conflagrate";
import {
    JSCallExpression,
    JSFunctionDeclaration,
    JSMethod,
    JSNode,
    JSNodeClass,
    JSNodeType,
    JSNodeType as JST,
    stmt
} from "@candlelib/js";
import {
    BindingVariable,
    BINDING_VARIABLE_TYPE,
    CompiledComponentClass,
    FunctionFrame,
    HTMLNodeClass,
    STATIC_RESOLUTION_TYPE
} from "../../types/all.js";
import { componentDataToCSS } from "../ast-render/css.js";
import {
    htmlTemplateToString
} from "../ast-render/html.js";
import * as b_sys from "../build_system.js";
import {
    Binding_Var_Is_Internal_Variable,
    getBindingStaticResolutionType,
    getCompiledBindingVariableNameFromString,
    getComponentBinding,
    Node_Is_Binding_Identifier
} from "../common/binding.js";
import { setPos } from "../common/common.js";
import { ComponentData } from '../common/component.js';
import { Context } from '../common/context.js';
import {
    appendStmtToFrame,
    createBuildFrame,
    Frame_Has_Statements,
    getStatementsFromRootFrame,
    prependStmtToFrame
} from "../common/frame.js";
import { convertObjectToJSNode } from "../common/js.js";
import {
    BindingIdentifierBinding,
    BindingIdentifierReference
} from "../common/js_hook_types.js";
import { ExpressionIsConstantStatic, getStaticValue, StaticDataPack } from "../data/static_resolution.js";
import { metrics } from '../metrics.js';
import { parse_js_exp } from '../source-code-parse/parse.js';
import {
    addBindingRecord,
    processHookASTs as processResolvedHooks,
    processHookForClass,
    processIndirectHook
} from "./hooks.js";
import { componentDataToCompiledHTML, ensureComponentHasTemplates } from "./html.js";

export async function createComponentTemplates(
    context: Context,
    template_container: Map<string, HTMLElement> = new Map
) {

    const components = context.components;

    if (typeof document != undefined && document.createElement)

        for (const [name, component] of components.entries()) {

            const template = await ensureComponentHasTemplates(component, context);

            if (!template_container.has(name)) {

                const ele = document.createElement("div");

                ele.innerHTML = htmlTemplateToString(template);

                template_container.set(name, <HTMLElement>ele.firstElementChild);
            }
        }
}

/**
 * Produces a compiled component class from 
 * @param component 
 * @param context 
 * @param INCLUDE_HTML 
 * @param INCLUDE_CSS 
 * @returns 
 */
export async function createCompiledComponentClass(
    component: ComponentData,
    context: Context,
    INCLUDE_HTML: boolean = true,
    INCLUDE_CSS: boolean = true
): Promise<CompiledComponentClass> {

    b_sys.enableBuildFeatures();

    const run_tag = metrics.startRun("Class Build");

    try {

        const class_info = createClassInfoObject();

        //HTML INFORMATION
        if (INCLUDE_HTML)
            await processHTML(component, class_info, context);

        //CSS INFORMATION
        if (INCLUDE_CSS)
            processCSS(component, class_info, context);

        //Javascript Information.
        if (component.HAS_ERRORS === false && component.root_frame) {

            const {
                nlu,
                nluf
            } = createLookupTables(class_info);

            for (const hook of component.indirect_hooks)
                await processIndirectHook(component, context, hook, class_info);

            for (const frame of component.frames)
                await processInlineHooks(component, context, frame.ast, class_info);

            processResolvedHooks(component, class_info);

            if (class_info.lfu_table_entries.length > 0)
                prependStmtToFrame(class_info.init_interface_frame, nlu);

            if (class_info.lfu_table_entries.length > 0)
                prependStmtToFrame(class_info.init_interface_frame, nluf);


            // check for any onload frames. This will be converted to the async_init frame. Any
            // statements defined in async_init will prepended to the frames statements. Create
            // a new frame if onload is not present
            const onload_frame: FunctionFrame
                = component.frames.filter(s => s.method_name.toLowerCase() == "onload")[0],
                { root_frame } = component;

            const out_frames = [...class_info.method_frames, ...component.frames.filter(
                f => (f != onload_frame) && (f != root_frame)
            )];

            if (onload_frame)
                prependStmtToFrame(class_info.async_init_frame, ...onload_frame.ast.nodes[2].nodes);

            if (root_frame.IS_ASYNC)
                appendStmtToFrame(class_info.async_init_frame, ...getStatementsFromRootFrame(root_frame));
            else
                appendStmtToFrame(class_info.init_frame, ...getStatementsFromRootFrame(root_frame));

            //Ensure there is an async init method
            for (const function_block of out_frames)
                await makeComponentMethod(function_block, component, class_info, context);

        }

        // Remove methods 
        return class_info;

    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        metrics.endRun(run_tag);
        b_sys.disableBuildFeatures();
    }
}

function processCSS(
    component: ComponentData,
    class_info: CompiledComponentClass,
    context: Context
) {
    let style;

    const run_tag = metrics.startRun("CSS");

    if (style = componentDataToCSS(component)) {

        const frame = createBuildFrame("getCSS");
        class_info.method_frames.push(frame);
        appendStmtToFrame(frame, stmt(`return \`${style}\`;`));

        appendStmtToFrame(class_info.init_frame, stmt(`this.setCSS()`));
    }

    metrics.endRun(run_tag);
}

async function processHTML(
    component: ComponentData,
    class_info: CompiledComponentClass,
    context: Context
) {
    const run_tag = metrics.startRun("HTML");

    if (component.HTML) {
        const
            frame = createBuildFrame("ce"),
            return_stmt = stmt("return this.makeElement(a);"),
            { html: [html] } = (await componentDataToCompiledHTML(component, context));

        return_stmt.nodes[0].nodes[1].nodes[0]
            = parse_js_exp(`\`${htmlTemplateToString(html).replace(/(\`)/g, "\\\`")}\``);

        appendStmtToFrame(frame, return_stmt);

        class_info.method_frames.push(frame);
    }

    metrics.endRun(run_tag);
}

function createLookupTables(class_info: CompiledComponentClass) {

    const run_tag = metrics.startRun("Look Up Tables");

    const
        binding_lu = stmt("c.nlu = {};"),
        binding_function_lu = stmt("c.lookup_function_table = [];"),
        { nodes: [{ nodes: [, lu_functions] }] } = binding_function_lu,
        { nodes: [{ nodes: [, lu_public_variables] }] } = binding_lu;

    class_info.nluf_public_variables = <any>lu_functions;

    class_info.lfu_table_entries = <any[]>lu_functions.nodes;

    class_info.lu_public_variables = <any[]>lu_public_variables.nodes;

    metrics.endRun(run_tag);

    return { nlu: binding_lu, nluf: binding_function_lu };

}


export function createClassInfoObject(): CompiledComponentClass {

    const
        binding_setup_frame = createBuildFrame("c", ""),
        init_interface_frame = createBuildFrame("init_interfaces", "c"),
        init_frame = createBuildFrame("init", "c"),
        async_init_frame = createBuildFrame("async_init"),
        terminate_frame = createBuildFrame("terminate"),
        class_info: CompiledComponentClass = {
            methods: <any>[],
            binding_setup_frame,
            init_frame,
            async_init_frame,
            init_interface_frame,
            terminate_frame,
            nluf_public_variables: null,
            lfu_table_entries: [],
            lu_public_variables: [],
            write_records: [],
            binding_records: new Map(),
            method_frames: [async_init_frame, init_frame, init_interface_frame, binding_setup_frame],
            nlu_index: 0,
        };

    async_init_frame.IS_ASYNC = true;

    return class_info;
}

export async function processInlineHooks(
    comp: ComponentData,
    context: Context,
    ast: JSNode,
    class_info: CompiledComponentClass,
) {
    const run_tag = metrics.startRun("Function Frames");

    for (const { node, meta: { mutate, skip } } of traverse(<JSNode>ast, "nodes")
        .makeMutable()
        .makeSkippable()
    ) {
        if (
            //@ts-ignore
            node.type == BindingIdentifierBinding
            ||
            //@ts-ignore
            node.type == BindingIdentifierReference
        ) {

            await addBindingRecord(class_info, node.value, comp);

        } else if (node.type > 0xFFFFFFFF) {

            const new_node
                = await processHookForClass(node, comp, context, class_info, -1, false);

            if (new_node != node)
                mutate(new_node);

            skip();

            continue;
        }
    }

    metrics.endRun(run_tag);
}



/**
 * Create new AST that has all undefined references converted to binding
 * lookups or static values.
 */
async function makeComponentMethod(
    frame: FunctionFrame,
    component: ComponentData,
    ci: CompiledComponentClass,
    context: Context
) {

    if (frame.ast && !frame.IS_ROOT) {

        ////Do not create empty functions
        if (!Frame_Has_Statements(frame))
            return;

        const cpy: JSFunctionDeclaration | JSMethod = <any>copy(frame.ast);

        const { NEED_ASYNC } = await finalizeBindingExpression(cpy, component, ci, context);

        cpy.ASYNC = NEED_ASYNC || frame.IS_ASYNC || cpy.ASYNC;

        cpy.type = JST.Method;

        if (frame.index != undefined)
            //@ts-ignore
            cpy.nodes[0].value = `f${frame.index}`;


        ci.methods.push(cpy);
    }
}



/**
 * Converts ComponentBinding expressions and identifers into class based reference expressions.
 * 
 * @param mutated_node 
 * @param component 
 */
export async function finalizeBindingExpression(
    mutated_node: JSNode,
    component: ComponentData,
    comp_info: CompiledComponentClass,
    context: Context,
    self_ref: string = "this"
): Promise<{
    ast: JSNode,
    NEED_ASYNC: boolean;
}> {
    const run_tag = metrics.startRun("Component Build - Binding Expressions");

    const static_data_pack: StaticDataPack = {
        context,
        parent: null,
        self: component,
        model: null,
        prev: null,
        root_element: component.HTML
    };
    const lz = { ast: null };
    let NEED_ASYNC = false;
    for (const { node, meta: { mutate, skip } } of traverse(mutated_node, "nodes")
        .extract(lz)
        .makeMutable((
            parent,
            child,
            child_index,
            children,
            replaceParent
        ) => {
            if (child == null) {

                if (
                    (parent.type &
                        (
                            JSNodeClass.UNARY_EXPRESSION
                            | JSNodeClass.TERNARY_EXPRESSION
                        )


                        || parent.type == JSNodeType.AssignmentExpression
                        || parent.type == JSNodeType.PropertyBinding
                        || parent.type == JSNodeType.VariableStatement
                        || parent.type == JSNodeType.BindingExpression
                        || parent.type == JSNodeType.MemberExpression
                        || parent.type == JSNodeType.SpreadExpression
                        || parent.type == JSNodeType.Parenthesized
                        || parent.type == JSNodeType.ExpressionStatement)
                )
                    return null;


                if (parent.type == JSNodeType.Arguments && children.length <= 1) {
                    replaceParent();
                    return null;
                }

                if (parent.type == JSNodeType.CallExpression) {
                    return null;
                }

                if (parent.type == JSNodeType.ExpressionList
                    && child_index == 0
                    && children.length <= 1) {
                    return null;
                }

                if (parent.type & JSNodeClass.BINARY_EXPRESSION) {
                    replaceParent();
                    return children[1 - child_index];
                }
            }

            return parent ? Object.assign({}, parent) : null;
        })
        .makeSkippable()
    ) {
        if (node.type & HTMLNodeClass.HTML_ELEMENT) {
            mutate(<any>parse_js_exp("'TODO: Setup element integration'"));
        } else switch (node.type) {

            case JST.IdentifierBinding: case JST.IdentifierReference:
                /**
                 * Convert convenience names to class property accessors
                 */
                if (node.value.slice(0, 5) == ("$$ele")) {
                    mutate(<any>parse_js_exp(`${self_ref}.elu[${node.value.slice(5)}][0]`));
                    skip();
                } else if (node.value.slice(0, 5) == ("$$ctr")) {
                    mutate(<any>parse_js_exp(`${self_ref}.ctr[${node.value.slice(5)}]`));
                    skip();
                } else if (node.value.slice(0, 4) == ("$$ch")) {
                    mutate(<any>parse_js_exp(`${self_ref}.ch[${node.value.slice(4)}]`));
                    skip();
                } else if (node.value.slice(0, 4) == "$$bi") {
                    const binding = getComponentBinding(node.value.slice(4), component);
                    mutate(<any>parse_js_exp(`${binding.class_index}`));
                    skip();
                }

                break;

            case JST.AwaitExpression:
                NEED_ASYNC = true;
                break;

            //case JSNodeType.ComponentBindingIdentifier
            case BindingIdentifierBinding: case BindingIdentifierReference:
                //@ts-ignore
                let new_node = null;
                const
                    name = <string>node.value,
                    binding = getComponentBinding(name, component);
                if (
                    binding.type == BINDING_VARIABLE_TYPE.TEMPLATE_CONSTANT
                    ||
                    binding.type == BINDING_VARIABLE_TYPE.CONFIG_GLOBAL
                    ||
                    (
                        binding.type == BINDING_VARIABLE_TYPE.CONST_INTERNAL_VARIABLE
                        &&
                        bindingIsConstStatic(binding, static_data_pack)
                    )
                ) {
                    const { value } = await getStaticValue(<any>node, static_data_pack);

                    new_node = convertObjectToJSNode(value);
                } else {

                    const id = parse_js_exp(
                        <string>getCompiledBindingVariableNameFromString(
                            name, component, comp_info, self_ref
                        )
                    );

                    new_node = setPos(id, node.pos);

                    if (!component.root_frame.binding_variables?.has(<string>name)) {
                        if (node.pos)
                            node.pos.throw(`Undefined reference to ${name}`);
                        else throw new Error(`Undefined reference to ${name}`);
                    }
                }

                mutate(<any>new_node);

                break;

            case JST.PreExpression: case JST.PostExpression:
                //@ts-ignore
                if (Node_Is_Binding_Identifier(node.nodes[0])) {

                    const
                        [ref] = node.nodes,
                        //@ts-ignore
                        name = <string>ref.value,
                        comp_var: BindingVariable = getComponentBinding(name, component);

                    if (Binding_Var_Is_Internal_Variable(comp_var)) {


                        const update_action =

                            comp_var.type == BINDING_VARIABLE_TYPE.ATTRIBUTE_VARIABLE
                                ? "fua" : "ua",

                            index = comp_info.binding_records.get(name).index,

                            comp_var_name: string =
                                getCompiledBindingVariableNameFromString(
                                    name, component, comp_info, self_ref
                                ) || "",

                            assignment: JSCallExpression = <any>parse_js_exp(
                                `${self_ref}.${update_action}(${index})`
                            ),

                            exp_ = parse_js_exp(`${comp_var_name}${node.symbol[0]}1`),

                            { ast, NEED_ASYNC: NA } =
                                await finalizeBindingExpression(
                                    <JSNode>ref, component, comp_info, context, self_ref
                                );

                        NEED_ASYNC = NA || NEED_ASYNC;

                        exp_.nodes[0] = <any>ast;

                        assignment.nodes[1].nodes.push(<any>exp_);

                        if (node.type == JST.PreExpression)
                            assignment.nodes[1].nodes.push(
                                <any>parse_js_exp("true")
                            );

                        mutate(setPos(assignment, node.pos));

                        skip();
                    }
                }
                break;

            case JST.AssignmentExpression:

                //@ts-ignore
                if (Node_Is_Binding_Identifier(node.nodes[0])) {
                    const
                        [ref, value] = node.nodes,
                        //@ts-ignore
                        name = <string>ref.value,
                        comp_var: BindingVariable = getComponentBinding(name, component);

                    if (ExpressionIsConstantStatic(ref, static_data_pack)) {
                        mutate(null);
                        continue;
                    }

                    //Directly assign new value to model variables
                    if (Binding_Var_Is_Internal_Variable(comp_var)) {

                        const update_action =
                            comp_var.type == BINDING_VARIABLE_TYPE.ATTRIBUTE_VARIABLE
                                ? "fua" : "ua";

                        const index = comp_info.binding_records.get(name).index,

                            assignment: JSCallExpression = <any>parse_js_exp(
                                `${self_ref}.${update_action}(${index})`
                            ),

                            { ast: a1, NEED_ASYNC: NA1 } =
                                await finalizeBindingExpression(
                                    ref, component, comp_info, context, self_ref
                                ),

                            { ast: a2, NEED_ASYNC: NA2 } =
                                await finalizeBindingExpression(
                                    <JSNode>value, component, comp_info, context, self_ref
                                );

                        NEED_ASYNC = NA1 || NA2 || NEED_ASYNC;

                        node.nodes = [<any>a1, <any>a2];

                        if (node.symbol == "=") {
                            assignment.nodes[1].nodes.push(node.nodes[1]);
                        } else {

                            //@ts-ignore
                            node.symbol = node.symbol.slice(0, 1);
                            assignment.nodes[1].nodes.push(node);
                        }

                        mutate(setPos(assignment, node.pos));

                        skip();
                    }
                }
                break;
        }
    }

    metrics.endRun(run_tag);

    return { ast: lz.ast, NEED_ASYNC };
}
function bindingIsConstStatic(binding: BindingVariable, static_data_pack: StaticDataPack): boolean {
    return getBindingStaticResolutionType(binding, static_data_pack)
        ==
        STATIC_RESOLUTION_TYPE.CONSTANT_STATIC;
}

