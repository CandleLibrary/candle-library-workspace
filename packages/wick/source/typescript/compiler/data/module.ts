import { JSNode } from "@candlelib/js";
import URI from '@candlelib/uri';
import { error, warn } from '../../entry/logger.js';
import {
    BINDING_FLAG,
    BINDING_VARIABLE_TYPE,
    FunctionFrame,
    HTMLNode,
    HTMLNodeType,
} from "../../types/all.js";
import { processWickCSS_AST } from '../ast-parse/parse.js';
import { parseSource } from "../ast-parse/source.js";
import { addBindingVariable, addWriteFlagToBindingVariable, addSourceLocationToBindingVariable } from "../common/binding.js";
import { addPendingModuleToPresets } from '../common/common.js';
import { ComponentData, mergeComponentData } from '../common/component.js';
import { Context } from '../common/context.js';
import { parse_css } from '../source-code-parse/parse.js';



function getModuleName(
    context: Context,
    from_value: URI,
    requesting_source: URI
) {

    return addPendingModuleToPresets(context, from_value, requesting_source);
    if (!context.repo.has(module_name))
        return addPendingModuleToPresets(context, from_value, requesting_source);
    else
        return context.repo.get(module_name)?.hash || "";
}

/**
 * Attempts to import a component from a URI. Returns true if the resource
 * is a wick component that can be parsed, false otherwise.
 * @param new_component_url
 * @param component
 * @param context
 * @param local_name
 * @returns
 */
export async function importComponentData(
    new_component_url: string,
    component: ComponentData,
    context: Context,
    local_name: string,
    node: HTMLNode | JSNode,
    frame: FunctionFrame
): Promise<boolean> {

    try {

        let uri = <URI>URI.resolveRelative(new_component_url, component.location);

        if (!uri.ext) {

            const candidates = [
                <URI>URI.resolveRelative("./" + uri.filename + ".wick", uri),
                <URI>URI.resolveRelative("./" + uri.filename + ".md", uri),
                <URI>URI.resolveRelative("./" + "index" + ".wick", uri + "/"),
                <URI>URI.resolveRelative("./" + "index" + ".md", uri + "/"),
            ];

            const results = await Promise.all(candidates.map(c => c.DOES_THIS_EXIST()));

            const first = results.indexOf(true);

            if (first >= 0)
                uri = candidates[first];
            else
                //throw new Error(`Could not locate a component at ${new_component_url}`);
                return false;

        }

        const { IS_NEW, comp: new_comp_data }
            = await parseSource(uri, context, component.location);

        if (new_comp_data.HAS_ERRORS)
            return false;

        if (IS_NEW) {

            // If the ast is an HTML_NODE with a single style element, then integrate the 
            // css data into the current component. 
            //const comp_data = await compileComponent(ast, string, resolved_url, context);
            //componentDataToJSCached(new_comp_data, context);

            if (!new_comp_data.HTML)
                mergeComponentData(component, new_comp_data);
        }

        if (new_comp_data.TEMPLATE && local_name) {
            addBindingVariable(frame, local_name, node.pos, BINDING_VARIABLE_TYPE.TEMPLATE_DATA, local_name);
        }
        if (local_name)
            component.local_component_names.set(local_name.toUpperCase(), new_comp_data.name);

        return true;

    } catch (e) {


        console.log(e);
        console.log("TODO: Replace with a temporary warning component.", e);
    }

    return false;

}

export async function importResource(
    from_value: string,
    component: ComponentData,
    context: Context,
    node: HTMLNode | JSNode,
    default_name: string = "",
    names: { local: string; external: string; }[] = [],
    frame: FunctionFrame
): Promise<void> {

    let flag: BINDING_FLAG = 0,
        ref_type: BINDING_VARIABLE_TYPE = 0;

    let module_name = "";

    const
        [url, meta] = from_value.split(":"),

        uri = <URI>URI.resolveRelative(url, component.location);

    switch (url + "") {

        default:
            //Import css file and integrate into current component. 
            if (uri.ext == "css") {

                const css = await uri.fetchText();

                try {

                    const css_ast = parse_css(css);

                    processWickCSS_AST({ type: HTMLNodeType.HTML_STYLE, nodes: [<any>css_ast], pos: <any>css_ast.pos }, component, context, uri);

                } catch (e) {
                    if (e instanceof Error)
                        error(e);
                }
                return;
            } else if (uri.ext == "json") {

                for (const { local, external } of names) {

                    if (external == "namespace")
                        continue;

                    if (!addBindingVariable(frame, local, node.pos, BINDING_VARIABLE_TYPE.CONSTANT_DATA_SOURCE, external || local, flag)) {

                        //@ts-ignore
                        node.pos.throw(`Import variable [${local}] already declared`);
                    }

                    addSourceLocationToBindingVariable(local, uri, frame);
                }
            }

            // Read file and determine if we have a component, a script or some other resource. 
            // Compile Component Data
            else if (!(uri.ext == "wick" || uri.ext == "html" || uri.ext == "")
                ||
                !(await importComponentData(
                    from_value,
                    component,
                    context,
                    default_name,
                    node,
                    frame
                ))
            ) {
                if (!(await uri.DOES_THIS_EXIST())) {
                    throw `Could not resolve resource \n${uri} \nimported from \n[${component.location}]`;
                }

                module_name = getModuleName(context, new URI(from_value.trim()), component.location);

                for (const name of names) {
                    if (name.external == "namespace")
                        addBindingVariable(frame, name.local, node.pos, BINDING_VARIABLE_TYPE.MODULE_NAMESPACE_VARIABLE, name.external, flag, module_name);
                }

                if (default_name)
                    addBindingVariable(frame, default_name, node.pos, BINDING_VARIABLE_TYPE.MODULE_VARIABLE, default_name, flag, module_name);

                ref_type = BINDING_VARIABLE_TYPE.MODULE_MEMBER_VARIABLE;
                flag = BINDING_FLAG.FROM_OUTSIDE;

                break;
            }

            return;

        case "@template":
            // Opts the component into the wick templating system client side router system. The component must be 
            // at the root of the component tree for this to work.
            component.TEMPLATE = true;

            ref_type = BINDING_VARIABLE_TYPE.TEMPLATE_CONSTANT; flag = BINDING_FLAG.FROM_PRESETS;

            if (default_name)
                addBindingVariable(frame, default_name, node.pos, BINDING_VARIABLE_TYPE.TEMPLATE_INITIALIZER, default_name, flag);

            break;

        case "@radiate":
            // Opts the component into the wick-radiate client side router system. The component must be 
            // at the root of the component tree for this to work.
            component.RADIATE = true;
            return;

        case "@registered":
            const comp_name = default_name.toUpperCase();
            if (default_name && context.named_components.has(comp_name))
                component.local_component_names.set(comp_name, context.named_components.get(comp_name)?.name ?? "");
            return;
        case "@test":
            if (default_name)
                addBindingVariable(frame, default_name, node.pos, BINDING_VARIABLE_TYPE.CURE_TEST, default_name,
                    BINDING_FLAG.FROM_OUTSIDE);

            if (names.length > 0)
                node.pos?.throw("Cure synthetic module only exports a default value");

            break;

        case "@parent":
        case "@props":
        case "@attributes":
            /* all ids within this node are imported binding_variables from parent */
            //Add all elements to global scope
            ref_type = BINDING_VARIABLE_TYPE.ATTRIBUTE_VARIABLE; flag = BINDING_FLAG.FROM_PARENT;
            break;

        case "@api":
            ref_type = BINDING_VARIABLE_TYPE.MODULE_MEMBER_VARIABLE; flag = BINDING_FLAG.FROM_OUTSIDE;
            break;

        /* case "@global":
            ref_type = BINDING_VARIABLE_TYPE.GLOBAL_VARIABLE; flag = BINDING_FLAG.FROM_OUTSIDE;
            break; */

        case "@globals":
            ref_type = BINDING_VARIABLE_TYPE.CONFIG_GLOBAL; flag = BINDING_FLAG.FROM_PRESETS;
            break;

        case "@model":

            if (default_name)
                addBindingVariable(frame, default_name, node.pos, BINDING_VARIABLE_TYPE.MODEL_DIRECT, default_name, flag);

            if (meta)
                component.global_model_name = meta.trim();

            ref_type = BINDING_VARIABLE_TYPE.MODEL_VARIABLE;
            flag = BINDING_FLAG.ALLOW_UPDATE_FROM_MODEL;
            break;

        case "@context":
            /* all ids within this node are imported from the context object */
            break;
    }


    for (const { local, external } of names) {

        if (external == "namespace")
            continue;

        if (!addBindingVariable(frame, local, node.pos, ref_type, external || local, flag, module_name)) {

            //@ts-ignore
            node.pos.throw(`Import variable [${local}] already declared`);
        }

        addWriteFlagToBindingVariable(local, frame);
    }
}
