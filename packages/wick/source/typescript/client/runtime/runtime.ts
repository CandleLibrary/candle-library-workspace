
import GlowAnimation from '@candlelib/glow';
import URI from '@candlelib/uri';
import { Environment, envIs } from '../../common/env.js';
import { logger } from '../../common/logger.js';
import { registerWatcherComponent, unregisterWatcherComponent } from '../../common/session_watchers.js';
import { Context, UserPresets } from "../../compiler/common/context.js";
import { MODULE_FLAG } from '../../compiler/common/ModuleFlag.js';
import { BINDING_FLAG } from '../../types/all';
import { Router } from '../radiate/router.js';
import { WickRTComponent } from "./component/component.js";
import { DataBaseOMR, DatabaseType, store } from './db.js';

let GLOW_CHECKED = false;
let local_glow: any = null;
let glow: typeof GlowAnimation | null = null;

logger.activate();

interface Store {
    set(query: string, data: any): any;

    get(query: string, ...args: any[]): any;

    key_map: Map<string, Set<WickRTComponent>>;
}

export class WickRuntime {
    /**
     * A promise that is fulfilled once the 
     * workspace has been initialized. 
     * 
     * Only available in workspace environments
     */
    workspace_init_promise: Promise<any> | null;

    /**
     * All top level components 
     * (components that have been initiated
     * through hydrateComponentElements )
     * 
     */
    root_components: WickRTComponent[];

    /**
     * Utilized by radiate system
     */
    router: Router | null;

    context: Context;

    /**
     * Template elements mapped to component names
     */
    templates: Map<string, HTMLTemplateElement>;

    init: () => Promise<void>;

    registerSession: typeof registerWatcherComponent;

    unregisterSession: typeof unregisterWatcherComponent;

    css_cache: Map<string, { css_ele: HTMLStyleElement, count: number; }>;

    stores: Map<string, Store>;

    private db: DataBaseOMR;

    init_module_promise: Promise<any> | null;

    constructor() {
        this.registerSession = registerWatcherComponent;
        this.unregisterSession = unregisterWatcherComponent;
        this.root_components = [];
        this.workspace_init_promise = null;
        this.templates = new Map;
        this.css_cache = new Map;
        this.stores = new Map;
        this.init = <any>null;
        this.router = <any>null;
        this.context = <any>null;
        this.root_components = [];
        this.db = new DataBaseOMR;
        this.init_module_promise = null;

        if (envIs(Environment.APP))
            (import("../app/session.js")).then(m => m.init(this));

    }

    addTemplate(name: string, innerHTML: string) {
        let template = document.createElement("template");
        template.innerHTML = innerHTML;
        this.templates.set(name, template);
    }

    setDatabaseData(key: string, val: any, DB: DatabaseType = DatabaseType.Indexed) {
        if (DB == DatabaseType.Indexed)
            this.db.put(key, val);
    }

    async getDatabaseData(key: string, DB: DatabaseType = DatabaseType.Indexed): Promise<any> {
        if (DB == DatabaseType.Indexed) {
            return this.db.get(key);
        }
    }

    /**
     * Runtime Component Class Constructor
     */
    get C() { return WickRTComponent; }
    async loadGlow(glow_url: string = "@candlelib/glow") {
        //Import glow module if it is not present
        glow = (await import(glow_url)).default;

        return glow;
    }

    get glow(): typeof GlowAnimation | null {
        if (!GLOW_CHECKED) {
            //@ts-ignore
            local_glow = globalThis["glow"];
        }

        return local_glow;
    }

    async get_store<T = any>(ns: string, key: string, ...args: any[]) {
        if (this.stores.has(ns)) {

            const store = this.stores.get(ns);

            if (store) {

                return await store.get(key, ...args);

            }


        }

        return undefined;
    }

    async set_store<T = any>(ns: string, key: string, val: T, comp: WickRTComponent): T {

        //if (!(comp instanceof WickRTComponent)) return val;

        if (!ns || ns == "persist" || ns == "persist-init") {

            if (!store.has(key) || ns == "persist-init") {
                this.register_store(ns, key, comp);
                if (ns == "persist" || ns == "persist-init") {
                    //Grab the value store within the database. 
                    const store_value = await this.getDatabaseData(key, DatabaseType.Indexed);
                    if (store_value !== undefined)
                        val = store_value;
                    else if (ns == "persist-init")
                        this.setDatabaseData(key, val, DatabaseType.Indexed);
                }
            }

            const column = store.get(key);

            if (column) {

                column.val = val;

                if (ns == "persist")
                    this.setDatabaseData(key, val, DatabaseType.Indexed);

                const update_obj = { [key]: column.val };
                for (const comp of column.comps)
                    comp.update(update_obj, BINDING_FLAG.FROM_STORE);
            }
        } else if (ns == "scope") {

            const update_obj = { [key]: val };

            //Pass the data to this object children and parent
            if (comp.par) {
                comp.par.update(update_obj, BINDING_FLAG.FROM_STORE);
                for (const child of comp.par.ch)
                    child.update(update_obj, BINDING_FLAG.FROM_STORE);
            }


            for (const child of comp.ch)
                child.update(update_obj, BINDING_FLAG.FROM_STORE);

            comp.update(update_obj, BINDING_FLAG.FROM_STORE);

        } else if (ns == "up") {

            const update_obj = { [key]: val };

            let par = comp.par;

            while (par) {
                par.update(update_obj, BINDING_FLAG.FROM_STORE);
                par = par.par;
            }
        } else if (this.stores.has(ns)) {

            const store = this.stores.get(ns);

            if (store) {

                const new_val = await store.set(key, val);

                const data = { [key]: new_val };

                for (const comp of store.key_map.get(key) ?? [])
                    comp.update(data, BINDING_FLAG.FROM_STORE);
            }
        }

        return val;
    }
    register_store(ns: string, key: string, comp: WickRTComponent) {
        if (!ns || ns == "persist") {
            if (!store.has(key))
                store.set(key, { val: undefined, comps: new Set() });
            const column = store.get(key);
            if (column) {

                column.comps.add(comp);
                if (column.val !== undefined)
                    comp.update({ [key]: column.val });
            }
        } else if (ns == "session") {
            registerWatcherComponent(comp, key);
        } else if (this.stores.has(ns)) {

            const store = this.stores.get(ns);

            if (store) {

                if (!store.key_map.has(key))
                    store.key_map.set(key, new Set());

                store.key_map.get(key)?.add(comp);

                new Promise(async () => {
                    comp.update({ [key]: await store.get(key) }, BINDING_FLAG.FROM_STORE);
                });
            }
        }
    }

    unregister_store(ns: string, key: string, val: any, comp: WickRTComponent) {
        if (!ns || ns == "persist") {
            if (!store.has(key))
                return;
            const column = store.get(key);
            if (column) {
                column.comps.delete(comp);
                if (column.comps.size == 0)
                    store.delete(key);
            }
        } else if (ns == "session") {
            registerWatcherComponent(comp, key);
        } else if (this.stores.has(ns)) {

            const store = this.stores.get(ns);

            if (store) {

                if (!store.key_map.has(key))
                    return;

                const set = store.key_map.get(key);

                if (set) {

                    set.delete(comp);

                    if (set.size == 0)
                        store.key_map.delete(key);
                }
            }
        }
    }

    get p() { return this.context; }
    /**
     * KEEP________________________________________________________
     * Registers component
     * @param component - A WickTt
     * @returns 
     */
    rC(component: typeof WickRTComponent) {
        this.context.component_class.set(component.name, component);
        return component;
    };

    /**
     * KEEP________________________________________________________
     * Retrieve component class
     * @param name 
     */
    gC(component_name: string) {
        return this.context.component_class.get(component_name);
    };


    OVERRIDABLE_onComponentCreate(component_instance: WickRTComponent) { }

    OVERRIDABLE_onComponentMetaChange() { }


    /**
     * Adds the comp to root components array if the 
     * mode if Workspace is set in this.environment.
     * 
     * @param comp 
     */
    addRootComp(comp: WickRTComponent) {
        this.root_components.push(comp);
    }


    /**
     * Replace the current context with a new set.
     * > Warning:  This will cause a lose of all currently
     * > compiled components.
     */

    setPresets(preset_options: UserPresets) {

        if (this.context) {

            if (preset_options)
                //@ts-ignore
                this.context.integrate_new_options(preset_options);

        } else {

            //create new component
            const context = new Context(preset_options);

            //if (!this.context)
            this.context = <Context><any>context;
        }

        return <Context>this.context;
    };


    addAPI(obj: { [key: string]: any; }) {
        if (this.context.api)
            for (const name in obj)
                this.context.api[name] = { default: obj[name] };
    }


    setCSS(comp: WickRTComponent) {

        const style_string = comp.getCSS();

        if (style_string && this.css_cache) {

            if (!this.css_cache.has(comp.name)) {

                if (window) {
                    const { document } = window,

                        css_ele = document.createElement("style");

                    css_ele.innerHTML = style_string;

                    document.head.appendChild(css_ele);

                    this.css_cache.set(comp.name, { css_ele, count: 1 });
                }
            } else {
                if (this.css_cache.has(comp.name))
                    //@ts-ignore
                    this.css_cache.get(comp.name).count++;
            }
        }
    }

    purgeCSS(name: string) {
        if (envIs(Environment.WORKSPACE)) {
            const cache = this.css_cache.get(name);
            if (cache) {
                cache.count = 0;
                this.removeCSS(name);
            }
        }
    }

    removeCSS(name: string) {

        const cache = this.css_cache.get(name);

        if (cache && cache.css_ele.parentElement) {
            cache.count--;
            if (cache.count <= 0) {
                cache.css_ele.parentElement.removeChild(cache.css_ele);
                this.css_cache.delete(name);
            }
        }
    }
    /**
     * Integrate the givin set of UserPresets with
     * the runtime context.
     * @param presets_options 
     * @returns 
     */
    appendPresets(presets_options: UserPresets): Promise<any> {

        this.setPresets(presets_options);

        return (this.init_module_promise = this.loadModules(presets_options, this.context));
    };


    /**
     * Loads ES6 modules from a source path. 
     * @param incoming_options 
     * @param extant_presets 
     */
    async loadModules(incoming_options: UserPresets, extant_presets: Context) {

        for (const [id, url, flags] of incoming_options?.repo ?? []) {

            if (extant_presets.api) {
                if (!extant_presets.api[id]) {
                    try {

                        const uri = <URI>URI.resolveRelative(url);

                        const mod = await import(uri + "");

                        if (uri.file == "pack.js") {
                            extant_presets.api[id] = {
                                default: mod[id]?.default,
                                module: mod[id]
                            };
                        } else {

                            extant_presets.api[id] = {
                                default: mod.default ?? null,
                                module: mod
                            };
                        };

                        if (flags & MODULE_FLAG.IS_STORE) {

                            const get = mod.get;
                            const set = mod.set;

                            if (!get)
                                throw new Error("Unable to register store: `get` method not defined.");

                            if (!set)
                                throw new Error("Unable to register store: `set` method not defined.");

                            this.stores.set(id, {
                                get, set, key_map: new Map
                            });
                        }

                    } catch (e) {
                        console.warn(new Error(`Could not load module ${url}`));
                        console.error(e);
                    }
                }
            }
        }
    }
}

const rt = new WickRuntime();

export { rt };
