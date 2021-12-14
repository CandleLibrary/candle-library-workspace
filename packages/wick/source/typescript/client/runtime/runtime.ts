
import GlowAnimation from '@candlelib/glow';
import { Environment, envIs } from '../../common/env.js';
import { registerWatcherComponent, unregisterWatcherComponent } from '../../common/session_watchers.js';
import { Context, UserPresets } from "../../compiler/common/context.js";
import { BINDING_FLAG } from '../../types/all';
import { Router } from '../radiate/router.js';
import { WickRTComponent } from "./component/component.js";

let GLOW_CHECKED = false;
let local_glow: any = null;
let glow: typeof GlowAnimation | null = null;


const store: Map<string, { val: any, comps: Set<WickRTComponent>; }> = new Map();

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

    constructor() {
        this.registerSession = registerWatcherComponent;
        this.unregisterSession = unregisterWatcherComponent;
        this.router = <any>null;
        this.context = <any>null;
        this.root_components = [];
        this.workspace_init_promise = null;
        this.templates = new Map;
        this.css_cache = new Map;
        this.init = <any>null;
        this.router = <any>null;
        this.context = <any>null;
        this.root_components = [];
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

    set_store<T = any>(ns: string, key: string, val: T, comp: WickRTComponent): T {

        if (!(comp instanceof WickRTComponent)) return val;

        if (!ns || ns == "persist") {

            if (!store.has(key))
                this.register_store(ns, key, comp);

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
}

const rt = new WickRuntime();

export { rt };
