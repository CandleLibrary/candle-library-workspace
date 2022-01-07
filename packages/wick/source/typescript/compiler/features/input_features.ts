import { JSNode, JSNodeType } from '@candlelib/js';
import {
    BINDING_VARIABLE_TYPE, HTMLAttribute, HTMLElementNode, HTMLNodeType, IndirectHook,
    STATIC_RESOLUTION_TYPE
} from "../../types/all.js";
import { registerFeature } from './../build_system.js';
import { getElementAtIndex } from './../common/html.js';
import { BindingIdentifierBinding, BindingIdentifierReference } from './../common/js_hook_types.js';

registerFeature(

    "CandleLibrary WICK: HTML Inputs",
    (build_system) => {

        const GeneralInputValueHook = build_system.registerHookType("text-input-value-hook", HTMLNodeType.HTMLAttribute);
        const CheckboxInputValueHook = build_system.registerHookType("checkbox-input-value-hook", HTMLNodeType.HTMLAttribute);

        /** ###########################################################
         *  Input Text Value Attribute
         */
        build_system.registerHTMLParserHandler<HTMLAttribute, HTMLElementNode>(
            {
                priority: -10,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    if (node.name == "value" && (
                        host_node.tag == "INPUT"
                        || host_node.tag == "TEXTAREA"
                        || host_node.tag == "SELECT"
                    )) {

                        if (host_node.tag == "TEXTAREA") {


                            // Process the primary expression for Binding Refs and static
                            // data

                            const primary = await build_system.processBindingAsync(node.value, component, context);

                            const secondary = await build_system.processSecondaryBindingAsync(node.value, component, context);

                            // Create an indirect hook for container data attribute

                            build_system.addIndirectHook(component, GeneralInputValueHook, {
                                primary,
                                secondary
                            }, index);

                            // Remove the attribute from the container element

                            return null;
                        }

                        if (host_node.tag == "SELECT" || host_node.attributes?.some(
                            val => [
                                "text", "number", "month", "email", "time", "url", "week", "tel", "date", "color"
                            ].includes(String(<string>val.value ?? "").toLowerCase()))
                        ) {


                            // Process the primary expression for Binding Refs and static
                            // data
                            const primary = await build_system.processBindingAsync(node.value, component, context);

                            const secondary = await build_system.processSecondaryBindingAsync(node.value, component, context);

                            // Create an indirect hook for container data attribute

                            build_system.addIndirectHook(component, GeneralInputValueHook, {
                                primary,
                                secondary
                            }, index);

                            // Remove the attribute from the container element

                            return null;
                        }

                        if (host_node.attributes?.some(val => val.name == "type" && val.value == "checkbox")) {


                            // Process the primary expression for Binding Refs and static
                            // data
                            const ast = await build_system.processBindingAsync(node.value, component, context);

                            // Create an indirect hook for container data attribute

                            build_system.addIndirectHook(component, CheckboxInputValueHook, ast, index);

                            // Remove the attribute from the container element

                            return null;
                        }
                    }

                }
            }, HTMLNodeType.HTMLAttribute
        );

        build_system.registerHookHandler<IndirectHook<[{
            primary: JSNode,
            secondary: JSNode | null;
        }]>, JSNode | void>({

            name: "Text Input Value Handler",

            types: [GeneralInputValueHook],

            verify: () => true,

            buildJS: (node, sdp, element_index, addOnBindingUpdate, addInitBindingInit) => {

                const { expr, stmt } = build_system.js;

                const
                    expression = node.value[0].primary,
                    secondary_expression = node.value[0].secondary,
                    root_type = expression.type,
                    READONLY = getElementAtIndex<HTMLElementNode>(sdp.self, element_index)
                        ?.attributes
                        ?.some(({ value: v }) => v.toString().toLowerCase() == "readonly") ?? false;
                // Determine whether the expression is trivial, simple, or complex.
                // Trivial expressions are built in types. Number, Boolean, and String (and templates without bindings).
                // Simple expression are single identifiers
                // Complex expression are anything else
                if (
                    root_type == JSNodeType.NumericLiteral ||
                    root_type == JSNodeType.BigIntLiteral ||
                    root_type == JSNodeType.StringLiteral
                ) {
                    //This will have been directly assigned to static html, discard
                    return;
                }

                // The expression will at least produce an output that will be assigned

                const s = stmt(`this.sa(${element_index}, "value", b)`);
                //@ts-ignore
                s.nodes[0].nodes[1].nodes[2] = (expression);
                addOnBindingUpdate(s);

                const update_expression = secondary_expression || expression;

                if (
                    (
                        update_expression.type == BindingIdentifierBinding ||
                        update_expression.type == BindingIdentifierReference
                    ) && !READONLY

                ) {
                    // The expression is a potentially bi-directional attachment
                    // to a binding variable. This applies if the binding is:
                    // - UNDECLARED ( Defaults to model attachment )
                    // - MODEL_VARIABLE
                    // - INTERNAL_VARIABLE
                    // - METHOD_VARIABLE (The method will be called with value of the input)


                    const binding = build_system.getComponentBinding(update_expression.value, sdp.self);

                    if (
                        binding.type == BINDING_VARIABLE_TYPE.UNDECLARED
                        ||
                        binding.type == BINDING_VARIABLE_TYPE.MODEL_VARIABLE
                        ||
                        binding.type == BINDING_VARIABLE_TYPE.INTERNAL_VARIABLE
                        ||
                        binding.type == BINDING_VARIABLE_TYPE.ATTRIBUTE_VARIABLE
                    ) {
                        const e = expr(`a=_.target.value`);
                        e.nodes[0] = update_expression;
                        const s = stmt(`this.al(${element_index}, "input",  _=>a)`);
                        //@ts-ignore
                        s.nodes[0].nodes[1].nodes[2].nodes[1] = e;
                        addInitBindingInit(s);
                    } else if (binding.type == BINDING_VARIABLE_TYPE.METHOD_VARIABLE) {
                        const e = expr(`this.${binding.internal_name}(v)`);
                        //@ts-ignore
                        e.nodes[1].nodes[0] = update_expression;
                        const s = stmt(`this.al(${element_index}, "input",  _=>a)`);
                        //@ts-ignore
                        s.nodes[0].nodes[1].nodes[2].nodes[1] = e;
                        addInitBindingInit(s);
                    }
                }
            },

            buildHTML: async (hook, sdp) => {

                if (
                    build_system.getExpressionStaticResolutionType(<JSNode>hook.value[0], sdp)
                    !==
                    STATIC_RESOLUTION_TYPE.INVALID
                ) {

                    const { value } = await build_system.getStaticValue(hook.value[0], sdp);

                    if (value !== null)
                        return <any>{
                            html: { attributes: [["value", value]] }
                        };
                }
            }
        });


        build_system.registerHookHandler<IndirectHook<JSNode>, JSNode | void>({

            name: "Checkbox Input Value Handler",

            types: [CheckboxInputValueHook],

            verify: () => true,

            buildJS: (node, sdp, element_index, addOnBindingUpdate, addInitBindingInit) => {
                const { expr, stmt } = build_system.js,
                    ele_name = "$$ele" + element_index,
                    expression = node.value[0],
                    root_type = expression.type,
                    READONLY = getElementAtIndex<HTMLElementNode>(sdp.self, element_index)
                        .attributes
                        .some(({ value: v }) => v.toString().toLowerCase() == "readonly");
                // Determine whether the expression is trivial, simple, or complex.
                // Trivial expressions are built in types. Number, Boolean, and String (and templates without bindings).
                // Simple expression are single identifiers
                // Complex expression are anything else
                if (
                    root_type == JSNodeType.NumericLiteral ||
                    root_type == JSNodeType.BigIntLiteral ||
                    root_type == JSNodeType.StringLiteral
                ) {
                    //This will have been directly assigned to static html, discard
                    return;
                }

                // The expression will at least produce an output that will be assigned

                const s = stmt(`${ele_name}.checked = !!(1)`);
                s.nodes[0].nodes[1].nodes[0].nodes[0] = (expression);
                addOnBindingUpdate(s);

                if (
                    (
                        root_type == BindingIdentifierBinding ||
                        root_type == BindingIdentifierReference
                    ) && !READONLY

                ) {
                    // The expression is a potentially bi-directional attachment
                    // to a binding variable. This applies if the binding is:
                    // - UNDECLARED ( Defaults to model attachment )
                    // - MODEL_VARIABLE
                    // - INTERNAL_VARIABLE
                    // - METHOD_VARIABLE (The method will be called with value of the input)

                    const binding = build_system.getComponentBinding(expression.value, sdp.self);

                    if (
                        binding.type == BINDING_VARIABLE_TYPE.UNDECLARED
                        ||
                        binding.type == BINDING_VARIABLE_TYPE.MODEL_VARIABLE
                        ||
                        binding.type == BINDING_VARIABLE_TYPE.INTERNAL_VARIABLE
                    ) {
                        const e = expr(`a=$$ele${element_index}.checked`);
                        e.nodes[0] = expression;
                        const s = stmt(`this.al(${element_index}, "input",  _=>a)`);
                        s.nodes[0].nodes[1].nodes[2].nodes[1] = e;
                        addInitBindingInit(s);
                    } else if (binding.type == BINDING_VARIABLE_TYPE.METHOD_VARIABLE) {
                        const e = expr(`this.${binding.internal_name}(v)`);
                        e.nodes[1].nodes[0] = expression;
                        const s = stmt(`this.al(${element_index}, "input",  _=>a)`);
                        s.nodes[0].nodes[1].nodes[2].nodes[1] = e;
                        addInitBindingInit(s);
                    }
                }
            },

            buildHTML: async (hook, sdp) => {

                if (
                    build_system.getExpressionStaticResolutionType(<JSNode>hook.value[0], sdp)
                    !==
                    STATIC_RESOLUTION_TYPE.INVALID
                ) {

                    const { value } = await build_system.getStaticValue(hook.value[0], sdp);

                    if (value !== null)
                        return <any>{
                            html: { attributes: [["checked", !!value]] }

                        };
                }
            }
        });
    }

);