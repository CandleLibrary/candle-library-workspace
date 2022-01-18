import { Context } from '../compiler/common/context.js';
import { PluginSpec, PluginUnion, PLUGIN_TYPE } from "../types/plugin.js";

/****************************************************
 *  Errors
 */

class PluginError extends Error { get error_class() { return "plugin"; } }

export class PluginTypeError extends PluginError {
    constructor(plugin: PluginUnion | PluginSpec) {
        if ("validateSpecifier" in plugin)
            super(`Could Not Load PluginSpec: Invalid type [${plugin?.type}]`);
        else
            super(`Could Not Load Plugin: Invalid type [${plugin?.type}]`);
    }
}

export class PluginSpecifierError extends PluginError {
    constructor(plugin: PluginUnion) {
        super("Could Not Load Plugin: Invalid Specifier type");
    }
}

export class PluginSpecTypeError extends PluginError {
    constructor(plugin: PluginSpec) {
        super(`Spec type [${plugin?.type}] is not a valid plugin type.`);
    }
}

export class PluginValidationError extends PluginError {
    constructor(plugin: PluginSpec) {
        super(`Spec type [${plugin?.type}] has an invalid or missing validationSpecifier function`);
    }
}

export class PluginRequiresError extends PluginError {
    constructor(plugin: PluginSpec) {
        if (!plugin.requires)
            super(`Missing requires object on spec ${plugin.type}`);
        else
            super(`Missing one or both of requirements clientHandler or serverHandler`);
    }
}

export class PluginRecoverError extends PluginError {
    constructor(plugin: PluginSpec) {
        super(`Missing defaultRecover function`);
    }
}

export class PluginMissingRequirementError extends PluginError {
    constructor(plugin: PluginUnion, requirement: string) {
        super(`Plugin ${plugin.type}::${plugin.specifier} missing requirement ${requirement}`);
    }
}

/****************************************************
 *  Class
 */
export class PluginStore {

    static specs: Map<string, PluginSpec>;

    plugins: Map<string, Map<string, PluginUnion>>;
    /**
     * Add a spec for a plugin type
     */

    static addSpec(plugin_spec: PluginSpec) {

        if (typeof plugin_spec?.type != "string")
            throw new PluginTypeError(plugin_spec);

        let HAS_VALUE = false;

        for (const key in PLUGIN_TYPE)
            if (PLUGIN_TYPE[key] == plugin_spec?.type) {
                HAS_VALUE = true;
                break;
            }

        if (PLUGIN_TYPE[plugin_spec?.type] == undefined)

            if (!HAS_VALUE)
                throw new PluginSpecTypeError(plugin_spec);

        if (
            !("validateSpecifier" in plugin_spec)
            || (typeof plugin_spec.validateSpecifier("test-123")) !== "boolean"
        )
            throw new PluginValidationError(plugin_spec);

        if (
            !Array.isArray(plugin_spec.requires)
            || (!plugin_spec.requires.includes("clientHandler") && !plugin_spec.requires.includes("serverHandler"))
        )
            throw new PluginRequiresError(plugin_spec);

        if (typeof plugin_spec.defaultRecover != "function")
            throw new PluginRecoverError(plugin_spec);

        PluginStore.specs.set(plugin_spec.type, plugin_spec);
    }


    constructor() {
        this.plugins = new Map;
    }

    addPlugin(plugin: PluginUnion) {

        if (
            typeof plugin?.type != "string"
            || !PluginStore.specs.has(plugin?.type)
        )
            throw new PluginTypeError(plugin);
        const spec = PluginStore.specs.get(plugin.type);

        if (typeof plugin.specifier != "string" || !spec.validateSpecifier(plugin.specifier))
            throw new PluginSpecifierError(plugin);

        for (const requirement of spec.requires)
            if (!(requirement in plugin))
                throw new PluginMissingRequirementError(plugin, requirement);

        if (!this.plugins.has(plugin.type))
            this.plugins.set(plugin.type, new Map);

        this.plugins.get(plugin.type).set(plugin.specifier, plugin);
    }

    getPlugin(type: string, selector: string): PluginUnion {

        if (this.plugins.has(type)) {

            const plugin_class = this.plugins.get(type);

            if (plugin_class.has(selector)) {
                return plugin_class.get(selector);
            }
        }
        return null;
    }

    hasPlugin(type: string, selector: string): boolean {

        if (this.plugins.has(type)) {
            const plugin_class = this.plugins.get(type);
            return plugin_class.has(selector);
        }
        return false;
    }

    async runClientPlugin(context: Context, type: string, selector: string, ...args: any[]) {
        const plugin = this.getPlugin(type, selector);
        if (plugin) try {
            return await plugin.clientHandler(context, ...args);
        } catch (e) {
            console.error(e);
        }
        return await PluginStore.specs.get(type).defaultRecover("clientHandler", selector, ...args);
    }

    async runServerPlugin(context: Context, type: string, selector: string, ...args: any[]) {
        const plugin = this.getPlugin(type, selector);
        if (plugin) try {
            return await plugin.clientHandler(context, ...args);
        } catch (e) {
            console.error(e);
        }
        return await PluginStore.specs.get(type).defaultRecover("serverHandler", selector, ...args);
    }
}

PluginStore.specs = new Map;

export function addPlugin(context: Context, plugin: PluginUnion) {

    const store = context.plugins;

    store.addPlugin(plugin);
}