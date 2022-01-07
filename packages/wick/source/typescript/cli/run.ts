import lantern, {
    $404_dispatch, args, candle_favicon_dispatch, candle_library_dispatch, Dispatcher,
    ext_map, filesystem_dispatch
} from "@candlelib/lantern";
import { Logger, LogLevel } from "@candlelib/log";
import { addCLIConfig, args as para_args } from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import { mkdirSync, promises } from 'fs';
import { ComponentData } from '../compiler/common/component.js';
import { Context } from "../compiler/common/context.js";
import { createComponent } from '../compiler/create_component.js';
import { init_build_system } from '../compiler/init_build_system.js';
import { EditorCommand } from '../types/editor_types.js';
import { CommandHandler } from '../workspace/common/session.js';
import { compile_module } from '../workspace/server/compile_module.js';
import { initializeWebSocketServer } from '../workspace/server/server.js';
import { ServerSession } from '../workspace/server/session.js';
import { default_radiate_hooks, default_wick_hooks, RenderPage } from '../workspace/server/webpage.js';
import { create_config_arg_properties } from "./config_arg_properties.js";
const writeFile = promises.writeFile;


const run_logger = Logger.get("wick").get("run").activate().deactivate(LogLevel.DEBUG);

const log_level_arg = addCLIConfig("app", para_args.log_level_properties);
const config_arg = addCLIConfig("app", create_config_arg_properties());
const port_arg = addCLIConfig("app", args.create_port_arg_properties("Wick", "WICK_DEV_PORT", "8080"));
const browser_arg = addCLIConfig<string>("app", {
    key: "browser",
    REQUIRES_VALUE: true,
    default: "none",
    help_arg_name: "browser-name",
    accepted_values: ["chrome", "opera", "safari", "edge", "firefox"],
    help_brief: "Open a web browser after component has been compiled and server has started"
});

const app_callback = (
    async (input_path, args) => {


        Logger.get("wick").deactivate().activate(log_level_arg.value);

        run_logger.deactivate().activate(log_level_arg.value);
        run_logger.activate(log_level_arg.value);

        await init_build_system();

        const root_path = URI.resolveRelative(input_path);
        const config = config_arg.value;

        const output_dir = <URI>URI.resolveRelative("./.wick-temp/");

        if (!await output_dir.DOES_THIS_EXIST())
            mkdirSync(output_dir + "", { recursive: true });

        if (root_path) {

            run_logger
                .debug(`Input root path:\n[ ${input_path + ""} ]`);

            if (!await root_path.DOES_THIS_EXIST()) {
                run_logger.error(`Source path ${root_path} does not exist`);
                return -1;
            }

            //Find all components
            //Build wick and radiate files 
            //Compile a list of entry components
            const context = new Context();

            context.assignGlobals(config?.globals ?? {});

            run_logger
                .log(`Loading resources from:\n[ ${root_path + ""} ]`);

            if (root_path.ext == "wick" || root_path.ext == "md" || root_path.ext == "html") {
                //Initialize component
                /* await createComponent(root_path, context);

                if (context.hasErrors()) {
                    for (const [name, errors] of context.errors) {
                        for (const error of errors) {
                            const comp = <ComponentData>context.components.get(name);
                            const location = root_path.getRelativeTo(comp.location);
                            run_logger.warn(`\nError encountered in component ${comp.name} (${location}):`);
                            run_logger.error(error);
                        }
                    }
                } */

                await initServer(root_path, context, output_dir, config);

            } else {

                run_logger.warn(`Unable to resolve a component from : [ ${root_path} ]`);
            }
        } else {
            throw new Error("Unable to locate a component at " + input_path);
        }
    }
);

addCLIConfig<URI>("app", {
    key: "app",
    help_arg_name: "component_path",
    help_brief: `
Host a single component on a local server. 
`,
    REQUIRES_VALUE: true,
    accepted_values: <(typeof URI)[]>[URI]
}).callback = app_callback;



async function renderPage(

    component: ComponentData,

    context: Context

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
    import "/@cl/wick/client/app/session.js";
    import init_router from "/@cl/wick-radiate/";
    import "/@cl/wick-rt/";
    init_router();
                `;
            };

        else
            hooks.init_script_render = function () {
                return `
    import "/@cl/wick/client/app/session.js";
    import "/@cl/wick-rt/";
    wick.queue_hydrate();
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

async function initServer(root_path: URI, context: Context, output_dir: URI, config: any) {

    const server = await lantern({
        host: "0.0.0.0",
        secure: lantern.mock_certificate,
        port: port_arg.value,
        cwd: root_path.dir
    });

    server.addDispatch(
        <Dispatcher>{
            name: "Wick Hosted Modules",
            MIME: "application/javascript",
            keys: [{ ext: ext_map.js, dir: "/pack/*" }],
            async respond(tools) {
                tools.setMIME();
                return tools.sendUTF8FromFile("" + URI.resolveRelative("./" + tools.url.file, output_dir));
            }
        },
        <Dispatcher>{
            name: "Wick Hosted Component",
            MIME: "text/html",
            keys: [{ ext: ext_map.none, dir: "/" }],
            async respond(tools) {

                const context = new Context();

                context.assignGlobals(config?.globals ?? {});

                const component = await createComponent(root_path, context);

                if (context.hasErrors()) {
                    for (const [name, errors] of context.errors) {
                        for (const error of errors) {
                            const comp = <ComponentData>context.components.get(name);
                            const location = root_path.getRelativeTo(comp.location);
                            run_logger.warn(`\nError encountered in component ${comp.name} (${location}):`);
                            run_logger.error(error);
                        }
                    }

                    return false;
                } else {
                    run_logger.log("Component rebuilt");
                }

                try {
                    const source_file_path = URI.resolveRelative("./pack_source.js", output_dir + "/") + "";
                    const pack_file_path = URI.resolveRelative("./pack.js", output_dir + "/") + "";
                    //Build module interface 
                    const root = `${[...context.repo].map(([name, value]) => `export * as ${value.hash} from "${value.url}";\n`
                    ).join("\n")}`;

                    await writeFile(source_file_path, root, { encoding: "utf8" });

                    const module_packs = [];

                    //Resolve module paths
                    for (const [, m] of context.repo) {
                        const url = new URI(m.url);

                        if (!url.IS_RELATIVE && !url.host) {
                            //Resolve the URI to a path relative to CWD
                            module_packs.push(m.url);
                            m.url = "/pack/pack.js";
                        }
                    }

                    await compile_module(source_file_path, pack_file_path);

                    const page = await renderPage(component, context);
                    if (page)
                        return tools.sendUTF8String(page);
                } catch (e) {
                    run_logger.error(e);
                    return false;
                }
            }
        },
        filesystem_dispatch,
        candle_favicon_dispatch,
        candle_library_dispatch,
        $404_dispatch
    );


    initializeWebSocketServer(server, session => {
        if (session) {
            session.setHandler(EditorCommand.SET_STORE, (command, session) => {

                const { data } = command;

                promises.writeFile("./store.json", JSON.stringify(data), { encoding: 'utf-8' });

            });

            session.setHandler(EditorCommand.GET_STORE, <CommandHandler<ServerSession, EditorCommand.GET_STORE>>async function (command, session) {
                try {

                    const store_data = await promises.readFile("./store.json", { encoding: "utf-8" });

                    const data = JSON.parse(store_data);

                    return {
                        command: EditorCommand.GET_STORE_REPLY,
                        data: data
                    };
                } catch (e) {
                    session.logger.warn(e);

                    return {
                        command: EditorCommand.GET_STORE_REPLY,
                        data: {}
                    };
                }

            });
        } else {
            run_logger.log("Unable to create WS server");
        }

    });

    run_logger.log(`Component running at: [ http://localhost:${port_arg.value}/ ]`);

    const { spawn } = await import("child_process");

    (<any>({
        chrome: (site: string) => spawn("google-chrome", [
            '--allow-insecure-localhost',
            '--new-window',
            '--minimal',
            `--kiosk`,
            site
        ]),
        firefox: (site: string) => spawn("firefox", [site]),
        edge: (site: string) => spawn("msedge", [site]),
        opera: (site: string) => spawn("opera", [site]),
    }))?.["chrome"]?.(`https://localhost:${port_arg.value}/`);
}
