import { JSNode } from '@candlelib/js';
import { default as URI, default as URL } from "@candlelib/uri";
import { PluginStore } from "../../plugin/plugin.js";
import { WickRTComponent } from '../../runtime/component.js';
import { ComponentClassStrings, ComponentStyle } from '../../types/component.js';
import { WickCompileConfig } from "../../types/config.js";
import { ComponentData } from './component.js';

let CachedPresets: Context | null = null;

/**
 * Default configuration options
 */
const DefaultPresets = <Context>{
    options: {
        USE_SHADOW: false,
        USE_SHADOWED_STYLE: false,
        CACHE_URL: false,
        GENERATE_SOURCE_MAPS: false,
        REMOVE_DEBUGGER_STATEMENTS: true,
        THROW_ON_ERRORS: true,
        INCLUDE_SOURCE_URI: false,
        url: {
            glow: "@candlelib/glow",
            wick: "@candlelib/wick",
            wickrt: "@candlelib/wick",
        }
    }
};

/**
 * Global store for build and runtime objects
 */
export class Context {


    /**
    *  Object of options that can be passed to the Wick compiler.
    */
    options?: {

        /**
         * If `true` Wick will throw on any errors encountered when
         * parsing a template file.
         *
         * Errors can be caught using a try catch statement on the
         * wick object to using the Promise~catch method on the wick object.
         */
        THROW_ON_ERRORS?: boolean;

        /**
         * If `true` URL fetches will be cached with JS, regardless of browser or 
         * HTTP cache configurations.
         */
        CACHE_URL?: boolean;

        /**
         * Configured by `preset_options.USE_SHADOW`. If set to `true`, and if the browser supports it, 
         * compiled and rendered template elements will be bound to a `<component>` shadow DOM, instead 
         * being appended as a child node.
         * @instance
         * @readonly
         */
        USE_SHADOW?: boolean;

        /**
         * 
         */
        USE_SHADOWED_STYLE?: boolean;

        /**
         * Debugger statements are removed from final output of a component class if `true`.
         */
        REMOVE_DEBUGGER_STATEMENTS?: boolean,

        /**
         * Class string builder generates source maps if `true`.
         */
        GENERATE_SOURCE_MAPS?: boolean;


        /**
         * Append URI string comment to source data when rendering - Default is false
         */
        INCLUDE_SOURCE_URI?: boolean;

        /**
         *  CandleLibrary src URLs used when rendering wick components to pages
         */
        url?: {
            wick?: string,
            wickrt?: string,
            glow?: string;
        };
    };

    /**
     * Test scripts strings defined within labeled test blocks when
     * using the `@test` synthetic imports. Used in conjuction
     * with `@candlelib/cure` to run tests on individual component instances.
     */
    test_rig_sources: WeakMap<ComponentData, JSNode[]>;

    /**
     * An object of properties that are defined within the 
     * WickCompileConfig["globals"] object. 
     */
    globals: WickCompileConfig["globals"];

    /**
     * An object of globally registered data models that
     * components can be reference within runtime components
     */
    models: { [key: string]: any; };

    /**
     * URL of the initiating script.
     */
    url?: URL;

    /**
     * Any objects or functions that should be accessible to all components
     * through the `"@api"` import path.
     */
    api?: {
        [key: string]: {
            /**
             * The API object or default export of a module
             */
            default: any;
            [key: string]: any;
        };
    };
    /**
     * A list of external resource paths that should be loaded before the first
     * component is instantiated.
     */
    repo: Map<string, {
        /**
         * The specifier path of the import statement
         */
        url: string,
        /**
         * The hash name of the specifier
         */
        hash: string,
        /**
         * the imported module object
         */
        module: any;
    }>;

    plugins: PluginStore;

    /**
     * Store for WickRTComponents.
     */
    component_class: Map<string, typeof WickRTComponent>;

    /**
     * Store for ComponentData
     */
    components: Map<string, ComponentData>;

    css_cache?: Map<string, { css_ele: HTMLStyleElement, count: number; }>;

    document?: Document;

    window?: Window;
    /**
     *  Prevent infinite recursion
     */
    wrapper?: typeof WickRTComponent;

    named_components: Map<string, ComponentData>;

    processLink: (...any: any[]) => any;

    component_class_string: Map<string, ComponentClassStrings>;

    styles?: Map<string, ComponentStyle>;

    /**
     * The @candlelib/glow module if it has been imported
     */
    glow?: any;

    template_data: WeakMap<ComponentData, any[]>;

    active_template_data?: any;
    static global = { get v() { return CachedPresets; }, set v(e) { } };

    /**
     * Constructs a Presets object that can be passed to the Wick compiler.
     * @param user_presets - An object of optional configurations.
     */
    constructor(user_presets: UserPresets | Context = <UserPresets>{}) {

        user_presets = Object.assign({}, DefaultPresets, user_presets);

        user_presets.options = Object.assign({}, DefaultPresets.options, user_presets.options);

        user_presets.options.url = Object.assign({}, DefaultPresets.options.url, (user_presets.options || {}).url || {});

        this.url = new URL;

        this.document = typeof document != "undefined" ? document : <Document>{};

        this.window = typeof window != "undefined" ? window : <Window>{};

        this.wrapper = null;

        this.options = user_presets.options;

        this.api = {};

        this.models = {};

        this.globals = {};

        this.test_rig_sources = new Map;

        this.component_class = new Map;

        this.component_class_string = new Map;

        this.components = new Map;

        this.named_components = new Map;

        this.repo = new Map;

        this.styles = new Map;

        this.css_cache = new Map;

        this.plugins = new PluginStore;

        //this.options.USE_SHADOWED_STYLE = ((user_presets.options.USE_SHADOWED_STYLE) && (this.options.USE_SHADOW));

        this.integrate_new_options(user_presets);

        this.template_data = new WeakMap;

        this.active_template_data = null;

        this.processLink = _ => _;

        CachedPresets = this;
    }

    integrate_new_options(user_presets: UserPresets | Context) {

        this.verifyOptions(user_presets);

        this.addRepoData(<UserPresets>user_presets);

        this.loadModelData(<UserPresets>user_presets);

        this.loadSchemeData(<UserPresets>user_presets);

        this.loadAPIObjects(<UserPresets>user_presets);
    }

    private loadAPIObjects(user_presets: UserPresets | Context) {
        if (user_presets.api) {
            for (const name in user_presets.api)
                this.addAPIObject(name, user_presets.api[name]);
        }
    }

    private verifyOptions(user_presets) {

        const options = user_presets.options;

        for (const cn in options)
            if (typeof options[cn] != typeof DefaultPresets.options[cn])
                throw new ReferenceError(`Unrecognized preset ${cn}`);
    }

    private loadSchemeData(user_presets: UserPresets) {
        const d = user_presets.schemes;

        //  /  if (d)
        //  /      for (const cn in d)
        //  /          this.schemes[cn] = d[cn];
    }

    private loadModelData(user_presets: UserPresets) {
        let c = user_presets.models;

        if (c)
            for (const cn in c)
                this.models[cn] = c[cn];
    }

    private addRepoData(user_presets: UserPresets) {
        for (const [hash, url] of user_presets.repo || [])
            this.repo.set(url, {
                hash,
                url,
                module: null
            });
    }

    async getDataSource(uri: URI) {

        const uri_str = uri + "";

        if (uri_str in this.api)
            return this.api[uri_str].default;

        let value = undefined;

        if (await uri.DOES_THIS_EXIST()) {
            switch (uri.ext) {
                case "json":
                    value = uri.fetchJSON();
                    break;
            }
        }

        this.api[uri_str] = {
            hash: uri_str,
            default: value,
        };

        return this.getDataSource(uri);
    }

    addAPIObject(name: string, obj: any) {
        if (name in this.api)
            return;

        this.api[name] = {
            hash: name,
            default: obj,
        };
    }

    /**
        Copies values of the Presets object into a generic object. The new object is not frozen.
    */
    copy(): Context {
        const obj = <Context>{};

        for (let a in this) {
            if (a == "components")
                obj.components = this.components;
            else if (typeof (this[a]) == "object")
                //@ts-ignore
                obj[a] = Object.assign({}, this[a]);
            //@ts-ignore
            else if (Array.is(this[a]))
                //@ts-ignore
                obj[a] = this[a].slice();
            else
                //@ts-ignore
                obj[a] = this[a];
        }

        const context = new Context(obj);

        context.processLink = this.processLink.bind(this);

        return context;
    }

    assignGlobals(globals: WickCompileConfig["globals"]) {
        if (typeof globals == "object") {
            this.globals = Object.assign({}, globals);
        }
    }
}

enum ModuleType {
    "local"
}

export interface UserPresets {

    repo?: [[string, string, ModuleType]];

    api?: {
        [key: string]: any;
    };

    options?: Context["options"];

    schemes?: any;

    models?: any;
}
