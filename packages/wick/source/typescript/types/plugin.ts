import { Context } from '../compiler/common/context.js';

export enum PLUGIN_TYPE {
    ELEMENT_RENDER = "element-render-hook",
    STATIC_DATA_FETCH = "static-data-fetch",
    TAG_PARSE = "element-render-hook",
    TEST_HOOK = "test-hook",
}


/**
 * Base plugin type
 * 
 * All plugins are based on this interface. 
 */
export interface BasePlugin {
    /**
     * 
     */
    type: PLUGIN_TYPE,

    /**
     * A name by which to reference this particular plugin. 
     */
    specifier: string,

    /**
     * A function that is called within a server context
     * (i.e Node.js, Deno).
     */
    serverHandler?: (context: Context, ...args: any[]) => Promise<any>;
    /**
     * A function that is incorporated and rendered to 
     * code that is sent to client. It will run in client
     * space (i.e. a browser) and have access to all 
     * methods and variables available to any other function
     * called from client code.
     */
    clientHandler?: (context: Context, ...args: any[]) => Promise<any>;
}
/**
 * Plugin used to initialize Binding Variables with data
 * that can be fetched from an API endpoint or filesystem 
 * source.
 */
export interface DataFetchPlugin extends BasePlugin {
    type: PLUGIN_TYPE.STATIC_DATA_FETCH;
}

export type PluginUnion = DataFetchPlugin;

/**
 * Determines what plugins are available in the wick 
 * parse system. 
 */
export interface PluginSpec {

    type: PLUGIN_TYPE;

    /**
     * Validates whether a specifier for a plugin 
     * is acceptable for use within the plugin type's
     * syntax. 
     */
    validateSpecifier: (arg: string) => boolean;

    /**
     * Specifies what types of handler functions the 
     * plugin needs to define.
     */
    requires: ["serverHandler"?, "clientHandler"?];

    /**
     * This function is used to handle broken plugins by
     * producing a default return value when an error is 
     * encountered in the plugins handler function
     */
    defaultRecover: (plugin_fn_type: "serverHandler" | "clientHandler", selector: string, ...args: any[]) => Promise<any>;

}