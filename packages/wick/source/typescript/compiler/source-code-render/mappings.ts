import { experimentalConstructRenderers, NodeMappings } from "@candlelib/conflagrate";
import { css_mappings } from '@candlelib/css';
import { render_mappings as js_mappings } from '@candlelib/js';
import { HTMLNodeType, Node } from "../../types/all.js";

export const wick_mappings: NodeMappings<Node, "type"> = <NodeMappings<Node, "type">>{
    typename: "type",
    type_lookup: null,
    mappings: [
        ...css_mappings.mappings,
        ...js_mappings.mappings,
        {
            type: HTMLNodeType.HTML_DIV,
            template: "\\<div {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n \\</div>",
            format_rule: 0
        },
        {
            type: HTMLNodeType.HTML_TT,
            template: "\\<tt {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</tt>"
        },
        {
            type: HTMLNodeType.HTML_I,
            template: "\\<i {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</i>"
        },
        {
            type: HTMLNodeType.HTML_B,
            template: "\\<b {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</b>"
        },
        {
            type: HTMLNodeType.HTML_BIG,
            template: "\\<big {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</big>"
        },
        {
            type: HTMLNodeType.HTML_SMALL,
            template: "\\<small {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</small>"
        },
        {
            type: HTMLNodeType.HTML_EM,
            template: "\\<em {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</em>"
        },
        {
            type: HTMLNodeType.HTML_STRONG,
            template: "\\<strong {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</strong>"
        },
        {
            type: HTMLNodeType.HTML_DFN,
            template: "\\<dfn {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</dfn>"
        },
        {
            type: HTMLNodeType.HTML_CODE,
            template: "\\<code {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</code>"
        },
        {
            type: HTMLNodeType.HTML_SAMP,
            template: "\\<samp {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</samp>"
        },
        {
            type: HTMLNodeType.HTML_KBD,
            template: "\\<kbd {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</kbd>"
        },
        {
            type: HTMLNodeType.HTML_VAR,
            template: "\\<var {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</var>"
        },
        {
            type: HTMLNodeType.HTML_CITE,
            template: "\\<cite {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</cite>"
        },
        {
            type: HTMLNodeType.HTML_ABBR,
            template: "\\<abbr {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</abbr>"
        },
        {
            type: HTMLNodeType.HTML_ACRONYM,
            template: "\\<acronym {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</acronym>"
        },
        {
            type: HTMLNodeType.HTML_SUP,
            template: "\\<sup {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</sup>"
        },
        {
            type: HTMLNodeType.HTML_SPAN,
            template: "\\<span {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</span>"
        },
        {
            type: HTMLNodeType.HTML_BDO,
            template: "\\<bdo {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</bdo>"
        },
        {
            type: HTMLNodeType.HTML_BR,
            template: "\\<br {attribute: o:s} @attributes...[m:s] \\/>"
        },
        {
            type: HTMLNodeType.HTML_BODY,
            template: "\\<body {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</body>"
        },
        {
            type: HTMLNodeType.HTML_ADDRESS,
            template: "\\<address {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</address>"
        },
        {
            type: HTMLNodeType.HTML_A,
            template: "\\<a {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</a>"
        },
        {
            type: HTMLNodeType.HTML_MAP,
            template: "\\<map {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</map>"
        },
        {
            type: HTMLNodeType.HTML_AREA,
            template: "\\<area {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</area>"
        },
        {
            type: HTMLNodeType.HTML_LINK,
            template: "\\<link {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</link>"
        },
        {
            type: HTMLNodeType.HTML_IMG,
            template: "\\<img {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</img>"
        },
        {
            type: HTMLNodeType.HTML_OBJECT,
            template: "\\<object {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</object>"
        },
        {
            type: HTMLNodeType.HTML_PARAM,
            template: "\\<param {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</param>"
        },
        {
            type: HTMLNodeType.HTML_HR,
            template: "\\<hr {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</hr>"
        },
        {
            type: HTMLNodeType.HTML_P,
            template: "\\<p {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</p>"
        },
        {
            type: HTMLNodeType.HTML_H1,
            template: "\\<h1 {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</h1>"
        },
        {
            type: HTMLNodeType.HTML_H2,
            template: "\\<h2 {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</h2>"
        },
        {
            type: HTMLNodeType.HTML_H3,
            template: "\\<h3 {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</h3>"
        },
        {
            type: HTMLNodeType.HTML_H4,
            template: "\\<h4 {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</h4>"
        },
        {
            type: HTMLNodeType.HTML_H5,
            template: "\\<h5 {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</h5>"
        },
        {
            type: HTMLNodeType.HTML_H6,
            template: "\\<h6 {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</h6>"
        },
        {
            type: HTMLNodeType.HTML_PRE,
            template: "\\<pre {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</pre>"
        },
        {
            type: HTMLNodeType.HTML_Q,
            template: "\\<q {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</q>"
        },
        {
            type: HTMLNodeType.HTML_BLOCKQUOTE,
            template: "\\<blockquote {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</blockquote>"
        },
        {
            type: HTMLNodeType.HTML_INS,
            template: "\\<ins {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</ins>"
        },
        {
            type: HTMLNodeType.HTML_DEL,
            template: "\\<del {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</del>"
        },
        {
            type: HTMLNodeType.HTML_DL,
            template: "\\<dl {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</dl>"
        },
        {
            type: HTMLNodeType.HTML_DT,
            template: "\\<dt {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</dt>"
        },
        {
            type: HTMLNodeType.HTML_DD,
            template: "\\<dd {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</dd>"
        },
        {
            type: HTMLNodeType.HTML_OL,
            template: "\\<ol {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</ol>"
        },
        {
            type: HTMLNodeType.HTML_UL,
            template: "\\<ul {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</ul>"
        },
        {
            type: HTMLNodeType.HTML_LI,
            template: "\\<li {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</li>"
        },
        {
            type: HTMLNodeType.HTML_FORM,
            template: "\\<form {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</form>"
        },
        {
            type: HTMLNodeType.HTML_LABEL,
            template: "\\<label {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</label>"
        },
        {
            type: HTMLNodeType.HTML_INPUT,
            template: "\\<input {attributes: m:s @attributes...[m:s]} o:s \\/>"
        },
        {
            type: HTMLNodeType.HTML_SELECT,
            template: "\\<select {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</select>"
        },
        {
            type: HTMLNodeType.HTML_OPTGROUP,
            template: "\\<optgroup {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</optgroup>"
        },
        {
            type: HTMLNodeType.HTML_OPTION,
            template: "\\<option {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</option>"
        },
        {
            type: HTMLNodeType.HTML_TEXTAREA,
            template: "\\<textarea {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</textarea>"
        },
        {
            type: HTMLNodeType.HTML_FIELDSET,
            template: "\\<fieldset {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</fieldset>"
        },
        {
            type: HTMLNodeType.HTML_LEGEND,
            template: "\\<legend {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</legend>"
        },
        {
            type: HTMLNodeType.HTML_BUTTON,
            template: "\\<button {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</button>"
        },
        {
            type: HTMLNodeType.HTML_TABLE,
            template: "\\<table {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</table>"
        },
        {
            type: HTMLNodeType.HTML_CAPTION,
            template: "\\<caption {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</caption>"
        },
        {
            type: HTMLNodeType.HTML_THEAD,
            template: "\\<thead {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</thead>"
        },
        {
            type: HTMLNodeType.HTML_TFOOT,
            template: "\\<tfoot {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</tfoot>"
        },
        {
            type: HTMLNodeType.HTML_TBODY,
            template: "\\<tbody {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</tbody>"
        },
        {
            type: HTMLNodeType.HTML_COLGROUP,
            template: "\\<colgroup {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</colgroup>"
        },
        {
            type: HTMLNodeType.HTML_COL,
            template: "\\<col {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</col>"
        },
        {
            type: HTMLNodeType.HTML_TR,
            template: "\\<tr {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</tr>"
        },
        {
            type: HTMLNodeType.HTML_TH,
            template: "\\<th {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</th>"
        },
        {
            type: HTMLNodeType.HTML_TD,
            template: "\\<td {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</td>"
        },
        {
            type: HTMLNodeType.HTML_HEAD,
            template: "\\<head {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</head>"
        },
        {
            type: HTMLNodeType.HTML_TITLE,
            template: "\\<title {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</title>"
        },
        {
            type: HTMLNodeType.HTML_BASE,
            template: "\\<base {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</base>"
        },
        {
            type: HTMLNodeType.HTML_META,
            template: "\\<meta {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</meta>"
        },
        {
            type: HTMLNodeType.HTML_STYLE,
            template: "\\<style {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</style>"
        },
        {
            type: HTMLNodeType.HTML_SCRIPT,
            template: "\\<script {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</script>"
        },
        {
            type: HTMLNodeType.HTML_NOSCRIPT,
            template: "\\<noscript {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</noscript>"
        },
        {
            type: HTMLNodeType.HTML_HTML,
            template: "\\<html {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</html>"
        },
        {
            type: HTMLNodeType.HTML_SVG,
            template: "\\<svg {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</svg>"
        },
        {
            type: HTMLNodeType.HTML_BINDING_ELEMENT,
            template: "\\<svg {attributes: m:s @attributes...[m:s]} \\> i:s o:n @nodes... i:e o:n  \\</svg>"
        },
        {
            type: HTMLNodeType.HTMLAttribute,
            template: "@name { value : \= @value} ",
        },
        {
            type: HTMLNodeType.HTML_Element,
            template: `\\< @tag 
                {attributes: m:s @attributes...[m:s]} 
                {   
                    nodes: \\> i:s o:n @nodes... i:e o:n  \\</ @tag \\> 
                    or 
                    \\/>  
                } `,
        },
        {
            type: HTMLNodeType.WickBinding,
            template: "\\{ @primary_ast \\}",
        },
        {
            type: HTMLNodeType.HTMLText,
            template: "@data",
        },
    ]
};

const lu_table = new Map(wick_mappings.mappings.map((i, j) => [i.type, j]));
wick_mappings.type_lookup = (node, name) => lu_table.get(node.type) ?? undefined;
export const wick_renderers = experimentalConstructRenderers(<NodeMappings<Node, "type">>wick_mappings);

