import { traverse } from '@candlelib/conflagrate';
import { JSIdentifierReference, JSNode, JSNodeType } from '@candlelib/js';
import { HOOK_SELECTOR, HTMLNodeClass, HTMLNodeType } from "../../types/all.js";
import { registerFeature } from '../build_system.js';
import { Name_Is_A_Binding_Variable, Variable_Is_Declared_In_Closure } from '../common/binding.js';
import { registerHookType } from '../common/extended_types.js';

registerFeature(

    "CandleLibrary WICK: JS Expressions",
    (build_system) => {
        function findFirstNodeOfType(type: JSNodeType, ast: JSNode) {

            for (const { node } of traverse(ast, "nodes"))
                if (node.type == type) return node;

            return null;
        };

        /* ###################################################################
         * AWAIT EXPRESSION
         */
        build_system.registerJSParserHandler(
            {
                priority: 1,

                async prepareJSNode(node, parent_node, skip, component, context, frame) {
                    frame.IS_ASYNC = true;
                }

            }, JSNodeType.AwaitExpression
        );

        /**############################################################
         * DEBUGGER STATEMENT 
         */
        build_system.registerJSParserHandler(
            {
                priority: 1,

                prepareJSNode(node, parent_node, skip, component, context, frame) {
                    if (context.options.REMOVE_DEBUGGER_STATEMENTS)
                        return null;
                }

            }, JSNodeType.DebuggerStatement
        );

        /*############################################################
        * EXPRESSION STATEMENTS
        + Post(++|--) and (++|--)Pre increment expressions
        */
        // Naked Style Element. Styles whole component.
        build_system.registerJSParserHandler(
            {
                priority: 1,

                prepareJSNode(node, parent_node, skip, component, context, frame) {
                    const [expr] = node.nodes;

                    if (expr.type == JSNodeType.CallExpression) {
                        const [id] = expr.nodes;

                        if (frame.IS_ROOT) {

                            if (id.type == JSNodeType.IdentifierReference
                                && id.value == "watch") {

                                expr.type = registerHookType("watch-call", JSNodeType.CallExpression);

                                build_system.addIndirectHook(component, expr.type, {
                                    hook_value: expr,
                                    host_node: node,
                                    html_element_index: 0,
                                    pos: <any>node.pos
                                });

                                return null;
                            }
                        } else {
                            const ref = <JSIdentifierReference>findFirstNodeOfType(
                                JSNodeType.IdentifierReference, expr
                            );

                            if (ref && Name_Is_A_Binding_Variable(<string>ref.value, frame)) {
                                //Assumes that the refereneced object is modified in some
                                //way from a call on one of its members or submembers.
                                build_system.addWriteFlagToBindingVariable(<string>ref.value, frame);
                            }
                        }
                    }

                    if (node.nodes[0].type == HTMLNodeType.HTML_STYLE) {
                        return new Promise(async res => {
                            await build_system.processCSSNode(<any>node.nodes[0], component, context, component.location, 0);
                            res(null);
                        });
                    }
                }

            }, JSNodeType.ExpressionStatement
        );



        /*############################################################
        * ASSIGNMENT + POST/PRE EXPRESSIONS
        + Post(++|--) and (++|--)Pre increment expressions
        */
        build_system.registerJSParserHandler(
            {
                priority: 1,

                prepareJSNode(node, parent_node, skip, component, context, frame) {
                    for (const { node: id } of traverse(<JSNode>node, "nodes")
                        .filter("type", JSNodeType.IdentifierReference)
                    ) {
                        const name = (<JSIdentifierReference>id).value;

                        if (!Variable_Is_Declared_In_Closure(name, frame)) {

                            if (Name_Is_A_Binding_Variable(name, frame))
                                build_system.addBindingReference(<JSNode>node, <JSNode>parent_node, frame);
                            else
                                id.pos.throw(
                                    `Invalid access of undeclared variable [${name}]`,
                                    component.location.toString()
                                );

                            build_system.addWriteFlagToBindingVariable(name, frame);
                        }

                        skip(1);

                        break;
                    }
                }
            }, JSNodeType.AssignmentExpression, JSNodeType.PostExpression, JSNodeType.PreExpression
        );

        /*############################################################
        * ASSIGNMENT + POST/PRE EXPRESSIONS
        + Post(++|--) and (++|--)Pre increment expressions
        */
        build_system.registerJSParserHandler(
            {
                priority: 1,

                async prepareJSNode(node, parent_node, skip, component, context, frame) {

                    if (node.type & HTMLNodeClass.HTML_ELEMENT) {

                        skip();

                        return <any>await build_system.processHTMLNode(<any>node, component, context, false);
                    }
                }
            }, ...Object.values(HTMLNodeType).filter((i): i is HTMLNodeType => typeof i == "number")
        );
    }
);