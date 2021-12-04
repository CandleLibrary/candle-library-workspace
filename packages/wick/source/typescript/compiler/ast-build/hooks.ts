import { bidirectionalTraverse, copy, traverse, TraverseState } from "@candlelib/conflagrate";
import { exp, JSNode, stmt } from "@candlelib/js";
import {
    BindingVariable, BINDING_FLAG,
    BINDING_VARIABLE_TYPE,
    CompiledComponentClass,
    HookTemplatePackage,
    IndirectHook,
    Node,
    STATIC_RESOLUTION_TYPE
} from "../../types/all.js";
import { ExtendedType } from "../../types/hook";
import { getHookHandlers } from '../build_system.js';
import {
    Binding_Var_Is_Directly_Accessed,
    getBindingStaticResolutionType,
    getComponentBinding,
    getExternalName,
    Name_Is_A_Binding_Variable
} from "../common/binding.js";
import { getExpressionStaticResolutionType, getStaticValue, getStaticValueAstFromSourceAST, StaticDataPack } from "../data/static_resolution.js";
import {
    appendStmtToFrame,
    createBuildFrame,
    Frame_Has_Statements,
    getStatementsFromFrame
} from "../common/frame.js";
import { ErrorHash } from "../common/hash_name.js";
import { convertObjectToJSNode, Expression_Contains_Await, getPropertyAST } from "../common/js.js";
import { BindingIdentifierBinding, BindingIdentifierReference } from "../common/js_hook_types.js";
import { ComponentData } from '../common/component.js';
import { Context } from '../common/context.js';


export function addIndirectHook<T>(
    comp: ComponentData,
    type: ExtendedType,
    ast: T,
    ele_index: number = -1,
    ALLOW_STATIC_REPLACE: boolean = false
) {
    comp.indirect_hooks.push(<IndirectHook<T>>{
        type,
        value: Array.isArray(ast)
            ? ast
            : [ast],
        ele_index,
        ALLOW_STATIC_REPLACE
    });
}

/**
 * Updates binding variables
 * @param root_node 
 * @param component 
 * @param hook 
 * @returns {string[]}
 */
export function collectBindingReferences(ast: JSNode, component: ComponentData): string[] {

    const bindings: Set<string> = new Set;

    for (const { node, meta: { parent } } of traverse(ast, "nodes")) {

        if (node.type == BindingIdentifierBinding || node.type == BindingIdentifierReference) {

            if (!Name_Is_A_Binding_Variable(node.value, component.root_frame))
                continue;

            bindings.add(<string>node.value);
        }
    }

    return [...bindings.values()].sort();
}

export async function processIndirectHook(
    comp: ComponentData,
    context: Context,
    indirect_hook: IndirectHook<any>,
    class_info: CompiledComponentClass,
    /**
     * If true, bindings that can be completely resolved server
     * side will not have any JS code generated 
     */
    ALLOW_STATIC_REPLACE = false
) {
    await processHookForClass(
        indirect_hook,
        comp,
        context,
        class_info,
        indirect_hook.ele_index,
        indirect_hook.ALLOW_STATIC_REPLACE
        && ALLOW_STATIC_REPLACE
    );
}

export async function processHookForHTML(
    indirect_hook: IndirectHook<any>,
    sdp: StaticDataPack

): Promise<HookTemplatePackage | null> {

    var pkg: HookTemplatePackage | null = { value: null, html: null, templates: null };
    //@ts-ignore

    for (const handler of getHookHandlers()) {

        if (handler.types.includes(indirect_hook.type) && handler.verify(indirect_hook)) {

            let
                result = handler.buildHTML(copy(indirect_hook), sdp);

            if (result instanceof Promise)
                result = await result;

            if (result === undefined)
                continue;

            pkg = result;

            break;
        }
    }


    return pkg;
}

export async function processHookForClass(
    ast: Node | IndirectHook<any>,

    component: ComponentData,

    context: Context,

    class_info: CompiledComponentClass,
    /**
     * The index of the component element which the hook ast affects. 
     */
    element_index: number = -1,

    ALLOW_STATIC_REPLACE: boolean = false
) {

    const
        extract = { ast: null },
        pending_write_asts = [],
        pending_init_asts = [],
        pending_destroy_asts = [];

    /**
     * Code that should execute when one or more 
     * binding variable values are modified
     * @param ast 
     */
    function addOnBindingUpdateAst(ast: JSNode, ...meta_binding_nodes: any[]) {
        pending_write_asts.push({
            ast, meta_binding_nodes: meta_binding_nodes
        });
    }

    /**
     * Code that should execute when one or more 
     * binding variable values are modified
     * @param ast 
     */
    function addInitAST(ast: JSNode) { pending_init_asts.push(ast); }

    /**
     * Code that should execute when one or more 
     * binding variable values are modified
     * @param ast 
     */
    function addDestroyAST(ast: JSNode) { pending_destroy_asts.push(ast); }


    const static_data_pack: StaticDataPack = {
        self: component,
        model: null,
        context: context,
        parent: null,
        prev: null,
        root_element: component.HTML
    };


    //@ts-ignore
    for (const { node, meta } of bidirectionalTraverse(copy(ast), "nodes")
        .makeMutable()
        .makeSkippable()
        .extract(extract)
    ) {

        if (meta.traverse_state == TraverseState.LEAF || meta.traverse_state == TraverseState.EXIT)

            for (const handler of getHookHandlers()) {

                if (handler.types.includes(node.type) && handler.verify(node)) {

                    let
                        result = await handler.buildJS(
                            node,
                            static_data_pack,
                            element_index,
                            addOnBindingUpdateAst,
                            addInitAST,
                            addDestroyAST
                        );

                    if (result instanceof Promise)
                        result = await result;

                    if (result === undefined)
                        continue;

                    if (result != node)
                        meta.mutate(<any>result);

                    break;
                }
            }
    }

    for (const ast of pending_init_asts) {


        const
            component_variables = collectBindingReferences(ast, component);


        // Create BendingDepend AST Node, set the index and add to list of binding depends

        // If the AST is a simple binding identifier, then don't bother adding to the frame,
        // the purpose of such ASTs is to register the appropriate binding identify for use
        // within the component class.
        if ((ast.type != BindingIdentifierBinding && ast.type != BindingIdentifierReference))
            appendStmtToFrame(class_info.init_frame, ast);

        // Update pending binding records 
        for (const name of component_variables)
            await addBindingRecord(class_info, name, component);
    }

    for (const { ast, meta_binding_nodes } of pending_write_asts) {


        // Check the hooks AST to determine if it is 
        // statically resolvable with constant values only

        if (
            ALLOW_STATIC_REPLACE &&
            getExpressionStaticResolutionType(ast, static_data_pack)
            ==
            STATIC_RESOLUTION_TYPE.CONSTANT_STATIC
        )
            continue;



        // Convert runtime static variables to prevent 
        // creating runtime class objects for the binding

        for (const { node, meta: { mutate } } of traverse(ast, "nodes").makeMutable()
            .filter("type", BindingIdentifierBinding, BindingIdentifierReference)
        ) {
            const name = node.value;

            const binding = component.root_frame.binding_variables.get(name);

            if (
                false &&
                ((binding.type == BINDING_VARIABLE_TYPE.CONST_INTERNAL_VARIABLE)
                    &&
                    (
                        getBindingStaticResolutionType(binding, static_data_pack)
                        &
                        (STATIC_RESOLUTION_TYPE.WITH_MODEL | STATIC_RESOLUTION_TYPE.WITH_PARENT)
                    ) == 0)
                ||
                //Template constants should always be resolved
                binding.type == BINDING_VARIABLE_TYPE.TEMPLATE_CONSTANT
            ) {

                const { value } = await getStaticValue(node, static_data_pack, true);

                if (value)
                    mutate(convertObjectToJSNode(value));
            }
        }

        const
            component_variables = [

                ...collectBindingReferences(ast, component),
                ...meta_binding_nodes.flatMap(n => collectBindingReferences(n, component))
            ],

            NO_LOCAL_BINDINGS = component_variables
                .map(v => component.root_frame.binding_variables.get(v))
                .every(Binding_Var_Is_Directly_Accessed),

            HAS_ASYNC = Expression_Contains_Await(ast);

        // Create BendingDepend AST Node, set the index and add to list of binding depends
        // Update pending binding records 
        if ((ast.type != BindingIdentifierBinding && ast.type != BindingIdentifierReference))
            class_info.write_records.push({ ast, component_variables, HAS_ASYNC, NO_LOCAL_BINDINGS });

        for (const name of component_variables)
            await addBindingRecord(class_info, name, component);
    }

    return extract.ast;
};
export function processHookASTs(comp: ComponentData, comp_info: CompiledComponentClass) {

    const hash_groups: Map<string, CompiledComponentClass["write_records"][0][]> = new Map();

    let binding_join_index = comp_info.binding_records.size;

    for (const record of comp_info.write_records) {

        if (record.NO_LOCAL_BINDINGS /*&& Runtime_Required */) {

            //Push record to init
            if (record.HAS_ASYNC)
                appendStmtToFrame(comp_info.async_init_frame, record.ast);
            else
                appendStmtToFrame(comp_info.init_frame, record.ast);
        } else {
            const hash = ErrorHash("" + record.HAS_ASYNC + record.NO_LOCAL_BINDINGS + record.component_variables.join());

            if (!hash_groups.has(hash))
                hash_groups.set(hash, []);

            hash_groups.get(hash).push(record);
        }
    }

    for (const group of hash_groups.values()) {

        const representative = group[0];

        if (representative.component_variables.length <= 1) {
            //Add statements directly to binding variable

            for (const record of representative.component_variables.map(n => comp_info.binding_records.get(n)))
                if (record) {
                    const { nodes } = record;
                    for (const member of group)
                        nodes.push(member.ast);
                }

        } else {
            // Create a group function that will auto update when every 
            // dependent binding variable has value
            const name = "b" + binding_join_index;
            const frame = createBuildFrame(name, "f, c");

            frame.IS_ASYNC = !!representative.HAS_ASYNC;

            const ids = representative.component_variables
                .filter(v => (
                    comp.root_frame.binding_variables.get(v).type &
                    (
                        BINDING_VARIABLE_TYPE.INTERNAL_VARIABLE
                    )) > 0)
                .map(v => comp_info.binding_records.get(v).index).sort();

            if (ids.length > 0)
                appendStmtToFrame(frame, stmt(`if(!this.check(${ids}))return 0;`));

            if (representative.component_variables.some(v => comp.root_frame.binding_variables.get(v).type == BINDING_VARIABLE_TYPE.MODEL_VARIABLE))
                appendStmtToFrame(frame, stmt(`if(!this.model)return 0;`));

            for (const member of group)
                appendStmtToFrame(frame, member.ast);

            comp_info.method_frames.push(frame);

            for (const rep of representative.component_variables.map(n => comp_info.binding_records.get(n)))
                if (rep)
                    rep.nodes.push(stmt(`this.call(${binding_join_index}, c)`));

            //Add function name to lookup function table

            comp_info.lfu_table_entries[binding_join_index] = (exp("this." + name));

            binding_join_index++;
        }
    }


    processBindingRecords(comp_info, comp);
}

function processBindingRecords(comp_info: CompiledComponentClass, comp: ComponentData) {

    const { methods, method_frames, init_frame } = comp_info;

    for (const [name, { nodes, index }] of comp_info.binding_records.entries()) {

        const binding = getComponentBinding(name, comp),
            { internal_name, class_index, flags, type, external_name } = binding;

        binding.class_index = index;

        processBindingVariables(binding, comp_info, comp, index);

        //create an update function for the binding variable 
        const frame = createBuildFrame("u" + index, "f,c");

        appendStmtToFrame(frame, ...nodes);

        if (flags & BINDING_FLAG.ALLOW_EXPORT_TO_PARENT) {

            const stmt_ = stmt(`this.updateParent({${external_name}:this[${index}]});`);

            appendStmtToFrame(frame, stmt_);
        }


        if (Frame_Has_Statements(frame)) {

            //Const variables,

            const IS_DIRECT_ACCESS = (type & BINDING_VARIABLE_TYPE.DIRECT_ACCESS) > 0;

            if (IS_DIRECT_ACCESS)
                // Direct access variables ( API & GLOBALS ) are assigned 
                // at at component initialization start. This allows these 
                // variables to to be accessed within the component initialization
                // function  
                appendStmtToFrame(init_frame, ...getStatementsFromFrame(frame));
            else
                method_frames.push(frame);

        }
    }
}


function processBindingVariables(
    binding: BindingVariable,
    class_info: CompiledComponentClass,
    component: ComponentData,
    index: number
): void {
    if (
        true ||
        binding.type == BINDING_VARIABLE_TYPE.ATTRIBUTE_VARIABLE
        ||
        binding.type == BINDING_VARIABLE_TYPE.INTERNAL_VARIABLE
        ||
        binding.type == BINDING_VARIABLE_TYPE.CONST_INTERNAL_VARIABLE
    ) class_info.lu_public_variables.push(
        <any>getPropertyAST(
            getExternalName(binding),
            ((((binding.flags | BINDING_FLAG.DEFAULT_BINDING_STATE) << 24) | index) >>> 0) + ""
        )
    );

    if (binding.type == BINDING_VARIABLE_TYPE.METHOD_VARIABLE) {
        const nluf_array_entry = exp(`c.u${index}___`);
        class_info.lfu_table_entries[index] = (nluf_array_entry);
    } else {
        const nluf_array_entry = exp(`c.u${index}`);
        class_info.lfu_table_entries[index] = (nluf_array_entry);
    }

}


export async function addBindingRecord(
    class_info: CompiledComponentClass,
    name: string,
    component: ComponentData
) {


    if (!class_info.binding_records.has(name)) {

        const binding = component.root_frame.binding_variables.get(name);
        //Filter out binding variables that can be statically assigned. 
        if (
            (binding.type & (
                BINDING_VARIABLE_TYPE.GLOBAL_VARIABLE
                //|
                //BINDING_VARIABLE_TYPE.MODULE_VARIABLE
                //|
                //BINDING_VARIABLE_TYPE.MODULE_MEMBER_VARIABLE
                //|
                //BINDING_VARIABLE_TYPE.DIRECT_ACCESS
            )) > 0
        )
            return;

        const index = class_info.binding_records.size;

        const { default_val } = binding;

        class_info.binding_records.set(name, { index, nodes: [] });
    }
}

