import { copy, traverse } from '@candlelib/conflagrate';
import { JSCallExpression, JSFormalParameters, JSIdentifier, JSIdentifierBinding, JSNode, JSNodeType } from '@candlelib/js';
import {
    BINDING_VARIABLE_TYPE, HTMLNodeType, IndirectHook, JSHandler
} from "../../types/all.js";
import { parse_js_stmt } from '../source-code-parse/parse.js';
import { registerFeature } from './../build_system.js';
import { BindingIdentifierReference } from './../common/js_hook_types.js';

registerFeature(

    "CandleLibrary WICK: JS Functions",
    (build_system) => {

        const BindingFunction = build_system.registerHookType("binding-function", JSNodeType.FunctionDeclaration);
        const EventFunction = build_system.registerHookType("dom-event-function", HTMLNodeType.HTMLAttribute);

        // ###################################################################
        // Function Declaration
        // 
        // Root scoped functions are transformed into methods.
        // 
        build_system.registerJSParserHandler(
            {
                priority: 1,

                async prepareJSNode(node, parent_node, skip, component, context, frame) {

                    const
                        [name_node] = node.nodes;

                    let
                        name = (<JSIdentifier>name_node).value,
                        root_name = name;

                    if (!frame.IS_ROOT)
                        build_system.addNameToDeclaredVariables(name, frame);
                    else
                        build_system.addBindingVariable(frame, name, node.pos, BINDING_VARIABLE_TYPE.METHOD_VARIABLE);

                    /**
                     * Automatic event handler for root element
                     */
                    if (name.slice(0, 2) == "on") {
                        /**
                         * Any method that is directly called by the component 
                         * runtime system should be mapped here to common names 
                         * that exist for that internal method. 
                         * 
                         * If internal_method_name is defined, then DO NOT create a
                         * event listener call.
                         */
                        const internal_method_name = {
                            "ontransitionin": "oTI",
                            "onin": "oTI",
                            "ontrsin": "oTI",
                            "onout": "oTO",
                            "ontransitionout": "oTO",
                            "ontrsout": "oTO",
                            "onarrange": "aRR",
                            "onload": "onload",
                            "onmount": "onload",

                        }[name.toLocaleLowerCase().replace("on_", "on")] ?? "";

                        if (internal_method_name != "") {
                            // This should be an internally called method
                            (<JSIdentifier>name_node).value = internal_method_name;
                        } else {

                            build_system.addIndirectHook(
                                component, EventFunction,
                                { action: name.slice(2) }
                            );

                        }
                    } else if (name[0] == "$") {

                        if (frame.IS_ROOT) {
                            // hoist binding references to the parameters of the function 
                            // and convert back to normal variables. 

                            const function_frame = await build_system.
                                processFunctionDeclaration(<JSNode>node, component, context, root_name);

                            //Grab references to the binding variables
                            const call_ids: JSIdentifierBinding[] = <any>function_frame.ast.nodes[1]?.nodes?.filter(
                                (i): i is JSIdentifierBinding => i.type == JSNodeType.IdentifierBinding
                            ) ?? [];

                            const name = "__" + function_frame.ast.nodes[0].value.slice(1) + "__";

                            function_frame.ast.nodes[0].value = name;

                            // This WILL REPLACE any existing parameters of 
                            // the function. 
                            function_frame.ast.nodes[1] =
                                <JSFormalParameters>
                                {
                                    type: JSNodeType.FormalParameters,
                                    nodes: [
                                        <JSIdentifierBinding>
                                        { type: JSNodeType.IdentifierBinding, value: "c" },
                                        ...call_ids
                                    ],
                                    pos: function_frame.ast.pos
                                };

                            //Create a recursion check to prevent infinite recursions.
                            //function_frame.ast.nodes[2].nodes.unshift(build_system.js.stmt(`if(c>0) return;`));

                            // Create a new ast node that will server as the caller to the function 
                            // when bindings are updated and insert into an indirect hook. 

                            const call = build_system.js.expr<JSCallExpression>(`this.${name}(c)`);


                            //@ts-ignore
                            call.nodes[1].nodes.push(...call_ids.map(copy).map(i => (i.type = BindingIdentifierReference, i)));

                            build_system.addIndirectHook(component, BindingFunction, [call], 0, false);

                            skip(1);

                            return null;
                        }
                    }

                    skip(1);

                    await build_system.processFunctionDeclaration(<JSNode>node, component, context, root_name);

                    return null;
                }

            }, JSNodeType.FunctionDeclaration, JSNodeType.FunctionExpression
        );

        build_system.registerHookHandler
            <IndirectHook<[JSCallExpression, ...JSIdentifierBinding[]]>, JSCallExpression | JSIdentifierBinding>
            ({
                name: "Automatically Call Function After Binding Variable Updates",
                types: [BindingFunction],
                verify: () => true,
                buildHTML: () => null,
                buildJS(node, sdp, element_index, addOnBindingUpdate, addInitBindingInit) {
                    const [call_stmt, ...refs] = node.value[0].nodes;

                    addOnBindingUpdate(node.value[0]);

                    return null;
                }
            });

        /* ###################################################################
         * ARROW EXPRESSION
         */
        build_system.registerJSParserHandler(
            {
                priority: 1,

                async prepareJSNode(node, parent_node, skip, component, context, frame) {

                    const function_frame = await build_system.
                        processFunctionDeclaration(<JSNode>node, component, context);

                    skip();

                    return node;
                }

            }, JSNodeType.ArrowFunction
        );

        /*############################################################
        * FORMAL PARAMETERS
        */
        build_system.registerJSParserHandler(
            <JSHandler<JSFormalParameters>>{
                priority: 1,

                prepareJSNode(node, parent_node, skip, component, context, frame) {

                    if (parent_node == frame.ast) {
                        for (const { node: binding, meta } of traverse(node, "nodes", 4)
                            .filter("type", JSNodeType.IdentifierBinding, JSNodeType.IdentifierReference)
                        ) {
                            build_system.addNameToDeclaredVariables((<any>binding).value, frame);
                        }
                    }
                }

            }, JSNodeType.FormalParameters
        );

        build_system.registerHookHandler<IndirectHook<{ nodes: [JSNode], action: string; }>, JSNode | void>({

            name: "On Event Function Hook",

            types: [EventFunction],

            verify: () => true,

            buildJS: (node, sdp, element_index, _1, addInit) => {
                // Replace the value with a 
                // Get the on* attribute name
                const
                    { action } = node.value[0];

                addInit(parse_js_stmt(`this.ele.addEventListener("${action}", this.on${action}.bind(this))`));
            },

            buildHTML: (node, sdp) => null
        });

    }

);