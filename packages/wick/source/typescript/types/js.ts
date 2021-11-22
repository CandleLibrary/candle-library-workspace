import { JSNode, JSNodeBase } from "@candlelib/js";
import { ComponentData } from '../compiler/common/component.js';
import { Context } from '../compiler/common/context.js';
import { FunctionFrame } from "./function_frame";
import { HTMLNode } from "./wick_ast.js";


export interface JSHandler<T = JSNode> {
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
     * @param replace_element Available when parsing a nodes attributes. Allows the JSElement node to be replaced or removed.
     * @param component
     * 
     * @async May return a promise that resolves to the givin return types.
     * 
     * @return @type {HTMLNode} | @type {void} | @type {Promise}
     */
    prepareJSNode(
        node: T,
        parent_node: JSNode | HTMLNode,
        skip: (amount?: number) => void,
        component: ComponentData,
        context: Context,
        frame: FunctionFrame
    ):
        (T | JSNode | void)
        | Promise<T | JSNode | void>;

}


export type ComponentIdentifierBinding = 0xFFFFFFFFFFFF;


export interface JSComponentBindingNode extends JSNodeBase {
    type: ComponentIdentifierBinding;
    value: string,
}


export type WickJSNode = JSNode | JSComponentBindingNode;