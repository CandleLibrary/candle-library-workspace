import {
    CustomFormatFunction,
    renderCompressed as CFLrenderCompressed,
    renderWithFormatting as CFLrenderWithFormatting,
    renderWithSourceMap as CFLrenderWithSourceMap,
    renderWithFormattingAndSourceMap as CFLrenderWithFormattingAndSourceMap,
    FormatRule,
    experimentalRender
} from "@candlelib/conflagrate";

import { CSSNodeType } from "../types/node_type.js";
import { CSSRuleNode, CSSNode } from "../types/node";
import { renderers, format_rules } from "../render/rules.js";
import { css_mappings, css_renderers } from './mappings.js';

type Node = CSSNode;

export const FormatFunction: CustomFormatFunction<Node> = (str, prop_name, node) => {

    if (node.type == CSSNodeType.Rule && prop_name !== "@full_render")
        return `{${Array.from((<CSSRuleNode>node).props.values()).map(n => n + "").join(";\n")}}`;

    return str;
};

export function renderCompressed(node: Node): string {
    return experimentalRender(node, css_mappings, css_renderers).string;
}

export function renderWithFormatting(
    node: Node,

    //format rules
    fr: FormatRule[] = format_rules.format_rules
) {
    return CFLrenderWithFormatting<Node>(node, renderers, fr, FormatFunction);
}

export function renderWithSourceMap(
    node: Node,

    //source map data
    map: Array<number[]> = null,
    source_index = -1,
    names: Map<string, number> = null,
) {

    return CFLrenderWithSourceMap<Node>(node, renderers, map, source_index, names, FormatFunction);
}

export function renderWithFormattingAndSourceMap(
    node: Node,

    //format rules
    fr: FormatRule[] = format_rules.format_rules,
    formatString = FormatFunction,


    //source map data
    map: Array<number[]> = null,
    source_index = -1,
    names: Map<string, number> = null,
) {
    return CFLrenderWithFormattingAndSourceMap<Node>(node, renderers, fr, formatString, map, source_index, names);
}