import {
    Dispatcher,
    ext_map
} from "@candlelib/lantern";
import { rt } from '../../client/runtime/global.js';
import { ComponentData } from '../../compiler/common/component.js';
import { createComponent } from '../../compiler/create_component.js';
import { Context } from '../../compiler/common/context.js';
import { logger } from '../common/logger.js';
import { store } from '../server/store.js';
import { default_radiate_hooks, default_wick_hooks, RenderPage } from '../server/webpage.js';
import { get_resolved_working_directory } from './resolved_working_directory.js';
import URI from '@candlelib/uri';
import { WickCompileConfig } from '../../index.js';
export async function renderPage(

    component: ComponentData,

    context: Context = rt.context

): Promise<string | null> {

    try {
        const hooks = Object.assign({}, default_wick_hooks);

        hooks.init_script_render = function () {
            return `
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

export const workspace_plugins = new Map([
    ["default-color-picker", <URI>URI.resolveRelative("../../../plugins/workspace/color-picker.wick", URI.getEXEURL(import.meta))],
    // ["default-animator", <URI>URI.resolveRelative("../../../plugins/workspace/animator-plugin.wick", URI.getEXEURL(import.meta))]
]);

export function workspace_plugin_dispatch(config: WickCompileConfig) {

    console.log(config);

    return <Dispatcher>{
        name: "Workspace Plugin Dispatch",
        MIME: "text/html",
        keys: [],
        init(lantern, dispatcher) {
            lantern.addExtension("wick", "text/html");
            lantern.addExtension("html", "text/html");
            dispatcher.keys = [{ ext: ext_map.wick | ext_map.none, dir: "/plugin/*" }];
        },
        respond: async function (tools) {

            const name = tools.filename;

            if (!name) return false;

            if (workspace_plugins.has(name)) {

                const file_path = <URI>workspace_plugins.get(name);

                if (!await file_path.DOES_THIS_EXIST()) {
                    logger.get("plugin").warn(`Unable to load plugin ${name}: File path [${file_path}] does not exist`);
                    return false;
                }

                logger.get("plugin").log(`Loading plugin [ ${name} ] from [ ${file_path} ]`);

                const context = new Context();

                const new_comp = await createComponent(file_path, context, new URI(config.__config_root__));

                if (context.hasErrors()) {

                    for (const [name, errors] of context.errors) {

                        const comp = context.components.get(name);

                        if (comp) {

                            logger.get(`plugin`).warn(`Component ${comp.name} (${comp.location}) produced compilation errors:`);

                            for (const error of errors)
                                logger.get(`plugin`).warn(error);
                        }
                    }
                } else {

                    for (const error of context.getWarnings(new_comp))
                        logger.get(`comp warning`).warn(error);

                    const page = await renderPage(new_comp, context);

                    if (page)
                        return tools.sendUTF8String(page);
                }
            } else {
                //Load error component 
                logger.get("plugin").warn(`Unable to load plugin ${name}`);
            }

            return false;
        }
    };
};
