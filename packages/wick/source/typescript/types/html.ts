import { ComponentData } from '../compiler/common/component.js';
import { Context } from '../compiler/common/context.js';
import { HTMLNode } from "./wick_ast.js";

export const enum htmlState {
    IS_ROOT = 1,
    EXTERNAL_COMPONENT = 2,
    IS_COMPONENT = 4,
    IS_SLOT_REPLACEMENT = 8,
    IS_INTERLEAVED = 16
}

export interface HTMLHandler<T = HTMLNode, P = HTMLNode> {
    priority: number;
    /**
     *
     * If return object is the node argument, the outgoing ast will not be modified in any way.
     *
     * If return object is undefined, the next handler will be selected to process the node. In
     * this event, the returning handler should not modify the node in any way.
     *
    * If return object is null, the node will be removed from the outgoing AST.
    *
     * @param node
     * @param host_node
     * @param host_element_node
     * @param element_index
     * @param skip
     * @param replace_element Available when parsing a nodes attributes. Allows the HTMLElement node to be replaced or removed.
     * @param component
     * 
     * @async May return a promise that resolves to the givin return types.
     * 
     * @return @type {HTMLNode} | @type {void} | @type {Promise}
     */
    prepareHTMLNode(
        node: T,
        /**
         * The host (or parent) HTMLNode or HTMLAttribute of `node`
         */
        host_node: P,
        /**
         * The host HTMLNode 
         */
        host_element_node: P,
        /**
         * The index position of the HTMLNode when traversed
         * depth first. Zero starting position
         */
        element_index: number,
        skip: () => void,
        component: ComponentData,
        context: Context
    ):
        (T | P | (P | T)[])
        | void
        | Promise<T | P | (T | P)[] | void>;
}

export interface TemplateHTMLNode {
    tagName?: string;
    data?: string;
    attributes?: Map<string, string>;
    children?: TemplateHTMLNode[];
    strings?: string[];
    namespace?: number;
}

export type TemplatePackage = {
    html: TemplateHTMLNode[];
    templates: Map<string, TemplateHTMLNode>;
};

export type HookTemplatePackage = {
    value: any,
    html?: TemplateHTMLNode;
    templates?: Map<string, TemplateHTMLNode>;
};
