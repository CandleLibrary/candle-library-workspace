import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import { promises as fsp } from "fs";
import { rt } from '../../client/runtime/global.js';
import { createCompiledComponentClass } from '../../compiler/ast-build/build.js';
import { createClassStringObject } from '../../compiler/ast-render/js.js';
import { ComponentData } from '../../compiler/common/component.js';
import { Context } from '../../compiler/common/context';
import { ComponentHash } from '../../compiler/common/hash_name.js';
import { createComponent } from '../../compiler/create_component.js';
import { EditorCommand } from '../../types/editor_types.js';
import { Patch, PatchType } from "../../types/patch";
import { Session } from '../common/session.js';
import { addComponent, getComponent, store, __sessions__ } from './store.js';

export const logger = Logger.createLogger("flame");

export async function createNewComponentFromSourceString(new_source: string, context: Context, location: URI) {

    const comp = await createComponent(new_source, context, location);

    comp.location = location;

    return comp;
}

async function writeComponent(component: ComponentData) {

    const location = component.location;

    // const path = URI.resolveRelative("./" + location.filename + ".temp." + location.ext, location);
    //
    // logger.debug(`TODO: Writing temporary component [${path + ""}] instead of overwriting [${location + ""}]`);

    //await fsp.writeFile(path + "", component.source);

    await fsp.writeFile(location + "", component.source);
}
/**
 * Swaps the old component with th enew component. Both components must 
 * be from the same source file path
 * @param new_comp 
 * @param old_comp 
 * @param sessions 
 */
export function swap_component_data(
    new_comp: ComponentData,
    old_comp: ComponentData,
    sessions: Iterable<Session> = __sessions__
) {

    const path = old_comp.location + "";

    if (new_comp.location.toString() != old_comp.location.toString()) {
        logger.critical(`        
Attempt to swap component ${old_comp.name} with ${new_comp.name} failed:
New Component location ${new_comp.location + ""} does not match Old Component
location ${old_comp.location + ""}
        `);
    } else {




        for (const endpoint of store.page_components?.get(path)?.endpoints ?? [])
            store.endpoints?.set(endpoint, { comp: new_comp });

        store.components?.set(path, { comp: new_comp });

        logger.log(`Created new component [ ${new_comp.name} ] from path [ ${path} ] `);

        alertSessionsOfComponentTransition(
            sessions,
            old_comp.name,
            new_comp.name,
            old_comp.location
        );
    }
}


export function alertSessionsOfComponentTransition(
    sessions: Iterable<Session>,
    old_comp_name: string,
    new_comp_name: string,
    location: URI
) {

    for (const session of sessions) {
        session.send_command({
            command: EditorCommand.UPDATED_COMPONENT,
            path: location + "",
            old_name: old_comp_name,
            new_name: new_comp_name
        });
    }
}

export function getSourceHash(source: string) {
    return ComponentHash(source);
}

/**
 * Compares two components and issues an appropriate patch
 * object to update the component_from to component_to.
 * 
 * This patch may be as trivial as changing the from component's
 * hash name to match that of the to component's, to as complex
 * as replacing the entire from component object with the to 
 * object. 
 * 
 * @param component_from 
 * @param component_to 
 */

export async function getPatch(
    from: string,
    to: string,
    context: Context
): Promise<Patch[PatchType]> {

    logger.debug("Retrieving patch");

    if (from == to) {

        const component_from = await getComponent(from);

        if (!component_from) throw new Error("Could not retrieve from component");

        const component_to = await reloadComponent(component_from.location + "");

        if (!component_to) throw new Error("Could not retrieve to component");

        return {
            type: PatchType.REPLACE,
            to: component_to.name,
            from: component_from.name,
            patch_scripts: await createReplacePatch(component_to, context)
        };
    } else {

        const component_from = await getComponent(from);
        const component_to = await getComponent(to);

        if (!component_from) throw new Error("Could not retrieve from component");
        if (!component_to) throw new Error("Could not retrieve to component");


        return {
            type: PatchType.REPLACE,
            to: component_to.name,
            from: component_from.name,
            patch_scripts: await createReplacePatch(component_to, context)
        };
    }

}

async function createReplacePatch(
    comp: ComponentData,
    context: Context
): Promise<string[]> {
    const root_component: ComponentData = comp;

    const patches = [];

    for (const comp of getComponentDependencies(root_component, context)) {

        const code_patch = await createRPPatchScript(comp, context);

        patches.push(code_patch);
    }

    return patches;
}

async function createRPPatchScript(
    comp: ComponentData,
    context: Context
) {


    const comp_class = await createCompiledComponentClass(comp, context, true, true);
    const class_strings = `
        const name = "${comp.name}";
        const WickRTComponent = wick.rt.C;
        const components= wick.rt.context.component_class;
        
        if(components.has(name))
            logger.log(\`Replacing component class [${comp.name}] \`)
        
        const class_ = ${createClassStringObject(comp, comp_class, context).class_string};
        
        components.set(name, class_);

        return components.get(name);
        `;

    return class_strings;
}

/**
 * Returns a list of all components that are required to
 * properly render the givin root component, 
 * including the root component
 * @param root_component 
 * @returns 
 */
export function getComponentDependencies(
    root_component: ComponentData,
    context: Context = rt.context
): Array<ComponentData> {

    const seen_components: Set<string> = new Set();

    const output = [root_component];

    for (const component of output) {

        seen_components.add(component.name);

        for (const [, comp_name] of component.local_component_names)
            if (!seen_components.has(comp_name))
                //@ts-ignore
                output.push(context.components.get(comp_name));
    }

    return output;
}


export async function reloadComponent(path: string, sessions?: Set<Session>) {
    const location = new URI(path);

    const comp = await createComponent(location, rt.context);

    if (comp) {
        if (comp.HAS_ERRORS) {

            logger.warn(`Component ${comp.name} [${comp.location}] has the following problems: `);

            for (const error of rt.context.getErrors(comp) ?? [])
                logger.warn(error);

            rt.context.clearWarnings(comp);
            rt.context.clearErrors(comp);
            rt.context.components.delete(comp.name);

        } else {

            //Update any endpoint that have a matching source path.
            if (store.page_components?.has(path)) {
                for (const p of store.page_components.get(path)?.endpoints ?? []) {
                    //Update endpoints with this component 
                    store.endpoints?.set(p, { comp });
                    logger.log(`Updating endpoint [ ${p} ]`);
                }
            }

            addComponent(comp);

            const cmp = store.components?.get(path);

            if (cmp) {

                const { comp: existing } = cmp;

                if (existing.name != comp.name) {
                    swap_component_data(comp, existing, sessions);
                }
            }
        }

        return comp;
    }

    return null;
}

