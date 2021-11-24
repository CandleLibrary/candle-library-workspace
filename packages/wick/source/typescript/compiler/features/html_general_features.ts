
import { JSNode, stmt } from '@candlelib/js';
import {
    BINDING_VARIABLE_TYPE,
    HTMLAttribute, HTMLElementNode, HTMLNode, HTMLNodeType
} from "../../types/all.js";
import { getAttributeValue, hasAttribute } from '../common/html.js';
import { registerFeature } from './../build_system.js';
import { ComponentHash } from './../common/hash_name.js';

registerFeature(

    "CandleLibrary WICK: General HTML Features",
    (build_system) => {

        /*[API] ##########################################################
        * 
        * HTML HEAD
        * 
        * Elements defined within HEAD tags get appended to the HTML_HEAD array
        * of the component data element
        */
        build_system.registerHTMLParserHandler(
            {
                priority: 10,

                prepareHTMLNode(node, _, _2, _3, _4, component) {
                    component.HTML_HEAD.push(...node.nodes);
                    return null;
                }
            }, HTMLNodeType.HTML_HEAD
        );

        /** ##############################################################################
         * SLOT ATTRIBUTES
         * Adds slot property strings to host node for later evaluation during build phase
         */
        build_system.registerHTMLParserHandler<HTMLAttribute>(
            {
                priority: -2,

                prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {
                    if (
                        node.name == "slot"
                        ||
                        node.name == "name"
                    ) {
                        host_node.slot_name = <string>node.value;
                        return null;
                    }
                }
            }, HTMLNodeType.HTMLAttribute
        );

        /** ##########################################################
         * 
         * Container Element component & element attributes
         */
        build_system.registerHTMLParserHandler<HTMLAttribute>(
            {
                priority: 10,

                prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    if ("IS_CONTAINER" in host_node) {


                        if (node.name == "component") {

                            const component_name = <string>(<HTMLNode>node).value;

                            component.names.push(component_name);

                            // No need to save this wick specific attribute, return [undefined]. 
                            return null;
                        }

                        if (node.name == "element" || node.name == "ele") {

                            host_node.tag = <string>node.value;

                            return;
                        }

                        return;
                    }
                }
            }, HTMLNodeType.HTMLAttribute
        );



        /** ##########################################################
         *  Style Elements
         */
        build_system.registerHTMLParserHandler(
            {
                priority: -99999,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    await build_system.processCSSNode(node, component, context, component.location, host_node.id);

                    return null;
                }
            }, HTMLNodeType.HTML_STYLE
        );

        /** ##########################################################
         *  Import Elements
         */
        build_system.registerHTMLParserHandler<HTMLNode>(
            {
                priority: -99999,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    const url = String(getAttributeValue("url", node) || ""),
                        name = String(getAttributeValue("name", node) || "");


                    await build_system.importResource(
                        url + "",
                        component,
                        context,
                        node,
                        "",
                        [{ local: name, external: name }],
                        component.root_frame
                    );

                    return null;
                }

            }, HTMLNodeType.HTML_IMPORT
        );


        /** ##########################################################
         *  Script Elements
         */
        build_system.registerHTMLParserHandler(
            {
                priority: -99998,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {


                    const
                        id = <string>getAttributeValue("id", node),
                        [script] = <JSNode[]><unknown>(node.nodes),
                        src = getAttributeValue("src", node);

                    /**
                     * If source is present, then leave this node as is
                     * and do not attempt to process the contents.
                     * 
                     * Additionally, remove contents if present.
                     */
                    if (src) {
                        node.nodes.length = 0;
                        return node;
                    }

                    if (id) {
                        const fn_ast = stmt(`function ${id}(){;};`);

                        fn_ast.nodes[2].nodes = <any>script.nodes;

                        build_system.addBindingVariable(
                            component.root_frame,
                            id,
                            node.pos,
                            BINDING_VARIABLE_TYPE.METHOD_VARIABLE
                        );

                        await build_system.processFunctionDeclaration(fn_ast, component, context);
                    } else
                        await build_system.processJSNode(script, component, context);

                    return null;
                }

            }, HTMLNodeType.HTML_SCRIPT
        );

        /** ##########################################################
         *  Add-HOC Component
         */
        build_system.registerHTMLParserHandler(
            {
                priority: -999,

                async prepareHTMLNode(
                    node: HTMLElementNode,
                    host_node: HTMLElementNode,
                    host_element,
                    index,
                    skip,
                    component,
                    context
                ) {
                    if (
                        node.tag?.toLocaleLowerCase() == "component"
                    ) {

                        node.tag = "div";

                        const new_attribs = [];
                        const old_attribs = [];

                        for (const attrib of (node.attributes || [])) {
                            const { name, value } = attrib;
                            if (name == "element") {
                                node.tag == value || "div";
                            } else if (name == "model") {
                                //Skip this node
                                old_attribs.push(attrib);
                            } else {
                                new_attribs.push(attrib);
                            }
                        }

                        const { comp } = await build_system.parseComponentAST(
                            Object.assign({}, node, { attributes: new_attribs }),
                            node.pos.slice(),
                            component.location,
                            context,
                            component
                        );

                        if (comp) {

                            let new_node = Object.assign({}, node);



                            new_node.attributes = old_attribs;

                            new_node.nodes = [];

                            new_node.child_id = component.children.push(1) - 1;

                            new_node.component = comp;

                            component.local_component_names.set(comp?.name, comp?.name);

                            new_node.component_name = new_node.component.name;

                            //@ts-ignore
                            new_node.attributes.push({
                                type: HTMLNodeType.HTMLAttribute,
                                name: "expat",
                                value: ComponentHash(index + comp.name)
                            });

                            if (hasAttribute("radiate_element", node)) {
                                new_node.attributes.push({
                                    type: HTMLNodeType.HTMLAttribute,
                                    name: "radiate",
                                    value: component.name,
                                });
                            }
                            /*
                            */

                            return new_node;
                        }

                        return node;
                    }
                }

            }, HTMLNodeType.HTML_Element
        );



        /*  /** ##########################################################
          *  Radiate Element
          * /
         build_system.registerHTMLParserHandler<HTMLElementNode, HTMLElementNode>(
             {
                 priority: -998,
 
                 async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {
 
 
                     if (node.tag?.toLocaleLowerCase().replace(/_/g, "-") == "radiate-element") {
 
                         node.tag = "div";
 
                         const { comp } = await build_system.parseComponentAST(
                             Object.assign({}, node, {
                                 attribute: node.attributes?.slice(),
 
                             }),
                             node.pos.slice(),
                             component.location,
                             context,
                             component
                         );
 
                         if (comp) {
 
                             if (!node.attributes)
                                 node.attributes = [];
 
                             node.nodes = [];
 
                             node.child_id = component.children.push(1) - 1;
 
                             node.component = comp;
 
                             node.component_name = node.component.name;
 
                             node.attributes.push({
                                 type: HTMLNodeType.HTMLAttribute,
                                 name: "radiate",
                                 value: component.name,
                             }, {
                                 type: HTMLNodeType.HTMLAttribute,
                                 name: "expat",
                                 value: ComponentHash(index + comp.name)
                             });
 
                             component.local_component_names.set(comp?.name, comp?.name);
 
                             skip();
                         }
 
                         return node;
                     }
                 }
 
             }, HTMLNodeType.HTML_Element
         ); */

        /** ##########################################################
         * Imported Components 
         */
        build_system.registerHTMLParserHandler(
            {
                priority: -99999,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    if (component.local_component_names.has(node.tag ?? "")) {

                        const
                            name = component.local_component_names.get(node.tag ?? "") ?? "",
                            comp = context.components.get(name);

                        node.child_id = component.children.push(1) - 1;

                        node.component = comp;



                        if (comp) {

                            console.log(comp);

                            if (comp.TEMPLATE)
                                node.pos.throw("Cannot use a template component as a regular component instance.");

                            node.component_name = node.component?.name;

                            node.child_component_index = node.child_id;

                            //@ts-ignore
                            node.attributes.push({
                                type: HTMLNodeType.HTMLAttribute,
                                name: "expat",
                                value: ComponentHash(index + comp.name + name)
                            });


                            if (hasAttribute("radiate_element", node)) {
                                node.attributes.push({
                                    type: HTMLNodeType.HTMLAttribute,
                                    name: "radiate",
                                    value: component.name,
                                });
                            }

                        }

                        node.tag = "div";

                        return node;
                    }
                }

            }, HTMLNodeType.HTML_Element
        );

    }
);