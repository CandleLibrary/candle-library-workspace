import { CSSNode } from "@candlelib/css";
import { Token } from '@candlelib/hydrocarbon';
import { JSNode } from "@candlelib/js";
import { ComponentData } from '../compiler/common/component';

export const enum HTMLNodeClass {
    HTML_NODE = (1 << 20),
    HTML_ELEMENT = (1 << 21)
}

export const WICK_AST_NODE_TYPE_BASE = 147;
export const WICK_AST_NODE_TYPE_SIZE = 87;


/**
 * Wick node values and types. Extends JavaScript nodes described in @candlelib/js, and CSS nodes described in @candlelib/css
 */

export enum HTMLNodeType {
    WickBinding = (147 << 23),
    HTML_IMPORT = ((148 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTMLAttribute = ((149 << 23) | HTMLNodeClass.HTML_NODE),
    HTMLText = ((150 << 23) | HTMLNodeClass.HTML_NODE),
    ERROR = ((151 << 23)),
    HTML_Element = ((152 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_TEXT = ((153 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_TT = ((154 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_I = ((155 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_B = ((156 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_BIG = ((157 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_SMALL = ((158 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_EM = ((159 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_STRONG = ((160 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_DFN = ((161 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_CODE = ((162 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_SAMP = ((163 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_KBD = ((164 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_VAR = ((165 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_CITE = ((166 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_ABBR = ((167 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_ACRONYM = ((168 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_SUP = ((169 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_SPAN = ((170 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_BDO = ((171 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_BR = ((172 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_BODY = ((173 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_ADDRESS = ((174 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_DIV = ((175 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_A = ((176 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_MAP = ((177 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_AREA = ((178 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_LINK = ((179 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_IMG = ((180 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_OBJECT = ((181 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_PARAM = ((182 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_HR = ((183 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_P = ((184 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_H1 = ((185 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_H2 = ((186 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_H3 = ((187 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_H4 = ((188 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_H5 = ((189 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_H6 = ((190 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_PRE = ((191 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_Q = ((192 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_BLOCKQUOTE = ((193 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_INS = ((194 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_DEL = ((195 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_DL = ((196 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_DT = ((197 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_DD = ((198 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_OL = ((199 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_UL = ((200 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_LI = ((201 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_FORM = ((202 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_LABEL = ((203 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_INPUT = ((204 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_SELECT = ((205 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_OPTGROUP = ((206 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_OPTION = ((207 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_TEXTAREA = ((208 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_FIELDSET = ((209 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_LEGEND = ((210 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_BUTTON = ((211 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_TABLE = ((212 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_CAPTION = ((213 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_THEAD = ((214 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_TFOOT = ((215 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_TBODY = ((216 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_COLGROUP = ((217 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_COL = ((218 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_TR = ((219 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_TH = ((220 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_TD = ((221 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_HEAD = ((222 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_TITLE = ((223 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_BASE = ((224 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_META = ((225 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_STYLE = ((226 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_SCRIPT = ((227 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_NOSCRIPT = ((228 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_HTML = ((229 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_SVG = ((230 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    HTML_BINDING_ELEMENT = ((230 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT),
    CompiledBinding = ((231 << 23)),
    ComponentVariableDeclaration = ((232 << 23)),
    MARKDOWN = ((233 << 23) | HTMLNodeClass.HTML_NODE | HTMLNodeClass.HTML_ELEMENT)
};

export enum HTMLNodeTypeLU {
    WickBinding = HTMLNodeType.WickBinding,
    HTML_IMPORT = HTMLNodeType.HTML_IMPORT,
    HTMLAttribute = HTMLNodeType.HTMLAttribute,
    HTMLText = HTMLNodeType.HTMLText,
    ERROR = HTMLNodeType.ERROR,
    HTML_Element = HTMLNodeType.HTML_Element,
    HTML_TEXT = HTMLNodeType.HTML_TEXT,
    HTML_TT = HTMLNodeType.HTML_TT,
    HTML_I = HTMLNodeType.HTML_I,
    HTML_B = HTMLNodeType.HTML_B,
    HTML_BIG = HTMLNodeType.HTML_BIG,
    HTML_SMALL = HTMLNodeType.HTML_SMALL,
    HTML_EM = HTMLNodeType.HTML_EM,
    HTML_STRONG = HTMLNodeType.HTML_STRONG,
    HTML_DFN = HTMLNodeType.HTML_DFN,
    HTML_CODE = HTMLNodeType.HTML_CODE,
    HTML_SAMP = HTMLNodeType.HTML_SAMP,
    HTML_KBD = HTMLNodeType.HTML_KBD,
    HTML_VAR = HTMLNodeType.HTML_VAR,
    HTML_CITE = HTMLNodeType.HTML_CITE,
    HTML_ABBR = HTMLNodeType.HTML_ABBR,
    HTML_ACRONYM = HTMLNodeType.HTML_ACRONYM,
    HTML_SUP = HTMLNodeType.HTML_SUP,
    HTML_SPAN = HTMLNodeType.HTML_SPAN,
    HTML_BDO = HTMLNodeType.HTML_BDO,
    HTML_BR = HTMLNodeType.HTML_BR,
    HTML_BODY = HTMLNodeType.HTML_BODY,
    HTML_ADDRESS = HTMLNodeType.HTML_ADDRESS,
    HTML_DIV = HTMLNodeType.HTML_DIV,
    HTML_A = HTMLNodeType.HTML_A,
    HTML_MAP = HTMLNodeType.HTML_MAP,
    HTML_AREA = HTMLNodeType.HTML_AREA,
    HTML_LINK = HTMLNodeType.HTML_LINK,
    HTML_IMG = HTMLNodeType.HTML_IMG,
    HTML_OBJECT = HTMLNodeType.HTML_OBJECT,
    HTML_PARAM = HTMLNodeType.HTML_PARAM,
    HTML_HR = HTMLNodeType.HTML_HR,
    HTML_P = HTMLNodeType.HTML_P,
    HTML_H1 = HTMLNodeType.HTML_H1,
    HTML_H2 = HTMLNodeType.HTML_H2,
    HTML_H3 = HTMLNodeType.HTML_H3,
    HTML_H4 = HTMLNodeType.HTML_H4,
    HTML_H5 = HTMLNodeType.HTML_H5,
    HTML_H6 = HTMLNodeType.HTML_H6,
    HTML_PRE = HTMLNodeType.HTML_PRE,
    HTML_Q = HTMLNodeType.HTML_Q,
    HTML_BLOCKQUOTE = HTMLNodeType.HTML_BLOCKQUOTE,
    HTML_INS = HTMLNodeType.HTML_INS,
    HTML_DEL = HTMLNodeType.HTML_DEL,
    HTML_DL = HTMLNodeType.HTML_DL,
    HTML_DT = HTMLNodeType.HTML_DT,
    HTML_DD = HTMLNodeType.HTML_DD,
    HTML_OL = HTMLNodeType.HTML_OL,
    HTML_UL = HTMLNodeType.HTML_UL,
    HTML_LI = HTMLNodeType.HTML_LI,
    HTML_FORM = HTMLNodeType.HTML_FORM,
    HTML_LABEL = HTMLNodeType.HTML_LABEL,
    HTML_INPUT = HTMLNodeType.HTML_INPUT,
    HTML_SELECT = HTMLNodeType.HTML_SELECT,
    HTML_OPTGROUP = HTMLNodeType.HTML_OPTGROUP,
    HTML_OPTION = HTMLNodeType.HTML_OPTION,
    HTML_TEXTAREA = HTMLNodeType.HTML_TEXTAREA,
    HTML_FIELDSET = HTMLNodeType.HTML_FIELDSET,
    HTML_LEGEND = HTMLNodeType.HTML_LEGEND,
    HTML_BUTTON = HTMLNodeType.HTML_BUTTON,
    HTML_TABLE = HTMLNodeType.HTML_TABLE,
    HTML_CAPTION = HTMLNodeType.HTML_CAPTION,
    HTML_THEAD = HTMLNodeType.HTML_THEAD,
    HTML_TFOOT = HTMLNodeType.HTML_TFOOT,
    HTML_TBODY = HTMLNodeType.HTML_TBODY,
    HTML_COLGROUP = HTMLNodeType.HTML_COLGROUP,
    HTML_COL = HTMLNodeType.HTML_COL,
    HTML_TR = HTMLNodeType.HTML_TR,
    HTML_TH = HTMLNodeType.HTML_TH,
    HTML_TD = HTMLNodeType.HTML_TD,
    HTML_HEAD = HTMLNodeType.HTML_HEAD,
    HTML_TITLE = HTMLNodeType.HTML_TITLE,
    HTML_BASE = HTMLNodeType.HTML_BASE,
    HTML_META = HTMLNodeType.HTML_META,
    HTML_STYLE = HTMLNodeType.HTML_STYLE,
    HTML_SCRIPT = HTMLNodeType.HTML_SCRIPT,
    HTML_NOSCRIPT = HTMLNodeType.HTML_NOSCRIPT,
    HTML_HTML = HTMLNodeType.HTML_HTML,
    HTML_SVG = HTMLNodeType.HTML_SVG,
    HTML_BINDING_ELEMENT = HTMLNodeType.HTML_BINDING_ELEMENT,
    CompiledBinding = HTMLNodeType.CompiledBinding,
    ComponentVariableDeclaration = HTMLNodeType.ComponentVariableDeclaration,
    MARKDOWN = HTMLNodeType.MARKDOWN,
}

export interface HTMLNodeBase {
    host_component_index?: number;
    /**
     * The nodes numerical type
     */
    type: HTMLNodeType;
    tag?: string;
    comp?: string,
    import_list?: any[];
    slot_name?: string;
    id?: number;
    child_id?: number;
    component?: ComponentData;
    component_name?: string;
    child_component_index?: number;
    /**
     * child nodes 
     */
    nodes?: HTMLNode[];

    name_space?: number;

    pos: Token;

    /**
     * Name of the key of an attribute node.
     */
    name?: string;

    value?: string;

    parent?: HTMLNode;
}

export interface HTMLBareAttribute {
    //@ts-ignore
    type: HTMLNodeType.HTMLAttribute;

    /**
     * The value of the key component of the 
     * attribute: <name>=...
     */
    name: string;
    /**
     * The value of attribute, following
     * the \= character. May 
     */
    value: string,

    /**
     * Always `false` for bare attributes
     */
    IS_BINDING?: false;
}

export interface HTMLBindingAttribute {
    //@ts-ignore
    type: HTMLNodeType.HTMLAttribute;

    /**
     * The value of the key component of the 
     * attribute: <name>=...
     */
    name: string;
    /**
     * The WickBindingNode representing the
     * JavaScript expression within the binding
     * block following the \= character:
     * `... = { <JSExpression> }`
     */
    value: WickBindingNode,
    /**
     * Always `true` for binding attributes
     */
    IS_BINDING: true;
}

export type HTMLAttribute = HTMLBareAttribute | HTMLBindingAttribute;

export interface WickBindingNode extends HTMLNodeBase {
    //@ts-ignore
    type: HTMLNodeType.WickBinding,
    /**
     * Local Identifier name, ie: name within component.
     */
    local?: string;

    /**
     * External identifier name, ie: name exported to parent. 
     */
    extern?: string;

    /**
     * The primary expression in the `{...}` template 
     */
    primary_ast?: JSNode;

    /**
     * The secondary expression following a semi-colon in the `{...}` template 
     */
    secondary_ast?: JSNode;

    pos: Token;

    /**
     *  true if data is a Binding
     */
    IS_BINDING: true;


    /**
     * Present if the node is a TextNode
     */
    data: string;
}


export interface HTMLTextNode extends HTMLNodeBase {
    /**
     * The nodes numerical type
     */
    type: HTMLNodeType.HTMLText;

    /**
     * A text string
     */
    data: string;
    pos: Token;
}
export interface HTMLElementNode extends HTMLNodeBase {
    attributes?: HTMLAttribute[];
}

export interface HTMLContainerNode extends HTMLElementNode {

    /**
     * 
     * True if the node originally had a CONTAINER tag.
     * (tag value may change during parsing) 
     */
    IS_CONTAINER: true,
    components: ComponentData[],
    component_names: string[],
    component_attributes: [string, string][][];

    /**
     * If node is a <container> node, gives the numerical
     * index order of the container.
     */
    container_id?: number;
}

export interface HTMLVoidElementNode extends HTMLElementNode {
    type: HTMLNodeType.HTML_BR | HTMLNodeType.HTML_INPUT;
}



export type HTMLNode = HTMLVoidElementNode | HTMLTextNode | HTMLContainerNode | WickBindingNode | HTMLElementNode;
export type Node = HTMLNode | CSSNode | JSNode;