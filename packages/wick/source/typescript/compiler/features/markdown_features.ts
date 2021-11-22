
import { HTMLNodeType } from "../../types/all.js";
import { convertMarkdownToHTMLNodes } from '../common/markdown.js';
import { registerFeature } from './../build_system.js';

registerFeature(

    "CandleLibrary WICK: Markdown Features",
    (build_system) => {

        /** ##########################################################
         *  Markdown Elements
         */
        build_system.registerHTMLParserHandler(
            {
                priority: -99999,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {
                    const resolved_node = convertMarkdownToHTMLNodes(node.nodes[0]);

                    if (resolved_node.nodes.length < 1)
                        return null;

                    for (const node of resolved_node.nodes)
                        await build_system.processHTMLNode(node, component, context, false, false);

                    return resolved_node.nodes;
                }

            }, HTMLNodeType.MARKDOWN
        );
    }
);