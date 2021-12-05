import {
    Dispatcher,
    ext_map
} from "@candlelib/lantern";
import { rt } from '../../client/runtime/global.js';
import { ComponentData } from '../../compiler/common/component.js';
import { createComponent } from '../../compiler/create_component.js';
import { Context } from '../../compiler/common/context.js';
import { logger } from '../logger.js';
import { store } from '../server/store.js';
import { default_radiate_hooks, default_wick_hooks, RenderPage } from '../server/webpage.js';
import { get_resolved_working_directory } from './resolved_working_directory.js';
export async function renderPage(

    component: ComponentData

): Promise<string | null> {

    try {
        const hooks = Object.assign({},
            component.RADIATE
                ? default_radiate_hooks
                : default_wick_hooks
        );

        if (component.RADIATE)
            hooks.init_script_render = function () {
                return `
    import init_router from "/@cl/wick-radiate/";
    init_router();
    import "/@cl/wick/workspace/client/index.js";
                `;
            };


        else
            hooks.init_script_render = function () {
                return `
    import w from "/@cl/wick-rt/";
    w.hydrate();
    import "/@cl/wick/workspace/client/index.js";
                `;
            };

        return (await RenderPage(
            component,
            rt.context,
            {
                VERBOSE_ANNOTATION_ATTRIBUTES: true,
                ALLOW_STATIC_REPLACE: false,
                INTEGRATED_CSS: true,
                INTEGRATED_HTML: true,
                STATIC_RENDERED_HTML: true
            },
            hooks
        ))?.page ?? null;

    } catch (e) {
        logger.error(e);
        throw e;
    }
};


export const workspace_component_dispatch = <Dispatcher>{
    name: "Workspace Component",
    MIME: "text/html",
    keys: [],
    init(lantern, dispatcher) {
        lantern.addExtension("wick", "text/html");
        lantern.addExtension("html", "text/html");
        dispatcher.keys = [{ ext: ext_map.wick | ext_map.none, dir: "/*" }];
    },
    respond: async function (tools) {

        if ("" == tools.ext) {

            if (tools.url.path.slice(-1) !== "/") {
                //redirect to path with end delimiter added. Prevents errors with relative links.
                const new_path = tools.url;

                return tools.redirect(new_path.path + "/");
            }

            if (store.endpoints?.has(tools.dir)) {
                //@ts-ignore
                const { comp } = store.endpoints.get(tools.dir);

                if (comp.HAS_ERRORS) {

                    logger.get(`comp error`).warn(`Component ${comp.name} (${comp.location}) produced compilation errors:`);
                    for (const error of rt.context.getErrors(comp))
                        logger.get(`comp error`).warn(error);
                }

                const page = await renderPage(comp);

                if (page)
                    return tools.sendUTF8String(page);
            }
        }

        return false;
    }
};
