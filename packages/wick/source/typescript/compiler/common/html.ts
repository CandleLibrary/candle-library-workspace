import { JSNodeType } from '@candlelib/js';
import { HTMLNode, HTMLElementNode, HTMLNodeClass } from "../../types/all.js";
import { ComponentData } from './component.js';
import { registerHookType } from './extended_types.js';

export const html_void_tags = new Set([
    "area",
    "base", "br",
    "col", "command",
    "embed",
    "hr",
    "img", "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
]);

export const html_non_void_tags = new Set([
    "a", "abbr", "acronym", "address",
    "b", "bdo", "big", "blockquote", "body", "button",
    "caption", "cite", "code", "colgroup",
    "dd", "del", "dfn", "div", "dl", "dt",
    "em",
    "fieldset", "form",
    "h1", "h2", "h3", "h4", "h5", "h6", "head", "html",
    "i", "import", "ins",
    "kbd",
    "label", "legend", "li",
    "map",
    "noscript", "object", "ol", "optgroup", "option",
    "p", "param", "pre",
    "q",
    "samp", "script", "select", "small", "span", "strong", "style", "sup", "svg",
    "table", "tbody", "td", "text", "textarea", "tfoot", "th", "thead", "title", "tr", "tt",
    "ul",
    "var"
]);

export const html_tags = new Set([...html_non_void_tags.values(), ...html_void_tags.values()]);

export const html_input_types = new Set([
    "button",
    "checkbox",
    "color",
    "date",
    "datetime",
    "email",
    "file",
    "hidden",
    "image",
    "month",
    "number",
    "password",
    "radio",
    "range",
    "reset",
    "search",
    "submit",
    "tel",
    "text",
    "time",
    "url",
    "week",
]);

export const html_button_types = new Set([
    "button",
    "reset",
    "submit",
]);

export const html_command_types = new Set([
    "command",
    "radio",
    "checkbox",
]);


export function Is_Tag_From_HTML_Spec(tag_name: string): boolean { return html_tags.has(tag_name.toLowerCase()); }

export function Is_Tag_Void_Element(tag_name: string): boolean { return html_void_tags.has(tag_name.toLowerCase()); }


export function getElementAtIndex<T = HTMLNode>(comp: ComponentData, index: number, node: HTMLNode = comp.HTML, counter = { i: 0 }): T {

    if (index == node.id)
        return <T><any>node;

    if (node.nodes)
        for (const child of node.nodes) {
            let out = null;
            if ((out = getElementAtIndex(comp, index, child, counter)))
                return out;
        }

    return null;
};

export function IsHTMLNode(node: any): node is HTMLNode {
    return typeof node == "object"
        && "type" in node
        && typeof node.type == "number"
        && (node.type & HTMLNodeClass.HTML_NODE) > 0;
}

export function escape_html_string(string: string): string {
    return string.replace(/>/g, "&gt;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");
    //.replace(/\s/g, "&#8199;");
}

export function getAttributeValue(name, node: HTMLElementNode) {
    for (const att of node.attributes) {
        if (att.name == name)
            return att.value;
    }
}

export function getAttribute(name, node: HTMLElementNode) {
    for (const att of node.attributes) {
        if (att.name == name)
            return att;
    }

    return null;
}


export function hasAttribute(name, node: HTMLElementNode) {
    for (const att of node.attributes) {
        if (att.name == name)
            return true;
    }

    return false;
}

export const AttributeHook = registerHookType("attribute-hook", JSNodeType.StringLiteral);