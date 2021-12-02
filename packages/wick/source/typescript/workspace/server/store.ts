import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import wick, { ComponentData, Context, loadComponentsFromDirectory } from '@candlelib/wick';
import {
    Components,
    EndPoints,
    PageComponents
} from "@candlelib/wick/build/types/entry/wick-server";
import { WickCompileConfig } from '@candlelib/wick/build/types/types/all';
import { Session } from '../../common/session';
import { Transition } from '../../types/transition';
import { createNewComponentFromSourceString } from './component_tools.js';

const logger = Logger.createLogger("Flame");

export const store: {
    components: Components;
    endpoints: EndPoints;
    page_components: PageComponents;
    transitions: Map<string, Map<string, Transition>>;
    updated_components: Map<string, ComponentData>;
    component_ref_map: Map<string, {
        location: URI,
        update_time: number,
        refs: number,
        source: string,
        component: ComponentData;
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

export function addReference(component: ComponentData) {

    const name = component.name;

    if (!store.component_ref_map.has(name)) {
        addComponent(component);
    }

    const data = store.component_ref_map.get(name);

    data.refs += 1;

    data.update_time = performance.now();
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

        if (!data.component) {

            data.component = await createNewComponentFromSourceString(
                data.source,
                wick.rt.context,
                new URI(data.location)
            );
        }

        return data.component;
    }

    return null;
}

export function getComponentLocation(name: string) {

    if (store.component_ref_map.has(name))

        return store.component_ref_map.get(name).location;

    return null;
}

export function addTransition(transition: Transition) {

    const from = transition.old_id;
    const to = transition.new_id;
    const steps = [[from, to], [to, from]];

    for (const [to, from] of steps) {
        if (!store.transitions.has(from)) {
            store.transitions.set(from, new Map);
        }

        store.transitions.get(from).set(to, transition);
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

    for (const [component, { endpoints }] of page_components) {
        for (const endpoint of endpoints)
            logger.debug(`Registered endpoint [ ${endpoint} ] with component [ ${component} ]`);
    }
}


export const __sessions__: Session[] = [];
