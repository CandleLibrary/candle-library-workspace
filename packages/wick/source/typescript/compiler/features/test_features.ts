import { JSIdentifierReference, JSNode, JSNodeType, tools } from '@candlelib/js';
import { BINDING_VARIABLE_TYPE } from '../../types/all.js';
import { Name_Is_A_Binding_Variable, Variable_Is_Declared_In_Closure } from '../common/binding.js';
import { Context } from '../common/context.js';
import { createParseFrame } from '../common/frame.js';
import { BindingIdentifierReference } from '../common/js_hook_types.js';
import { registerFeature } from './../build_system.js';

registerFeature(

    "CandleLibrary WICK: Cure Testing Features",
    (build_system) => {

        let WITHIN_TEST_FRAME = false;

        /*############################################################3
        * Extract Assert statements from the component;
        */
        build_system.registerJSParserHandler(
            {
                priority: 1,

                async prepareJSNode<JSNode>(node, parent_node, skip, component, context: Context, frame) {

                    const name = tools.getIdentifierName(node.nodes[0]);

                    if (!WITHIN_TEST_FRAME) {


                        if (node.nodes[1].type == JSNodeType.BlockStatement) {

                            const binding = build_system.getComponentBinding(name, component);


                            if (binding && binding.type == BINDING_VARIABLE_TYPE.CURE_TEST) {
                                skip();

                                // Get binding variables and other information necessary to properly 
                                // test this component. 

                                // The interior of the block statement will serve as the basis 
                                // for the test rig

                                if (!context.test_rig_sources.has(component)) {
                                    context.test_rig_sources.set(component, []);
                                }

                                const temp_frame = createParseFrame(frame, component, true, true);

                                //add the built in assert and assert_group names

                                temp_frame.prev = frame;

                                WITHIN_TEST_FRAME = true;

                                const out_node = await build_system.processNodeAsync(
                                    node.nodes[1], temp_frame, component, context
                                );

                                WITHIN_TEST_FRAME = false;

                                //@ts-ignore
                                context.test_rig_sources.get(component).push(out_node);

                                return null;
                            }
                        }
                    } else if (name == "set_model") {

                    }

                }
            }, JSNodeType.LabeledStatement
        );

        /*############################################################3
        * IDENTIFIER REFERENCE - Disable Auto Model Binding Assignment
        */
        build_system.registerJSParserHandler(
            {
                priority: 0,

                prepareJSNode(node, parent_node, skip, component, context, frame) {

                    if (WITHIN_TEST_FRAME) {

                        const name = (<JSIdentifierReference>node).value;

                        if (node.type !== BindingIdentifierReference
                            &&
                            !Variable_Is_Declared_In_Closure(name, frame)
                            &&
                            !Name_Is_A_Binding_Variable(name, frame)
                        ) {

                            return <JSNode>node;
                        }
                    }
                }
            }, JSNodeType.IdentifierReference
        );
    }
);
