import {
    JSNode,
    JSNodeType
} from "@candlelib/js";

import {
    JSHandler, WICK_AST_NODE_TYPE_SIZE
} from "../../types/all.js";

const default_handler = {
    priority: -Infinity,
    prepareJSNode(node) { return node; }
};

export const JS_handlers: Array<JSHandler[]> = Array(512 - WICK_AST_NODE_TYPE_SIZE).fill(null).map(() => [default_handler]);

export function loadJSParseHandlerInternal(handler: JSHandler<JSNode>, ...types: JSNodeType[]) {

    for (const type of types) {

        const handler_array = JS_handlers[Math.max((type >>> 23), 0)];

        //Infinity priority modules cannot be replaced 
        if (handler_array[0]?.priority >= Infinity) { return; }

        handler_array.push(handler);

        handler_array.sort((a, b) => b.priority - a.priority);
    }
}

export function loadJSParseHandler(handler: JSHandler, ...types: JSNodeType[]) {

    const modified_handler = Object.assign({}, handler);

    modified_handler.priority = Math.abs(modified_handler.priority);

    return loadJSParseHandlerInternal(modified_handler, ...types);
}

