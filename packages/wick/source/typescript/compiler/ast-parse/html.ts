import { exp } from "@candlelib/js";
import { Context } from '../common/context.js';
import { HTMLHandler } from "../../types/all.js";
import {
    HTMLNode, HTMLNodeType,
    WickBindingNode, WICK_AST_NODE_TYPE_BASE, WICK_AST_NODE_TYPE_SIZE
} from "../../types/wick_ast.js";
import { ComponentData } from '../common/component.js';
import { processNodeAsync } from "./parse.js";

const default_handler = {
    priority: -Infinity,
    prepareHTMLNode(node) { return node; }
};

export const html_handlers: Array<HTMLHandler[]> = Array(WICK_AST_NODE_TYPE_SIZE).fill(null).map(() => [default_handler]);

export function loadHTMLHandlerInternal<T = HTMLNode, P = HTMLNode>(handler: HTMLHandler<T, P>, ...types: HTMLNodeType[]) {

    for (const type of types) {

        const handler_array: any[] = html_handlers[Math.max((type >>> 23) - WICK_AST_NODE_TYPE_BASE, 0)];

        //Infinity priority modules cannot be replaced 
        if (handler_array[0]?.priority >= Infinity) { return; }

        handler_array.push(handler);
        handler_array.sort((a, b) => b.priority - a.priority);
    }
}

export function loadHTMLHandler(handler: HTMLHandler, ...types: HTMLNodeType[]) {

    const modified_handler = Object.assign({}, handler);

    modified_handler.priority = Math.min(Math.abs(modified_handler.priority), 99999999);

    return loadHTMLHandlerInternal(modified_handler, ...types);
}
/**
 * Process a wick `{ expression }` binding node.
 * @param node 
 * @param component 
 * @param context 
 * @returns 
 */
export async function processBindingASTAsync(node: string | WickBindingNode, component: ComponentData, context: Context) {
    let ast = null;

    if (typeof node !== "object") {
        ast = exp(node + "");
    } else
        ast = node.primary_ast;

    return processNodeAsync(ast, component.root_frame, component, context);
}
