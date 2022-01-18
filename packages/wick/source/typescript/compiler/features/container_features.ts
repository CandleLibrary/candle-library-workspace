import { copy, traverse } from '@candlelib/conflagrate';
import {
    JSExpressionStatement,
    JSIdentifier,
    JSIdentifierClass,
    JSNode,
    JSNodeType,
    renderCompressed,
    stmt
} from '@candlelib/js';
import URI from '@candlelib/uri';
import * as exp from 'constants';
import {
    BINDING_VARIABLE_TYPE, HTMLAttribute,
    HTMLContainerNode,
    HTMLElementNode,
    HTMLNode,
    HTMLNodeClass,
    HTMLNodeType,
    IndirectHook,
    STATIC_RESOLUTION_TYPE
} from "../../types/all.js";
import { registerFeature } from '../build_system.js';
import { Can_AttributeBinding_Be_Resolved } from '../common/binding.js';
import { ComponentData } from '../common/component.js';
import { getOriginalTypeOfExtendedType, registerHookType } from "../common/extended_types.js";
import { getElementAtIndex } from "../common/html.js";
import { BindingIdentifierBinding, BindingIdentifierReference } from "../common/js_hook_types.js";
import { ExpressionIsConstantStatic, getExpressionStaticResolutionType, getStaticValue, StaticDataPack } from "../data/static_resolution.js";
import { renderNew } from '../source-code-render/render.js';

export const ContainerDataHook = registerHookType("container-data-hook", HTMLNodeType.HTMLAttribute);
export const ContainerFilterHook = registerHookType("container-filter-hook", HTMLNodeType.HTMLAttribute);
export const ContainerSortHook = registerHookType("container-sort-hook", HTMLNodeType.HTMLAttribute);
export const ContainerLimitHook = registerHookType("container-limit-hook", HTMLNodeType.HTMLAttribute);
export const ContainerOffsetHook = registerHookType("container-offset-hook", HTMLNodeType.HTMLAttribute);
export const ContainerShiftHook = registerHookType("container-shift-hook", HTMLNodeType.HTMLAttribute);
export const ContainerScrubHook = registerHookType("container-scrub-hook", HTMLNodeType.HTMLAttribute);
export const ContainerUseIfHook = registerHookType("container-use-if", HTMLNodeType.HTMLAttribute);
export const ContainerUseIfEmptyHook = registerHookType("container-use-if-empty", HTMLNodeType.HTMLAttribute);

registerFeature(

    "CandleLibrary WICK: HTML Containers",
    (build_system) => {

        /** ##########################################################
         *  Container Elements
         */
        build_system.registerHTMLParserHandler<HTMLElementNode, HTMLElementNode>(
            {
                priority: 99999999999,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    if (node.tag?.toLowerCase() == "container") {

                        const container_id = component.container_count;

                        const ctr: HTMLContainerNode = Object.assign(<HTMLContainerNode>{

                            type: HTMLNodeType.HTML_Element,

                            pos: node.pos,

                            IS_CONTAINER: true,

                            container_id,

                            components: [],

                            component_names: [],

                            component_attributes: []

                        }, node);

                        for (const ch of ctr.nodes ?? []) {

                            if (!(HTMLNodeIsElement(ch))) { continue; }

                            let comp, comp_index = ctr.components.length;

                            const inherited_attributes: [string, any][] = [];

                            const IS_GENERATED_COMPONENT = !(component.local_component_names.has(ch.tag ?? ""));

                            const new_attribs = [];

                            for (const attrib of (ch.attributes || [])) {
                                const { name, value } = attrib;

                                if (name == "use-if" && typeof value != "string") {

                                    build_system.addIndirectHook(component, ContainerUseIfHook, {
                                        expression: await build_system.processBindingAsync(value, component, context),
                                        comp_index: comp_index,
                                        container_id
                                    }, index + 1);

                                } else if (name == "use-if-empty") {

                                    build_system.addIndirectHook(component, ContainerUseIfEmptyHook, {
                                        comp_index,
                                        container_id
                                    }, index + 1);

                                } else if (IS_GENERATED_COMPONENT) {
                                    new_attribs.push(attrib);
                                } else
                                    inherited_attributes.push([name, value]);

                            }

                            ch.attributes = new_attribs;

                            ctr.component_attributes.push(inherited_attributes);

                            if (ch.tag?.toLowerCase() == "self") {
                                comp = component;
                            } else {

                                if (IS_GENERATED_COMPONENT)
                                    ({ comp } = await build_system.parseComponentAST(
                                        Object.assign({}, ch),
                                        build_system.componentNodeSource(component, ch),
                                        new URI("auto_generated"),
                                        context,
                                        component
                                    ));
                                else
                                    comp = context.components.get(component.local_component_names.get(ch.tag));

                                component.local_component_names.set(comp?.name, comp?.name);
                            }

                            ctr.components.push(comp);

                            ctr.component_names.push(comp?.name);
                        }

                        component.container_count++;

                        // Remove all child nodes from container after they have 
                        // been processed
                        //@ts-ignore
                        ctr.nodes.length = 0;

                        ctr.tag = "DIV";

                        //await build_system.processHTMLNode(ctr, component, context, false, false, true);

                        //skip();


                        return ctr;
                    }
                }

            }, HTMLNodeType.HTML_Element
        );

        /**
         * Container use-if attribute
         */

        build_system.registerHookHandler<IndirectHook<{
            expression: JSNode,
            comp_index: number,
            container_id: number,
        }>, void | JSNode>({

            name: "Container Use-If",

            types: [ContainerUseIfHook],

            verify: () => true,

            buildHTML: _ => null,

            buildJS: (node, sdp, index, write, init, _2) => {

                const {
                    expression,
                    comp_index,
                    container_id,
                } = node.value[0];

                let arrow_argument_match = new Array(1).fill(null);

                if (getListOfUnboundArgs(expression, sdp.self, arrow_argument_match, build_system)) {

                    const arrow_expression_stmt = stmt(`$$ctr${container_id}.addEvaluator(${arrow_argument_match[0].value} => 1, ${comp_index})`);

                    //@ts-ignore
                    arrow_expression_stmt.nodes[0].nodes[1].nodes[0].nodes[1] = expression;

                    init(arrow_expression_stmt);
                }

                return null;

            }
        });

        /**
         * Container use-if-empty attribute
         */

        build_system.registerHookHandler<IndirectHook<{
            expression: JSNode,
            comp_index: number,
            container_id: number,
        }>, void | JSNode>({

            name: "Container Use-If-Empty",

            types: [ContainerUseIfEmptyHook],

            verify: () => true,

            buildHTML: _ => null,

            buildJS: (node, sdp, index, write, init, _2) => {

                const {
                    comp_index,
                    container_id,
                } = node.value[0];

                const arrow_expression_stmt = stmt(`$$ctr${container_id}.addEmpty(${comp_index})`);

                init(arrow_expression_stmt);

                return null;

            }
        });

        /** ###########################################################
         *  Container Data Attribute
         */
        build_system.registerHTMLParserHandler<HTMLAttribute, HTMLElementNode>(
            {
                priority: 99999999999,

                async prepareHTMLNode(attr, host_node, host_element, index, skip, component, context) {

                    if (attr.name == "data" && "IS_CONTAINER" in host_node) {


                        // Process the primary expression for Binding Refs and static
                        // data
                        const ast = await build_system.processBindingAsync(attr.value, component, context);

                        // Create an indirect hook for container data attribute

                        build_system.addIndirectHook(component, ContainerDataHook, ast, index, true);

                        // Remove the attribute from the container element

                        return null;
                    }
                }
            }, HTMLNodeType.HTMLAttribute
        );

        build_system.registerHookHandler<IndirectHook<any>, void | any>({
            name: "Container Data Attribute",

            types: [ContainerDataHook],

            verify: () => true,

            buildJS: async (node, sdp, element_index, on_write, init, read) => {

                const
                    ele = getElementAtIndex<HTMLContainerNode>(sdp.self, element_index),

                    st = <JSExpressionStatement>stmt(`$$ctr${ele.container_id}.sd(0)`),

                    id = <JSNode>node.value[0];

                if (ExpressionIsConstantStatic(id, sdp)) {
                    // Constant Static bindings are resolved during build time and do not need to be represented in
                    // any way within the runtime code
                    return null;
                } else {

                    st.nodes[0].nodes[1].nodes = <any>node.value;
                    on_write(st);
                }

                return null;
            },

            buildHTML: async (hook, sdp) => {

                const container_ele: HTMLContainerNode = <any>getElementAtIndex(sdp.self, hook.ele_index);
                const static_resolution_type = getExpressionStaticResolutionType(<JSNode>hook.value[0], sdp);
                if (
                    static_resolution_type
                    !==
                    STATIC_RESOLUTION_TYPE.INVALID
                    &&
                    container_ele.component_names.length > 0
                ) {
                    const pkg = await getStaticValue(hook.value[0], sdp);

                    if (Array.isArray(pkg.value)) {
                        pkg.value = pkg.value.map(v => typeof v == "object" ? v : { value: v });
                    }
                    else pkg.value = [];

                    return pkg;
                }

                return null;
            }
        });

        /** ###########################################################
         *  Container Filter Attribute
         */
        build_system.registerHTMLParserHandler<HTMLAttribute, HTMLElementNode>(
            {
                priority: 99999999999,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    if (node.name == "filter" && "IS_CONTAINER" in host_node) {

                        // Process the primary expression for Binding Refs and static
                        // data
                        const ast = await build_system.processBindingAsync(node.value, component, context);

                        // Create an indirect hook for container data attribute

                        build_system.addIndirectHook(component, ContainerFilterHook, ast, index);

                        // Remove the attribute from the container element

                        return null;
                    }
                }
            }, HTMLNodeType.HTMLAttribute
        );

        build_system.registerHookHandler<JSNode | JSIdentifier | any, void>({
            description: ``,

            name: "Container Filter Hook",

            types: [ContainerFilterHook],

            verify: () => true,

            buildJS: createContainerDynamicArrowCall(1, "setFilter"),

            buildHTML: createContainerStaticArrowFunction(1)
        });


        /** ###########################################################
         *  Container Scrub Attribute
         */
        build_system.registerHTMLParserHandler<HTMLAttribute, HTMLElementNode>(
            {
                priority: 99999999999,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    if (node.name == "scrub" && "IS_CONTAINER" in host_node) {

                        // Process the primary expression for Binding Refs and static
                        // data
                        const ast = await build_system.processBindingAsync(node.value, component, context);

                        // Create an indirect hook for container data attribute

                        build_system.addIndirectHook(component, ContainerScrubHook, ast, index);

                        // Remove the attribute from the container element

                        return null;
                    }
                }
            }, HTMLNodeType.HTMLAttribute
        );

        build_system.registerHookHandler<JSNode | JSIdentifier | any, void>({

            description: ``,

            name: "Container Scrub Hook",

            types: [ContainerScrubHook],

            verify: () => true,

            buildJS: createContainerDynamicValue("updateScrub"),
            // Scrub has no meaning in a static context, as it requires variable input from 
            // user actions to work. 
            buildHTML: () => null
        });

        /** ###########################################################
         *  Container Sort Attribute
         */
        build_system.registerHTMLParserHandler<HTMLAttribute, HTMLElementNode>(
            {
                priority: 99999999999,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    if (node.name == "sort" && "IS_CONTAINER" in host_node) {

                        // Process the primary expression for Binding Refs and static
                        // data
                        const ast = await build_system.processBindingAsync(node.value, component, context);

                        // Create an indirect hook for container data attribute

                        build_system.addIndirectHook(component, ContainerSortHook, ast, index);

                        // Remove the attribute from the container element

                        return null;
                    }
                }
            }, HTMLNodeType.HTMLAttribute
        );

        build_system.registerHookHandler<JSNode | JSIdentifier | any, void>({
            description: ``,

            name: "Container Sort Hook",

            types: [ContainerSortHook],

            verify: () => true,

            buildJS: createContainerDynamicArrowCall(2, "setSort"),

            buildHTML: createContainerStaticArrowFunction(2)
        });

        /** ###########################################################
         *  Container Limit Attribute
         */
        build_system.registerHTMLParserHandler<HTMLAttribute, HTMLElementNode>(
            {
                priority: 99999999999,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    if (node.name == "limit" && "IS_CONTAINER" in host_node) {

                        // Process the primary expression for Binding Refs and static
                        // data
                        const ast = await build_system.processBindingAsync(node.value, component, context);


                        // Create an indirect hook for container data attribute

                        build_system.addIndirectHook(component, ContainerLimitHook, ast, index);

                        // Remove the attribute from the container element

                        return null;
                    }
                }
            }, HTMLNodeType.HTMLAttribute
        );

        build_system.registerHookHandler<JSNode | JSIdentifier | any, void>({
            description: ``,

            name: "Container Limit Hook",

            types: [ContainerLimitHook],

            verify: () => true,

            buildJS: createContainerDynamicValue("updateLimit"),

            buildHTML: createContainerStaticValue
        });

        /** ###########################################################
         *  Container Offset Attribute
         */
        build_system.registerHTMLParserHandler<HTMLAttribute, HTMLElementNode>(
            {
                priority: 99999999999,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    if (node.name == "offset" && "IS_CONTAINER" in host_node) {

                        // Process the primary expression for Binding Refs and static
                        // data
                        const ast = await build_system.processBindingAsync(node.value, component, context);

                        // Create an indirect hook for container data attribute

                        build_system.addIndirectHook(component, ContainerOffsetHook, ast, index);

                        // Remove the attribute from the container element

                        return null;
                    }
                }
            }, HTMLNodeType.HTMLAttribute
        );

        build_system.registerHookHandler<JSNode | JSIdentifier | any, void>({

            description: ``,

            name: "Container Offset Hook",

            types: [ContainerOffsetHook],

            verify: () => true,

            buildJS: createContainerDynamicValue("updateOffset"),

            buildHTML: createContainerStaticValue
        });

        /** ###########################################################
         *  Container Shift Attribute
         */
        build_system.registerHTMLParserHandler<HTMLAttribute, HTMLElementNode>(
            {
                priority: 99999999999,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    if ((node.name == "shift" || node.name == "col" || node.name == "columns") && "IS_CONTAINER" in host_node) {

                        // Process the primary expression for Binding Refs and static
                        // data
                        const ast = await build_system.processBindingAsync(node.value, component, context);

                        // Create an indirect hook for container data attribute

                        build_system.addIndirectHook(component, ContainerShiftHook, ast, index);

                        // Remove the attribute from the container element

                        return null;
                    }
                }
            }, HTMLNodeType.HTMLAttribute
        );

        build_system.registerHookHandler<JSNode | JSIdentifier | any, void>({

            description: ``,

            name: "Container Shift Hook",

            types: [ContainerShiftHook],

            verify: () => true,

            buildJS: createContainerDynamicValue("updateShift"),

            buildHTML: createContainerStaticValue
        });

        function createContainerDynamicValue(container_method_name: string) {

            return function (node, sdp, index, write, _1, _2) {

                const container_id = build_system.getElementAtIndex<HTMLContainerNode>(sdp.self, index).container_id;

                const arrow_expression_stmt = stmt(`$$ctr${container_id}.${container_method_name}()`);

                arrow_expression_stmt.nodes[0].nodes[1].nodes[0] = node.value[0];

                write(arrow_expression_stmt);
            };
        }

        async function createContainerStaticValue(hook: IndirectHook<JSNode>, sdp: StaticDataPack) {

            const ast = await build_system.getStaticAST(hook.value[0], sdp, false);

            if (ast) {
                try {
                    return { value: eval(renderCompressed(<JSNode>ast)) };
                } catch (e) { }
            }

        };

        function createContainerDynamicArrowCall(argument_size: number, container_method_name: string) {
            return function (node, sdp, index, write, _1, _2) {

                const ast = node.value[0];

                const container_id = build_system.getElementAtIndex<HTMLContainerNode>(sdp.self, index).container_id;

                let arrow_argument_match = new Array(argument_size).fill(null);

                const ast_copy = copy(ast);

                if (getListOfUnboundArgs(ast_copy, sdp.self, arrow_argument_match, build_system)) {

                    const arrow_expression_stmt = stmt(`$$ctr${container_id}.${container_method_name}((${arrow_argument_match.map(i => i.value).join(",")}) => 1)`);

                    arrow_expression_stmt.nodes[0].nodes[1].nodes[0].nodes[1] = ast_copy;

                    write(stmt(`$$ctr${container_id}.update()`), copy(arrow_expression_stmt));

                    _1(arrow_expression_stmt);
                }
            };
        }

        function createContainerStaticArrowFunction(argument_size: number = 1) {

            return async function (hook: IndirectHook<JSNode>, sdp: StaticDataPack) {

                let arrow_argument_match = new Array(argument_size).fill(null);

                let ast = hook.value[0];

                //Expects just an expression statement, but the expression statement in an arrow function will work as well.
                if (ast.type == JSNodeType.ArrowFunction)
                    ast = ast.nodes[1];

                if (getListOfUnboundArgs(ast, sdp.self, arrow_argument_match, build_system)) {


                    if (build_system.getExpressionStaticResolutionType(ast, sdp) == STATIC_RESOLUTION_TYPE.CONSTANT_STATIC) {

                        const arrow_expression_stmt = build_system.js.expr(`(${arrow_argument_match.map(v => v.value)}) => 1`);

                        arrow_expression_stmt.nodes[1] =
                            <any>await build_system.getStaticAST(ast, sdp, false);

                        try {
                            return eval(renderCompressed(arrow_expression_stmt));
                        } catch (e) { }
                    }
                }

                return null;
            };
        }



    }
);



function HTMLNodeIsElement(ch: HTMLNode): ch is HTMLElementNode {
    return !!(ch.type & HTMLNodeClass.HTML_ELEMENT);
}

/**
        * Searches for N undeclared binding references, where N is the number of entries in list arg.
        * Upon finding matches, converts the types of reference nodes back to their original values.
        * Found nodes are assigned to the list at an index respective of the order the node was found
        * in. If the number of found nodes is less then the number of entries in list, then false
        * is returned; true otherwise.
        *
        * @param node
        * @param comp
        * @param list
        * @returns
        */
export function getListOfUnboundArgs(
    node: JSNode,
    comp: ComponentData,
    list: JSIdentifierClass[],
    build_sys: any
): boolean {

    let index = 0;

    let active_names = new Set();

    let name_to_convert = [];

    for (const { node: n } of traverse(node, "nodes")
        .filter("type",
            BindingIdentifierBinding,
            BindingIdentifierReference,
            JSNodeType.IdentifierBinding,
            JSNodeType.IdentifierReference
        )) {

        const name = (<JSIdentifierClass>n).value;

        if (n.type == BindingIdentifierBinding || n.type == BindingIdentifierReference) {

            const binding = build_sys.getComponentBinding(name, comp);

            if (
                binding.type == BINDING_VARIABLE_TYPE.UNDECLARED
                ||
                binding.type == BINDING_VARIABLE_TYPE.MODEL_VARIABLE
                &&
                !Can_AttributeBinding_Be_Resolved(name, {
                    self: comp, context: null, model: null, prev: null, root_element: comp.HTML
                })
            ) {

                if (!active_names.has(name)) {

                    if (index < list.length) {

                        name_to_convert.push(n);

                        active_names.add(name);

                        list[index] = n;

                        index++;
                    }
                } else {
                    name_to_convert.push(n);
                }
            }
        } else {
            if (!active_names.has(name)) {
                if (index < list.length) {
                    active_names.add(name);
                    //@ts-ignore
                    list[index] = n;
                    index++;
                }
            }
        }
    }

    if (index == list.length)
        for (const n of name_to_convert)
            n.type = getOriginalTypeOfExtendedType(n.type);
    //Sort names alphabetically
    list.sort(({ value: a }, { value: b }) => a < b ? -1 : a > b ? 1 : 0);

    return index == list.length;
}
