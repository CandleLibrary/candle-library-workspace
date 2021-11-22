import { ext, JSExpressionClass, JSNode, JSNodeClass, JSNodeType, JSStatementClass } from "@candlelib/js";
import { FunctionFrame } from "../../types/function_frame";
import { ComponentData } from './component.js';
import { getGenericMethodNode } from "./js.js";
/**
 * Create a new function frame whose ultimately use is to be 
 * incorporated into the output class as a class method.
 * @param name - The name of the method
 * @param arg_string - A string representing the arguments of the method
 * @returns {FunctionFrame}
 */
export function createBuildFrame(name, arg_string = "_null_"): FunctionFrame {
    return {
        method_name: name,
        input_names: null,
        IS_ASYNC: false,
        IS_ROOT: false,
        ATTRIBUTE: false,
        IS_TEMP_CLOSURE: false,
        ast: getGenericMethodNode(name, arg_string),
        output_names: null,
        declared_variables: null,
        binding_ref_identifiers: null,
    };
}

export function createParseFrame(
    parent_frame: any,
    component: ComponentData,
    DO_NOT_ATTACH: boolean = false,
    TEMPORARY: boolean = DO_NOT_ATTACH
): FunctionFrame {

    const function_frame = <FunctionFrame>{
        method_name: "",
        ast: null,
        declared_variables: new Set(),
        input_names: new Set(),
        output_names: new Set(),
        binding_ref_identifiers: [],
        prev: parent_frame,
        IS_ASYNC: false,
        IS_ROOT: !parent_frame,
        IS_TEMP_CLOSURE: TEMPORARY,
        binding_variables: (!parent_frame) ? new Map : null,
    };

    if (!parent_frame)
        component.root_frame = function_frame;

    if (!DO_NOT_ATTACH)
        component.frames.push(function_frame);

    return function_frame;
}

export function getFrameFromName(name: string, component: ComponentData) {
    return component.frames.filter(({ method_name: n }) => n == name)[0] || null;
}

export function Frame_Has_Statements({ ast, IS_ROOT }: FunctionFrame): boolean {
    return (ast && ast.nodes[2] && ast.nodes[2].nodes.length > 0);
}

export function getStatementsFromRootFrame(frame: FunctionFrame): JSStatementClass[] {
    return <JSStatementClass[]><any[]>((frame.IS_ROOT) ? frame?.ast?.nodes.filter(s => <any>s.type !== JSNodeType.EmptyStatement) ?? [] : []);
}


export function getStatementsFromFrame(frame: FunctionFrame): JSStatementClass[] {
    if (Frame_Has_Statements(frame))
        return frame.ast.nodes[2].nodes.slice();
    return [];
}

export function prependStmtToFrame({ ast }: FunctionFrame, ...stmt: JSNode[]) {

    for (const node of stmt.reverse())
        if (node.type & (JSNodeClass.DECLARATION | JSNodeClass.STATEMENT)) {
            if (node.nodes && node.nodes.length == 0) continue;
            ast.nodes[2].nodes.unshift(<JSStatementClass>node);
        } else
            ast.nodes[2].nodes.unshift({ type: JSNodeType.ExpressionStatement, nodes: [<JSExpressionClass>node], pos: node.pos });
}

export function appendStmtToFrame({ ast }: FunctionFrame, ...stmt: JSNode[]) {

    for (const node of stmt)
        if (node.type & (JSNodeClass.DECLARATION | JSNodeClass.STATEMENT)) {
            if (node.nodes.length == 0) continue;
            ast.nodes[2].nodes.push(<JSStatementClass>node);
        } else
            ast.nodes[2].nodes.push({ type: JSNodeType.ExpressionStatement, nodes: [<JSExpressionClass>node], pos: node.pos });
}
