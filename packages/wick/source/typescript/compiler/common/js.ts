import { traverse } from "@candlelib/conflagrate";
import { JSBindingProperty, JSExpressionClass, JSIdentifier, JSIdentifierClass, JSMethod, JSNode, JSNodeClass, JSNodeType } from "@candlelib/js";
import { parse_js_exp } from "../source-code-parse/parse.js";

/**
 * Create an AST of the form
 * ```js
 * name : property_value
 * 
 * ````
 * 
 * @param name :  A string or @type {JSNode} specifying the name of the property.
 * @param value : A string or @type {JSNode} specifying the value of the property.
 * @param {boolean} COMPUTED
 * If true the returned computed value should appear as:
 * 
 * ```js
 * [name] : property_value
 * ```
 */
export function getPropertyAST(name: string | JSNode, value: string | JSNode, COMPUTED: boolean = false) {


    return parse_js_exp(`({${name}:${value}})`).nodes[0].nodes[0];
}

/**
 * Create a class method AST
 * @param name  Name of the classrender method
 * @param arg_string  String value of the class method arguments.
 * @param body_string  String value of the class method body.
 */
export function getGenericMethodNode(name = "generic", arg_string = "_null_", body_string = ";"): JSMethod {

    const node = <JSMethod>parse_js_exp(`({${name}(${arg_string}){${body_string}}})`).nodes[0].nodes[0];

    if (body_string == ";")
        node.nodes[2].nodes.length = 0;

    if (arg_string == "_null_")
        node.nodes[1].nodes.length = 0;

    return node;
}

export function convertObjectToJSNode(obj: any): JSNode {

    switch (typeof obj) {
        case "string":
            return <JSNode>parse_js_exp(`"${obj.replace(/\"/g, "\\\"").replace(/\n/g, "\\\n")}"`);
        case "boolean":
        case "undefined":
        case "number":
            return <JSNode>parse_js_exp(`${obj}`);
        case "object": {

            if (Array.isArray(obj)) {
                const node = parse_js_exp("[]");

                for (const o of obj)
                    //@ts-ignore
                    node.nodes.push(convertObjectToJSNode(o));

                return <JSNode>node;
            }

            const node = parse_js_exp("({})").nodes[0];

            for (const name in obj) {
                const val = convertObjectToJSNode(obj[name]);
                //@ts-ignore
                node.nodes.push(<JSBindingProperty>{
                    type: JSNodeType.PropertyBinding,
                    nodes: [parse_js_exp(name), val],
                    symbol: ":"
                });
            }

            return <JSNode>node;
        }

    }

    return null;
}

export function Node_Is_Identifier(node: JSNode): node is JSIdentifier {
    return (node.type & JSNodeClass.IDENTIFIER) > 0;
}


export function Expression_Contains_Await(input_node: JSNode) {
    for (const { node } of traverse(input_node, "nodes").filter("type", JSNodeType.AwaitExpression))
        return true;
    return false;
}

export function getFirstMatchingReferenceIdentifier(input_node: JSNode, id_value: string): JSNode {
    for (const { node } of traverse(input_node, "nodes").bitFilter("type", JSNodeClass.IDENTIFIER)) {
        //@ts-ignore
        if (node.value == id_value) return node;
    }
    return null;
}

export function getFirstReferenceNode(node: JSNode): JSIdentifierClass {
    for (const { node: id } of traverse(node, "nodes").filter("type",
        JSNodeType.IdentifierReference,
        JSNodeType.IdentifierProperty,
        JSNodeType.IdentifierName | JSNodeClass.PROPERTY_NAME,
    ))
        return <JSIdentifierClass>id;
    return null;
}

export function getFirstReferenceName(node: JSNode): string {

    const ref = getFirstReferenceNode(node);

    if (ref)
        return <string>ref.value;
    return "";
}