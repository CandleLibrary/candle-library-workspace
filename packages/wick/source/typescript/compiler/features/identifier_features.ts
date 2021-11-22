import { traverse } from '@candlelib/conflagrate';
import {
    JSExpressionClass,
    JSExpressionStatement,
    JSIdentifierBinding,
    JSIdentifierReference,
    JSMemberExpression,
    JSNode,
    JSNodeClass,
    JSNodeType, tools
} from '@candlelib/js';
import {
    BINDING_VARIABLE_TYPE,
    STATIC_RESOLUTION_TYPE,
    BINDING_FLAG
} from '../../types/all.js';
import { registerFeature } from './../build_system.js';
import { Name_Is_A_Binding_Variable, Variable_Is_Declared_In_Closure, Variable_Is_Declared_Locally } from './../common/binding.js';
import { BindingIdentifierBinding, BindingIdentifierReference } from './../common/js_hook_types.js';

registerFeature(

    "CandleLibrary WICK: JS Identifiers and Variables",
    (build_system) => {

        /*############################################################3
        * HOST MODEL REFERENCE IDENTIFIER
        * 
        * Allows the binding identifier to be updated from the host component's model.
        */
        build_system.registerJSParserHandler(
            {
                priority: -1000,

                async prepareJSNode(node: JSMemberExpression, parent_node, skip, component, context, frame) {

                    const name = build_system.js.getFirstReferenceName(node);

                    if (name == "$host") {

                        const child = <any>node.nodes[1];

                        if (child.type == (JSNodeType.IdentifierName | JSNodeClass.PROPERTY_NAME))
                            child.type = JSNodeType.IdentifierReference;

                        const name = build_system.js.getFirstReferenceName(child);

                        build_system.addBindingVariable(
                            frame, name, child.pos, BINDING_VARIABLE_TYPE.ATTRIBUTE_VARIABLE, name,
                            BINDING_FLAG.ALLOW_UPDATE_FROM_MODEL | BINDING_FLAG.FROM_PARENT
                        );

                        await build_system.processNodeAsync(child, frame, component, context);

                        skip();

                        return child;

                    }
                }
            }, JSNodeType.MemberExpression
        );

        /*############################################################3
        * IDENTIFIER REFERENCE
        */
        build_system.registerJSParserHandler(
            {
                priority: -3000,

                prepareJSNode(node, parent_node, skip, component, context, frame) {

                    const name = (<JSIdentifierReference>node).value;

                    if (node.type !== BindingIdentifierReference) {
                        if (!Variable_Is_Declared_In_Closure(name, frame)) {

                            build_system.addBindingReference(
                                <JSNode>node, <JSNode>parent_node, frame
                            );

                            if (Name_Is_A_Binding_Variable(name, frame)) {

                                build_system.addReadFlagToBindingVariable(name, frame);
                            }
                        } else {
                            build_system.addNameToDeclaredVariables(name, frame);
                        }
                    }
                    return <JSNode>node;
                }
            }, JSNodeType.IdentifierReference
        );

        /*############################################################ 
        * IDENTIFIER BINDING
        */
        build_system.registerJSParserHandler(
            {
                priority: 1,

                prepareJSNode(node, parent_node, skip, component, context, frame) {

                    if (node.type !== BindingIdentifierBinding) {
                        const name = tools.getIdentifierName(<JSIdentifierBinding>node);
                        if (!Variable_Is_Declared_Locally(name, frame))
                            build_system.addNameToDeclaredVariables(name, frame);
                    }

                    return <JSNode>node;
                }
            }, JSNodeType.IdentifierBinding
        );
        // ###################################################################
        // VARIABLE DECLARATION STATEMENTS - CONST, LET, VAR
        //
        // These variables are accessible by all bindings within the components
        // scope. 
        build_system.registerJSParserHandler(
            {
                priority: 1,

                async prepareJSNode(node, parent_node, skip, component, context, frame) {

                    const
                        n = build_system.setPos(build_system.js.stmt("a,a;"), node.pos),
                        IS_CONSTANT = (node.type == JSNodeType.LexicalDeclaration && (<any>node).symbol == "const"),
                        [{ nodes }] = n.nodes;

                    nodes.length = 0;


                    //Add all elements to global 
                    for (const { node: binding, meta } of traverse(node, "nodes", 4)
                        .filter("type", JSNodeType.IdentifierBinding, JSNodeType.BindingExpression)
                        .makeMutable()
                        .makeSkippable()
                    ) {
                        if (binding.type == JSNodeType.BindingExpression) {

                            const
                                [identifier, value] = binding.nodes,
                                l_name = tools.getIdentifierName(identifier);

                            if (frame.IS_ROOT) {

                                if (!build_system.addBindingVariable(frame, l_name, binding.pos,
                                    IS_CONSTANT
                                        ? BINDING_VARIABLE_TYPE.CONST_INTERNAL_VARIABLE
                                        : BINDING_VARIABLE_TYPE.INTERNAL_VARIABLE

                                )) {
                                    const msg = `Redeclaration of the binding variable [${l_name}]. 
                                First declaration here:\n${component.root_frame.binding_variables.get(l_name).pos.blame()}
                                redeclaration here:\n${(<any>binding.pos).blame()}\nin ${component.location}`;
                                    throw new ReferenceError(msg);
                                }

                                build_system.addWriteFlagToBindingVariable(l_name, frame);

                                // Change binding type to an Assignment Expression to ensure the 
                                // build process can correctly create runtime binding hooks. 
                                //@ts-ignore
                                binding.type = JSNodeType.AssignmentExpression;

                                build_system.addBindingReference(<JSNode>binding, <JSNode>parent_node, frame);

                                const new_node = await build_system.processNodeAsync(binding, frame, component, context, true);

                                build_system.addDefaultValueToBindingVariable(frame, l_name, <JSNode>new_node.nodes[1]);

                                // Wrap in an expression statement node to ensure proper rendering of 
                                // semicolons. Particularly important in minified outputs. 

                                const expression_statement: JSExpressionStatement = {
                                    type: JSNodeType.ExpressionStatement,
                                    nodes: [<JSExpressionClass>new_node],
                                    pos: binding.pos
                                };

                                meta.mutate(expression_statement);

                                meta.skip();

                            } else {
                                const new_node = await build_system.processNodeAsync(binding, frame, component, context, true);
                                meta.mutate(new_node);
                                build_system.addNameToDeclaredVariables(l_name, frame);
                            }

                        } else {
                            if (frame.IS_ROOT) {
                                if (!build_system.addBindingVariable(frame, (<JSIdentifierReference>binding).value, binding.pos,
                                    IS_CONSTANT
                                        ? BINDING_VARIABLE_TYPE.CONST_INTERNAL_VARIABLE
                                        : BINDING_VARIABLE_TYPE.INTERNAL_VARIABLE

                                )) {
                                    const msg = `Redeclaration of the binding variable [${(<JSIdentifierReference>binding).value}]. 
                                First declaration here:\n${component.root_frame.binding_variables.get((<JSIdentifierReference>binding).value).pos.blame()}
                                redeclaration here:\n${(<any>binding.pos).blame()}\nin ${component.location}`;
                                    throw new ReferenceError(msg);
                                }
                            } else
                                build_system.addNameToDeclaredVariables((<JSIdentifierReference>binding).value, frame);
                        }
                    }

                    skip();

                    if (frame.IS_ROOT)
                        return node.nodes;

                    return <any>node;
                }
            }, JSNodeType.VariableStatement, JSNodeType.LexicalDeclaration, JSNodeType.LexicalBinding
        );

        // ###################################################################
        // Call Expression Identifiers
        //
        // If the identifier is used as the target of a call expression, add the call
        // expression node to the variable's references list.
        build_system.registerJSParserHandler(
            {
                priority: 1,

                async prepareJSNode(node, parent_node, skip, component, context, frame) {

                    node = await build_system.processNodeAsync(<JSNode>node, frame, component, context, true);

                    const
                        [id] = node.nodes,
                        name = <string>build_system.js.getFirstReferenceName(<JSNode>id);//.value;

                    if (
                        name
                        && !Variable_Is_Declared_In_Closure(name, frame)
                        && Name_Is_A_Binding_Variable(name, frame)
                    ) {

                        build_system.addBindingReference(
                            <JSNode>id,
                            <JSNode>node,
                            frame
                        );

                        build_system.addReadFlagToBindingVariable(name, frame);

                        skip(1);
                    }

                    return <JSNode>node;
                }
            }, JSNodeType.CallExpression
        );

        /**
         *  
         */
        build_system.registerHookHandler<JSIdentifierBinding | JSIdentifierReference, JSExpressionClass>({

            description: `
            Auto-Hook For Direct Access Binding Variables
            * 
            * CONST_INTERNAL_VARIABLE
            * METHOD_VARIABLE
            * MODULE_MEMBER_VARIABLE
            * MODULE_VARIABLE
            `,

            name: "Auto-Hook Static-Constant Value",

            types: [BindingIdentifierBinding, BindingIdentifierReference],

            verify: () => true,

            buildJS: async (node, sdp, _3, _, _1, _2) => {

                const binding_var = build_system.getComponentBinding(node.value, sdp.self);

                if (
                    build_system.getBindingStaticResolutionType(binding_var, sdp)
                    ==
                    STATIC_RESOLUTION_TYPE.CONSTANT_STATIC
                    &&
                    binding_var.type == BINDING_VARIABLE_TYPE.CONST_INTERNAL_VARIABLE
                ) {

                    const value = await build_system.getStaticAST(<any>node, sdp, true);

                    if (value) return <JSExpressionClass>value;
                }
            },

            buildHTML: () => null
        });
    }
);