import {
    Dispatcher,
    ext_map
} from "@candlelib/lantern";
import { rt } from '../../client/runtime/runtime.js';
import { ComponentData } from '../../compiler/common/component.js';
import { createComponent } from '../../compiler/create_component.js';
import { Context } from '../../compiler/common/context.js';
import { logger } from '../common/logger.js';
import { store } from '../server/store.js';
import { default_radiate_hooks, default_wick_hooks, RenderPage } from '../server/webpage.js';
import { get_resolved_working_directory } from './resolved_working_directory.js';
export async function renderPage(

    component: ComponentData,

    context: Context = rt.context

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
    import "/@cl/wick/workspace/client/index.js";
    import init_router from "/@cl/wick-radiate/";
    import w from "/@cl/wick-rt/";
    init_router();
                `;
            };

        else
            hooks.init_script_render = function () {
                return `
    import "/@cl/wick/workspace/client/index.js";
    import w from "/@cl/wick-rt/";
    w.hydrate();
                `;
            };

        return (await RenderPage(
            component,
            context,
            {
                VERBOSE_ANNOTATION_ATTRIBUTES: true,
                ALLOW_STATIC_REPLACE: false,
                INTEGRATED_CSS: false,
                INTEGRATED_HTML: false,
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

                //Load component from scratch
                //@ts-ignore
                const { comp } = store.endpoints.get(tools.dir);

                const context = new Context();

                const new_comp = await createComponent(comp.location, context, get_resolved_working_directory());

                if (context.hasErrors()) {

                    for (const [name, errors] of context.errors) {

                        const comp = context.components.get(name);

                        if (comp) {

                            logger.get(`comp error`).warn(`Component ${comp.name} (${comp.location}) produced compilation errors:`);

                            for (const error of errors)
                                logger.get(`comp error`).warn(error);

                        }
                    }
                }

                for (const error of context.getWarnings(new_comp))
                    logger.get(`comp warning`).warn(error);

                const page = await renderPage(new_comp, context);

                if (page)
                    return tools.sendUTF8String(page);
            }
        }

        return false;
    }
};
