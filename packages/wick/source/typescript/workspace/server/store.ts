import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import { rt } from '../../client/runtime/global.js';
import { ComponentData } from '../../compiler/common/component.js';
import { Context } from '../../compiler/common/context.js';
import { WickCompileConfig } from '../../types/all';
import { Transition } from '../../types/transition.js';
import { Session } from '../common/session.js';
import { createNewComponentFromSourceString } from './component_tools.js';
import { Components, EndPoints, loadComponentsFromDirectory, PageComponents } from "./load_directory.js";

const logger = Logger.createLogger("Flame");

export const store: {
    components: Components | null;
    endpoints: EndPoints | null;
    page_components: PageComponents | null;
    transitions: Map<string, Map<string, Transition>>;
    updated_components: Map<string, ComponentData>;
    component_ref_map: Map<string, {
        location: URI,
        update_time: number,
        refs: number,
        source: string,
        component: ComponentData | null;
    }>;
} = {
    components: null,
    endpoints: null,
    page_components: null,
    transitions: new Map,
    updated_components: new Map,
    component_ref_map: new Map,
};

export function removeReference(name: string) {

    if (store.component_ref_map.has(name)) {

        const data = store.component_ref_map.get(name);

        if (data) {

            const refs = --data.refs;

            if (refs == 0) {
                // We can safely drop our reference to the component data 
                // to allow garbage collection. If we need to reload the 
                // component then we can load it from the source string.
                data.component = null;
            }

            data.update_time = performance.now();
        }
    }
}

export function addReference(component: ComponentData) {

    const name = component.name;

    if (!store.component_ref_map.has(name)) {
        addComponent(component);
    }

    const data = store.component_ref_map.get(name);

    if (data) {

        data.refs += 1;

        data.update_time = performance.now();
    }
}

export async function addComponent(component: ComponentData) {

    const name = component.name;

    if (!store.component_ref_map.has(name)) {

        const location = new URI(component.location);

        store.component_ref_map.set(name, {
            component: component,
            location: location,
            refs: 0,
            source: component.source,
            update_time: 0
        });
    }
}

export function addBareComponent(
    name: string,
    component_source: string,
    location: URI
) {
    if (!store.component_ref_map.has(name)) {
        store.component_ref_map.set(name, {
            component: null,
            location: location,
            refs: 0,
            source: component_source,
            update_time: 0
        });
    }
}
export async function getComponent(name: string) {

    if (store.component_ref_map.has(name)) {

        const data = store.component_ref_map.get(name);

        if (data) {

            if (!data.component) {

                data.component = await createNewComponentFromSourceString(
                    data.source,
                    rt.context,
                    new URI(data.location)
                );
            }

            return data.component;
        }
    }

    return null;
}

export function getComponentLocation(name: string) {

    if (store.component_ref_map.has(name))

        return store.component_ref_map.get(name)?.location ?? null;

    return null;
}

export function addTransition(transition: Transition) {

    const from = transition.old_id;
    const to = transition.new_id;
    const steps: [string, string, Transition][]
        = [[from, to, transition],
        [to, from, <Transition>{
            changes: [],
            new_id: transition.old_id,
            old_id: transition.new_id,
            new_location: transition.old_location,
            old_location: transition.new_location,
            new_source: transition.old_source,
            old_source: transition.new_source,
            patch: undefined
        }]];

    for (const [to, from, trs] of steps) {

        if (!store.transitions.has(from)) {
            store.transitions.set(from, new Map);
        }

        if (!store.transitions.get(from)?.has(to)) {
            store.transitions.get(from)?.set(to, trs);
        }
    }
}

export function getTransition(from: string, to: string) {
    return store.transitions.get(from)?.get(to);
}

export async function loadComponents(
    root_directory: URI,
    context: Context,
    config: WickCompileConfig
) {

    logger.debug(`Loading components within [ ${root_directory} ]`);

    const { page_components, components, endpoints }
        = await loadComponentsFromDirectory(
            root_directory, context, config.endpoint_mapper
        );

    store.endpoints = endpoints;
    store.page_components = page_components;
    store.components = components;

    if (page_components)
        for (const [component, { endpoints }] of page_components) {
            for (const endpoint of endpoints)
                logger.debug(`Registered endpoint [ ${endpoint} ] with component [ ${component} ]`);
        }
}


export const __sessions__: Session[] = [];
