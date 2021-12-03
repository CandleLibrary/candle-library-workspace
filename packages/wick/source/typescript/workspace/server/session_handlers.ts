import spark from '@candlelib/spark';
import URI from '@candlelib/uri';
import { promises as fsp } from "fs";
import { rt } from '../../client/runtime/global.js';
import { getCSSStringFromComponentStyle } from '../../compiler/ast-render/css.js';
import { ComponentData } from '../../compiler/common/component.js';
import { EditorCommand, StyleSourceType } from '../../types/editor_types.js';
import { Change, ChangeType } from '../../types/transition.js';
import { CommandHandler } from '../common/session.js';
import { ChangeToken, getAttributeChangeToken, getCSSChangeToken } from './change_token.js';
import {
    alertSessionsOfComponentTransition, getPatch, getSourceHash
} from './component_tools.js';
import { ServerSession } from './session.js';
import { addBareComponent, addTransition, getComponent, getComponentLocation, getTransition, store, __sessions__ } from './store.js';


export function initializeDefualtSessionDispatchHandlers(session: ServerSession) {
    session.setHandler(EditorCommand.REGISTER_CLIENT_ENDPOINT, REGISTER_CLIENT_ENDPOINT);
    session.setHandler(EditorCommand.GET_COMPONENT_SOURCE, GET_COMPONENT_SOURCE);
    session.setHandler(EditorCommand.GET_COMPONENT_STYLE, GET_COMPONENT_STYLE);
    session.setHandler(EditorCommand.GET_COMPONENT_PATCH, GET_COMPONENT_PATCH);
    session.setHandler(EditorCommand.APPLY_COMPONENT_CHANGES, APPLY_COMPONENT_CHANGES);
    return session;
}

export async function writeComponent(component: ComponentData) {

    const location = component.location;

    const path = URI.resolveRelative(location.filename + ".temp." + location.ext, location);

    await fsp.writeFile(path + "", component.source);
}

async function overwriteSourceFile(source: string, location: string) {

    await fsp.writeFile(location + "", source, { encoding: "utf8" });
}

const APPLY_COMPONENT_CHANGES: CommandHandler<ServerSession, EditorCommand.APPLY_COMPONENT_CHANGES>
    = async function ({ changes }, session: ServerSession) {

        const location_changes: Map<string, Change[ChangeType][]> = new Map;

        const component_changes: Map<string, Change[ChangeType][]> = new Map;

        const old_to_new_source: Map<string, string> = new Map;

        for (const change of changes) {

            let location = getChangeLocation(change);

            if (location) {
                addObjectToMapArray(location_changes, change, location);
            } else {
                session.logger.warn("Unable to resolve change location");
            }
        }

        for (const [location, changes] of location_changes) {

            const change_tokens = [];

            for (const change of changes) {
                let token: ChangeToken | null = null;
                if (change.type == ChangeType.CSSRule) {
                    token = await getCSSChangeToken(change);
                } else if (change.type == ChangeType.Attribute) {
                    token = await getAttributeChangeToken(change);
                }

                if (token) {
                    change_tokens.push(token);
                } else {
                    session.logger.warn("Unable to resolve change token");
                }
            }

            const new_source = change_tokens.sort((a, b) => b.token.off - a.token.off).reduce((source,
                { token, string }) =>
                token.setSource(source).replace(string), change_tokens[0].token.source);

            overwriteSourceFile(new_source, location);

            for (const change of changes) {

                let comp = await getComponent(change.component);

                if (comp) {


                    if (
                        !old_to_new_source.has(comp.name)
                        &&
                        location == comp.location + ""
                    ) {
                        old_to_new_source.set(comp.name, new_source);
                    }
                } else {
                    throw new Error("Could not retrieve component");
                }

                addObjectToMapArray(component_changes, change, change.component);
            }
        }

        for (const [old_component, changes] of component_changes) {

            let comp = await getComponent(old_component);

            if (comp) {

                let new_source = old_to_new_source.get(old_component) ?? comp.source;

                let new_component = old_to_new_source.has(old_component)
                    ? getSourceHash(new_source)
                    : old_component;

                if (old_to_new_source.has(old_component))
                    addBareComponent(new_component, new_source, comp.location);

                alertSessionsOfComponentTransition(
                    __sessions__,
                    new_component,
                    old_component,
                    comp.location
                );

                addTransition({
                    new_id: new_component,
                    old_id: old_component,
                    new_location: comp.location + "",
                    old_location: comp.location + "",
                    changes: changes,
                    old_source: comp.source,
                    new_source: new_source
                });
            } else {
                throw new Error("Could not retrieve component");
            }
        }

        await spark.sleep(100);

        return { command: EditorCommand.OK };
    };

const REGISTER_CLIENT_ENDPOINT: CommandHandler<ServerSession, EditorCommand.REGISTER_CLIENT_ENDPOINT>
    = async function (command, session: ServerSession) {

        const { endpoint } = command;

        const { comp } = store.endpoints?.get(endpoint) ?? {};

        if (comp) {
            session.logger.log(`Registering client with endpoint [ ${endpoint} ]`);
            session.connect_file_watchers(comp);
        } else {
            session.logger.warn(`Failed to register client with endpoint [ ${endpoint} ]`);
        }

    };


const GET_COMPONENT_SOURCE: CommandHandler<ServerSession, EditorCommand.GET_COMPONENT_SOURCE>
    = async function (command, session: ServerSession) {
        const { component_name } = command;

        const comp = await getComponent(component_name);

        if (comp) {
            return {
                command: EditorCommand.GET_COMPONENT_SOURCE_RESPONSE,
                component_name,
                source: comp.source
            };
        } else {
            return {
                command: EditorCommand.UNKNOWN
            };
        }
    };

const GET_COMPONENT_STYLE: CommandHandler<ServerSession, EditorCommand.GET_COMPONENT_STYLE>
    = async function (command, session: ServerSession) {

        const { component_name } = command;

        const comp = await getComponent(component_name);


        if (comp) {

            const CSS = comp.CSS;

            return {
                command: EditorCommand.GET_COMPONENT_STYLE_RESPONSE,
                component_name,
                styles: CSS.map(i => ({
                    location: i.location + "",
                    type: i.location.ext == "css"
                        ? StyleSourceType.CSS_FILE
                        : StyleSourceType.INLINE,
                    string: getCSSStringFromComponentStyle(i, comp, false)
                }))
            };
        } else {
            return {
                component_name,
                command: EditorCommand.GET_COMPONENT_STYLE_RESPONSE,
                styles: []
            };
        }
    };

const GET_COMPONENT_PATCH: CommandHandler<ServerSession, EditorCommand.GET_COMPONENT_PATCH>
    = async function (command: any, session: ServerSession) {

        // Need to receive the class data necessary to 
        // do an in place replacement of component data
        const { from, to } = command;

        if (from == to)
            return {
                command: EditorCommand.NOT_ALLOWED
            };

        const transition = getTransition(from, to);

        if (!transition)
            return {
                command: EditorCommand.UNKNOWN
            };

        const changes = transition.changes;

        const patch = await getPatch(
            from,
            to,
            rt.context
        );

        if (!patch) {
            throw new Error(`Patch not created for transition [${from}] to [${to}]`);
        }

        return {
            command: EditorCommand.APPLY_COMPONENT_PATCH,
            patch: patch
        };
    };

function getChangeLocation(change: {
    component: string; type: ChangeType.CSSRule;
    location: string;
    CSS_index?: number;
    old_rule_path: string;
    new_rule_path: string;
    new_selectors: string;
    old_selectors: string;
    old_properties?: {
        name: string;
        val: string;
    }[];
    new_properties?: {
        name: string;
        val: string;
    }[];
} | { type: ChangeType.Attribute; component: string; ele_id: number; name: string; attribute_index: number; old_value: string; new_value: string; }) {
    let location = "";

    if (change.type == ChangeType.CSSRule) {
        location = change.location;
    } else if (change.type == ChangeType.Attribute) {
        location = getComponentLocation(change.component) + "";
    }
    return location;
}

function addObjectToMapArray(
    component_change_tokens: Map<string, any[]>, obj: any, key: any
) {


    let array = component_change_tokens.get(key);

    if (!array) {
        array = [];
        component_change_tokens.set(key, array);
    }

    array.push(obj);
}

