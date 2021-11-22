import { bidirectionalTraverse, TraversedNode, TraverseState } from "@candlelib/conflagrate";
import { exp, JSExpressionClass, JSNode, JSNodeType } from "@candlelib/js";
import { rt } from "../../runtime/global.js";
import { TemplateHTMLNode } from "../../types/all.js";
import { componentDataToCompiledHTML } from "../ast-build/html.js";
import * as b_sys from "../build_system.js";
import { ComponentData } from '../common/component.js';
import { html_void_tags, Is_Tag_Void_Element } from "../common/html.js";
import { Context } from '../common/context.js';

/**
 * Compile component HTML information (including child component and slot information), into a string containing the components html
 * tree and template html elements for components referenced in containers. 
 * 
 * @param comp 
 * @param context 
 */
export async function componentDataToHTML(
    comp: ComponentData,
    context: Context = rt.context,
    html_indent: number = 0
): Promise<{ html: string, template_map: Map<string, TemplateHTMLNode>; }> {

    b_sys.enableBuildFeatures();

    comp.element_counter = 0;

    const { html: [html], templates: template_map } = await componentDataToCompiledHTML(comp, context);

    const html_string = htmlTemplateToString(html, html_indent);

    b_sys.disableBuildFeatures();

    return { html: html_string, template_map };
}

function nodeAllowsFormatting(node, parent): boolean {
    return !((parent?.tagName == "pre") || (node?.tagName == "w-b") || (node?.tagName == "pre"));
}

/**
 * Return an HTML string from a TemplateHTMLNode AST object
 */
export function htmlTemplateToString(html: TemplateHTMLNode, html_indent: number = 0) {

    html.strings.length = 0;

    for (const { node, meta: { depth, parent, traverse_state } } of bidirectionalTraverse(html, "children")) {

        const depth_str = nodeAllowsFormatting(node, parent)
            ? "\n" + "  ".repeat(depth + (html_indent * 2))
            : "";

        if (traverse_state == TraverseState.LEAF && (!node.tagName || Is_Tag_Void_Element(node.tagName))) {

            node.strings.length = 0;

            if (node.tagName) {

                let string = depth_str + addAttributesToString(node, `<${node.tagName}`);

                if (html_void_tags.has(node.tagName.toLowerCase()))
                    node.strings.push(string + "/>");
                else
                    node.strings.push(string + `></${node.tagName}>`);

            } else if (node.data)
                node.strings.push(node.data);

            if (parent)
                parent.strings.push(...node.strings);

            continue;
        }

        if (traverse_state == TraverseState.ENTER || traverse_state == TraverseState.LEAF) {

            node.strings.length = 0;

            let string = "";


            //Null container elements do not enclose their children 
            //elements, but instead are closed before their children
            //are listed. A special null attribute is applied indicating 
            //how many children the container captures. 
            if (node.tagName == "null")
                string = addAttributesToString(node, `<span hidden=true null=${node.children.length}`) + "></span>";
            else
                string = addAttributesToString(node, `<${node.tagName}`) + ">";

            node.strings.push(depth_str + string);
        }

        if (traverse_state == TraverseState.EXIT || traverse_state == TraverseState.LEAF) {
            //Null container elements do not enclose their child elements


            if (node.tagName?.toLocaleLowerCase() == "code" || node.tagName?.toLocaleLowerCase() == "w-b") {
                node.strings = [node.strings.join("") + `</${node.tagName}>`];
            } else if (node.tagName !== "null")
                node.strings.push(depth_str + `</${node.tagName}>`);;


            if (parent) {
                if (parent.tagName == "pre")
                    parent.strings.push(...node.strings);
                else
                    parent.strings.push(...node.strings);
            }
        }
    };

    return html.strings.join("");
}

function addAttributesToString(node: TraversedNode<TemplateHTMLNode>, string: string) {
    for (const [key, val] of node.attributes.entries())
        if (val === "")
            string += ` ${key}`;
        else
            string += ` ${key}="${val}"`;
    return string;
}


export function htmlTemplateToJSNode(node: TemplateHTMLNode): JSNode {

    const out: JSNode = {
        type: JSNodeType.ObjectLiteral,
        nodes: [],
        //pos: <any>node.pos
    };

    if (!node.tagName)
        out.nodes.push(<any>propString("data", node.data || ""));
    else
        out.nodes.push(<any>propString("tag_name", node.tagName));


    if (node.children) {

        const children_array = [];

        for (const child of node.children) {
            if (child.tagName == "null") {
                children_array.push(nullContainerToJSNode(child));
                children_array.push(...(child.children ?? []).map(htmlTemplateToJSNode));
            } else {
                children_array.push(htmlTemplateToJSNode(child));
            }
        }

        out.nodes.push(<any>propArray("children", children_array));
    }

    if (node.attributes)
        out.nodes.push(<any>propArray("attributes", [...node.attributes.entries()].map(DOMAttributeToJSNode)));

    return out;
}

export function nullContainerToJSNode(node: TemplateHTMLNode): JSNode {

    const out: JSNode = {
        type: JSNodeType.ObjectLiteral,
        nodes: [],
        //pos: node.pos
    };

    out.nodes.push(<any>propString("tag_name", "span"));

    if (node.attributes)
        out.nodes.push(<any>propArray("attributes", [...node.attributes.entries(), ...[["hidden", "true"], ["null", node.children.length]]].map(DOMAttributeToJSNode)));

    return out;
}
function sanitizeString(str: string) {
    return str.replace(/\n/g, "\\n").replace(/"/g, `\\"`);
}

function propLiteral(name: string, val: any) {
    return exp(`({${name}:${val}})`).nodes[0].nodes[0];
}

function propString(name: string, val: string): JSExpressionClass {
    return <JSExpressionClass>exp(`({${name}:"${sanitizeString(val)}"})`).nodes[0].nodes[0];
}

function propArray(name: string, children) {
    const d = exp(`({${name}:[]})`).nodes[0].nodes[0];
    d.nodes[1].nodes = children;
    return d;
}

function DOMAttributeToJSNode([key, val]: [string, string]) {
    return {
        type: JSNodeType.ArrayLiteral,
        nodes: [
            { type: JSNodeType.StringLiteral, quote_type: "\"", value: key },
            { type: JSNodeType.StringLiteral, quote_type: "\"", value: val !== undefined ? sanitizeString(val + "") : "" }
        ]
    };
};