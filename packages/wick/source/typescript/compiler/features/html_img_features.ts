
import { JSNode, stmt } from '@candlelib/js';
import {
    BINDING_VARIABLE_TYPE,
    HTMLAttribute, HTMLElementNode, HTMLNode, HTMLNodeType
} from "../../types/all.js";
import { registerFeature } from './../build_system.js';
import { getAttributeValue } from '../common/html.js';

registerFeature(

    "CandleLibrary WICK: HTML Image Features",
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
                priority: 50,

                prepareHTMLNode(
                    node, host_node, host_element, element_index, skip, component, context
                ) {
                    const src = getAttributeValue("src", node);
                    const alt = getAttributeValue("alt", node);

                    if (src) {
                        if (typeof src == "string") {
                            component.URI.push({
                                type: "src",
                                node: <Node><any>node,
                                uri: src
                            });
                        }
                    } else {

                    }

                    if (!alt) {

                        node.pos.throw("Missing alt attribute [a11y alt attribute]");
                        //Warn about accesibility
                    }

                    return node;

                }
            }, HTMLNodeType.HTML_IMG
        );


    }
);