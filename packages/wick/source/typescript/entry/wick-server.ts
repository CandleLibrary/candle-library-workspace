import HTML from "@candlelib/html";
import URL from "@candlelib/uri";
import { default_radiate_hooks, default_wick_hooks, RenderPage } from "../compiler/ast-render/webpage.js";
import { loadComponentsFromDirectory } from "../server/load_directory.js";
import wick, { WickLibrary } from "./wick-full.js";
export type WickServer = WickLibrary & {

    utils: {
        /**[API]
         * Builds a single page from a wick component, with the
         * designated component serving as the root element of the
         * DOM tree. Can be used to build a hydratable page.
         *
         * Optionally hydrates with data from an object serving as a virtual preset.
         *
         * Returns HTML markup and an auxillary script strings that
         * stores and registers hydration information.
         */
        RenderPage: typeof RenderPage;

        loadComponentsFromDirectory: typeof loadComponentsFromDirectory;

        default_radiate_hooks: typeof default_radiate_hooks;

        default_wick_hooks: typeof default_wick_hooks;
    };
};

const wick_server: WickServer = <WickServer>wick;

wick_server.utils.RenderPage = RenderPage;
wick_server.utils.loadComponentsFromDirectory = loadComponentsFromDirectory;
wick_server.utils.default_radiate_hooks = default_radiate_hooks;
wick_server.utils.default_wick_hooks = default_wick_hooks;

// Initialize server version of dependencies
await URL.server();
await HTML.server();

export type { ComponentData } from '../compiler/common/component';
export type { Context, UserPresets } from '../compiler/common/context';
export type { WickRTComponent } from '../runtime/component';
export type { WickRuntime } from '../runtime/global';
export * from "../server/load_directory.js";
export * from "../types/all.js";
export type { WickLibrary } from './wick-full';
export * from "./wick-full.js";


import { create_config_arg_properties } from './cli/config_arg_properties.js';
export const args = {
    create_config_arg_properties
};
export default wick_server;