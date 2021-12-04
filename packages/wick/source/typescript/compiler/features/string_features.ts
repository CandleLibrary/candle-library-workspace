import { JSNode, JSNodeType, JSStringLiteral } from '@candlelib/js';
import { HTMLNode } from '../../types/wick_ast.js';
import { ComponentData } from '../common/component.js';
import { registerFeature } from './../build_system.js';

registerFeature(

    "CandleLibrary WICK: JS Strings",
    (build_system) => {

        const CSSSelectorHook = build_system.registerHookType("css-selector-hook", JSNodeType.StringLiteral);

        /**############################################################
         * STRING PRIMITIVE
         * 
         * String with identifiers for HTML Elements. 
         */
        build_system.registerJSParserHandler(
            {
                priority: 1,

                prepareJSNode(node, parent_node, skip, component, context, frame) {
                    if ((<JSStringLiteral>node).value[0] == "@") {
                        return Object.assign({}, node, {
                            type: CSSSelectorHook
                        });
                    }
                }

            }, JSNodeType.StringLiteral
        );

        function convertAtLookupToElementRef(string_node: JSStringLiteral, component: ComponentData) {

            const css_selector = string_node.value.slice(1); //remove "@"

            let html_node: null | HTMLNode = null, expression = null;
            try {


                switch (css_selector.toLowerCase()) {
                    case "ctxwebgpu":
                        html_node = build_system.css.matchAll("canvas", component.HTML)[0];

                        if (html_node)
                            expression = build_system.js.expr(`$$ele${html_node.id}.getContext("gpupresent")`);

                        break;
                    case "ctx3d":
                        html_node = build_system.css.matchAll("canvas", component.HTML)[0];

                        if (html_node)

                            expression = build_system.js.expr(`$$ele${html_node.id}.getContext("webgl2")`);

                        break;

                    case "ctx2d":

                        html_node = build_system.css.matchAll("canvas", component.HTML)[0];
                        if (html_node)
                            expression = build_system.js.expr(`$$ele${html_node.id}.getContext("2d")`);

                        break;

                    /*        case "root":
                               if (component.HTML)
                                   expression = build_system.js.expr(`$$ele${component.HTML.id}`);
                               break;
            */
                    default: {
                        const html_nodes = build_system.css.matchAll(css_selector, component.HTML);

                        if (html_nodes.length > 0)

                            expression = (html_nodes.length == 1)
                                ? build_system.js.expr(`$$ele${html_nodes[0].id}`)
                                : build_system.js.expr(`[${html_nodes.map(e => `$$ele${e.id}`).join(",")}]`);
                    }
                }
            } catch (e) { }

            if (expression == null) {
                expression = Object.assign({}, string_node, {
                    type: JSNodeType.StringLiteral
                });
            }

            return expression;
        }

        build_system.registerHookHandler<JSStringLiteral, JSStringLiteral>({

            name: "CSS Selector Reference",

            types: [CSSSelectorHook],

            verify: () => true,

            buildJS: (node, sdp, element_index, addOnBindingUpdate) => {

                //Replace the value with a 
                const exp = convertAtLookupToElementRef(node, sdp.self);

                if (exp)
                    return exp;
            },

            buildHTML: (node, sdp) => null
        });


    }

);