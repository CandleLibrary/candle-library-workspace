import { traverse } from '@candlelib/conflagrate';
import { JSExportClause, JSIdentifier, JSImportDeclaration, JSNamedImports, JSNodeType } from '@candlelib/js';
import {
    BindingVariable,
    BINDING_FLAG,
    BINDING_VARIABLE_TYPE, HTMLAttribute, HTMLNode,
    HTMLNodeClass, HTMLNodeType, IndirectHook
} from "../../types/all.js";
import { registerFeature } from '../build_system.js';
import { AttributeHook } from '../common/html.js';
import { BindingIdentifierBinding } from '../common/js_hook_types.js';


registerFeature(

    "CandleLibrary WICK: Imports and Exports",
    (build_system) => {

        const ExportToParentHook = build_system.registerHookType("data-export-to-parent-hook", JSNodeType.ExportDeclaration);
        const ImportFromChildAttributeHook = build_system.registerHookType("data-import-from-child-through-attribute-hook", JSNodeType.StringLiteral);


        build_system.registerJSParserHandler(
            // ###################################################################
            // IMPORTS
            //
            // Import statements from files can either be JS data or HTML data.
            // In either case we may be dealing with a component. HTML files are 
            // by default components. 
            //
            // In the case of  a JS file, we'll know we have a component if there 
            // lies a DEFAULT export which is a wick component.  IF this is note the
            // case, then the file is handled as a regular JS file which can have
            // objects imported into the component. Access to this file is ultimately
            // hoisted to the root of the APP and is made available to all component. 
            // 
            // There is also the case of the Parent Module import @parent and the 
            // "context" or runtime import @context, which are special none file
            // imports that wick will use to load data from the node's parent's 
            // exports and the context global object, respectively.
            {
                priority: Infinity, //This handler cannot be overridden

                async prepareJSNode(node: JSImportDeclaration, parent_node, skip, component, context, frame) {

                    let url_value = "";

                    const [imports, from] = node.nodes;

                    if (imports == null)
                        url_value = (<JSIdentifier><any>from).value;
                    else if (!from)
                        url_value = (<JSIdentifier><any>imports).value;
                    else
                        url_value = (<JSIdentifier>from?.nodes[0])?.value;

                    if (url_value) {

                        const names = [];


                        for (const { node: id, meta: { skip } } of traverse(node, "nodes", 4)
                            .filter("type",
                                JSNodeType.Specifier,
                                JSNodeType.NameSpace
                            )
                            .makeSkippable()
                        ) {
                            let local = "", external = "";

                            //@ts-ignore
                            if (id.type == JSNodeType.Specifier) {
                                //@ts-ignore
                                external = <string>id.nodes[0].value;
                                //@ts-ignore
                                local = <string>id.nodes[1]?.value ?? external;
                                //@ts-ignore
                            } else if (id.type == JSNodeType.NameSpace) {
                                const name = id.nodes[0];
                                //@ts-ignore
                                local = name.value;
                                //@ts-ignore
                                external = "namespace";
                            } else {
                                external = local;
                            }

                            names.push({ local, external });

                            skip();
                        }

                        await build_system.importResource(
                            url_value,
                            component,
                            context,
                            node,
                            (<any>imports?.nodes?.[0])?.value ?? "",
                            names,
                            frame,
                        );
                    }


                    //Export and import statements should not showup in the final AST.
                    skip();

                    return null;
                },
            }, JSNodeType.ImportDeclaration
        );


        build_system.registerJSParserHandler(

            // ###################################################################
            // EXPORTS
            //
            // Exports in a component provide a way to declare objects that can 
            // be consumed by the components parent element. This creates a one
            // way non-bubbling binding to the parent's scope. The parent scope
            // must bind to the child's name through the bind attribute. 

            {
                priority: Infinity, //This handler cannot be overridden

                async prepareJSNode(node, parent_node, skip, component, context, frame) {

                    const [export_obj] = node.nodes;

                    if (export_obj.type & HTMLNodeClass.HTML_NODE) {


                        await build_system.processHTMLNode(<HTMLNode><any>export_obj, component, context);

                        // Don't need this node, it will be assigned to the component's
                        // html slot.
                        return null;

                    } else if (export_obj.type == JSNodeType.ExportClause) {

                        //Regular export that will be pushed to parent scope space. 

                        for (const { nodes: [internal_ref, external_ref] } of export_obj.nodes) {

                            const
                                internal_name = internal_ref.value,
                                external_name = external_ref?.value ?? internal_name;

                            build_system.addBindingVariable(
                                component.root_frame,
                                internal_name,
                                internal_ref.pos,
                                BINDING_VARIABLE_TYPE.UNDECLARED,
                                external_name,
                                BINDING_FLAG.ALLOW_EXPORT_TO_PARENT
                            );
                        }

                        build_system.addIndirectHook(component, ExportToParentHook, export_obj);
                    } //Discard any other type of export as they have no meaning in Wick
                    return null;
                }
            }, JSNodeType.ExportDeclaration
        );

        /** ##########################################################
         * 
         * Export and Import attributes on component elements
         */
        build_system.registerHTMLParserHandler<HTMLAttribute>(
            {
                priority: 10,

                prepareHTMLNode(node, host_node, host_element, index, skip, component, context) {

                    if (node.name == "import" && node.value) {

                        const clause: JSNamedImports = <any>node.value;

                        for (const specifier of clause.nodes) {
                            const external_id = specifier.nodes[0];
                            const internal_id = specifier.nodes[1] || external_id;
                            const local = external_id.value;
                            const foreign = internal_id.value;
                            build_system.addIndirectHook(component, ImportFromChildAttributeHook, { local, foreign, child_id: host_node.child_id }, index);
                        }

                        return null;

                    } else if (node.name == "export" && node.value) {

                        const clause: JSExportClause = <any>node.value;

                        for (const specifier of clause.nodes) {
                            const external_id = specifier.nodes[0];
                            const internal_id = specifier.nodes[1] || external_id;
                            const local = external_id.value;
                            const foreign = internal_id.value;
                            build_system.addIndirectHook(component, AttributeHook, { local, foreign, child_id: host_node.child_id }, index);
                        }

                        return null;
                    }
                }
            }, HTMLNodeType.HTMLAttribute
        );


        build_system.registerHookHandler<IndirectHook<[{ foreign: string; local: string; child_id: number; }]>, void>({
            name: "Export & Import Attribute Hooks",

            types: [AttributeHook, ImportFromChildAttributeHook],

            verify: () => true,

            buildJS: (node, sdp, element_index, addWrite, addInit) => {

                const ele = <HTMLNode><any>build_system.getElementAtIndex(sdp.self, element_index);

                const comp_name = ele.component_name;

                const child_comp = sdp.context.components.get(comp_name);

                const { foreign, local, child_id } = node.value[0];

                if (child_comp) {

                    const
                        par_binding = build_system.getComponentBinding(local, sdp.self),
                        child_binding = build_system.getBindingFromExternalName(foreign, child_comp);

                    if (par_binding
                        &&
                        child_binding
                    ) {

                        if (node.type == AttributeHook && (child_binding.flags & BINDING_FLAG.FROM_ATTRIBUTES) > 0) {

                            let exp: any = null;

                            exp = build_system.js.stmt(`$$${child_id}.ufp("${child_binding.external_name}", _, f);`);

                            exp.nodes[0].nodes[1].nodes[1] = createBindingReference(par_binding);

                            registerClassBinding(addInit, par_binding);

                            addWrite(<any>exp);

                        } else if ((child_binding.flags & BINDING_FLAG.ALLOW_EXPORT_TO_PARENT) > 0) {

                            let exp: any = null;

                            exp = build_system.js.stmt(`$$ch${child_id}.spm("${child_binding.external_name}", ${getBindingClassIndexID(par_binding)}, ${child_id})`);

                            registerClassBinding(addInit, par_binding);

                            addInit(<any>exp);
                        }

                    }

                }
            },

            buildHTML: (node, sdp) => null
        });

        build_system.registerHookHandler<IndirectHook<[JSExportClause]>, void>({
            name: "Export To Parent Hook",

            types: [ExportToParentHook],

            verify: () => true,

            buildJS: (node, sdp, _, _2, _3, addInit) => {

                const [clause] = node.value;

                for (const { nodes: [internal] } of clause.nodes)
                    registerClassBinding(addInit, build_system.getComponentBinding(internal.value, sdp.self));

                return null;
            },

            buildHTML: (node, sdp) => null
        });

        function getBindingClassIndexID(binding: BindingVariable) {
            return `$$bi${binding.internal_name}`;
        }

        function registerClassBinding(add: (d: any) => void, binding: BindingVariable) {
            if (binding)
                add(createBindingReference(binding));
        }

        function createBindingReference(binding: BindingVariable): any {
            return {
                type: BindingIdentifierBinding,
                value: binding.internal_name,
                pos: {}
            };
        }


    }
);
