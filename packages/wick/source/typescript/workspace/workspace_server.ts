/**
 * Copyright (C) 2021 Anthony Weathersby - Flame Language Server & Dev Server
 */

import lantern, {
    $404_dispatch,
    candle_favicon_dispatch,
    candle_library_dispatch,
    Dispatcher,
    ext_map,
    filesystem_dispatch,
    LanternServer
} from "@candlelib/lantern";
import { Logger } from "@candlelib/log";
import URI from '@candlelib/uri';
import { WebSocketServer } from "ws";
import { WickCompileConfig } from '../types/config.js';
import { rt } from '../client/runtime/global.js';
import { ComponentData } from '../compiler/common/component.js';
import { Context } from '../compiler/common/context.js';
import { createComponent } from '../compiler/create_component.js';
import { ServerSession } from './server/session.js';
import { initializeDefualtSessionDispatchHandlers } from './server/session_handlers.js';
import { loadComponents, store } from './server/store.js';
import { default_radiate_hooks, default_wick_hooks, RenderPage } from './server/webpage.js';
import { promises as fsp } from 'fs';
import { compile_module, compile_pack } from './server/compile_module.js';
const logger = Logger.get("wick");
Logger.get("lantern");
Logger.get("wick");
URI.server();

let resolved_working_directory = <URI>URI.resolveRelative("./", process.cwd() + "/");

function initializeWebSocketServer(lantern: LanternServer<any>) {
    const ws_logger = logger.get("web-socket");
    ws_logger.debug("Initializing WebSocket server");

    const ws_server = new WebSocketServer({
        server: lantern.server
    });

    ws_server.on("listening", () => {
        ws_logger.debug(`WebSocket server initialized and listening at [ ${
            /**/
            //@ts-ignore
            (ws_server.address()?.address + ":" + ws_server.address()?.port)
            } ]`);
    });

    ws_server.on("connection", (connection) => {
        ws_logger.debug("Connection Made");
        initializeDefualtSessionDispatchHandlers(new ServerSession(connection));
    });

    ws_server.on("close", () => {
        ws_logger.debug("Websocket server closed");
    });

    ws_server.on("error", e => {
        ws_logger.debug("error").error(e);
    });
}


async function renderPage(

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


const workspace_component_dispatch = <Dispatcher>{
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

                    Logger.get("wick").get(`comp error`).warn(`Component ${comp.name} (${comp.location}) produced compilation errors:`);
                    for (const error of rt.context.getErrors(comp))
                        Logger.get("wick").get(`comp error`).warn(error);
                }

                const page = await renderPage(comp);

                if (page)
                    return tools.sendUTF8String(page);
            }
        }

        return false;
    }
};

const workspace_modules_dispatch = <Dispatcher>{
    name: "Workspace Editor Modules",
    MIME: "application/javascript",
    keys: [],
    init(lantern, dispatcher) {
        lantern.addExtension("js", "application/javascript");
        lantern.addExtension("ts", "application/javascript");
        dispatcher.keys = [{ ext: ext_map.ts | ext_map.ts, dir: "/*" }];
    },
    respond: async function (tools) {
        const output_dir = <URI>URI.resolveRelative("./.wick-temp/", resolved_working_directory);
        const module_path = <URI>URI.resolveRelative(tools.pathname, resolved_working_directory);
        const output_path = <URI>URI.resolveRelative("./" + tools.file + ".temp", output_dir);
        if (tools.ext == "ts") {

            if (!await output_dir?.DOES_THIS_EXIST()) {
                logger.debug("Creating wick-temp folder");
                await fsp.mkdir(output_dir + "", { recursive: true });
                logger.debug("Created wick-temp folder");
            }

            console.log({
                cwd: tools.cwd,
                output_dir,
                module_path,
                output_path
            });

            await compile_module(module_path + "", output_path + "");

            if (await output_path.DOES_THIS_EXIST()) {
                tools.setMIME();
                return tools.sendUTF8FromFile(output_path + "");
            }
        }

        return false;
    }
};


const workspace_editor_dispatch = <Dispatcher>{
    name: "Workspace Editor",
    MIME: "text/html",
    keys: [],
    init(lantern, dispatcher) {
        dispatcher.keys = [{ ext: ext_map.none, dir: "/flame-editor" }];
    },
    respond: async function (tools) {
        const ws_context = new Context();

        const editor_path = <URI>URI.resolveRelative("@candlelib/wick/source/components/editor.wick", URI.getEXEURL(import.meta));


        const comp = await createComponent(editor_path, ws_context);

        for (const [name, comp] of ws_context.components) {
            if (comp.HAS_ERRORS) {
                Logger.get("wick").get(`comp error`).warn(`Component ${comp} (${comp.location}) produced compilation errors:`);
                for (const error of ws_context.getErrors(comp))
                    Logger.get("wick").get(`comp error`).warn(error);
            }
        }

        const result = await RenderPage(comp, ws_context);

        if (result)
            return tools.sendUTF8String(result.page);
    }
};
export async function initDevServer(
    port: number = 8082,
    config: WickCompileConfig,
    working_directory: URI,
) {
    rt.setPresets();

    resolved_working_directory = <URI>URI.resolveRelative(working_directory, process.cwd() + "/");

    await loadComponents(
        working_directory,
        rt.context,
        config
    );

    logger.debug(`Initializing HTTP server`);

    const server = await lantern({
        port,
        host: "0.0.0.0",
        secure: lantern.mock_certificate,
        log: lantern.null_logger,
        cwd: working_directory + ""
    });

    server.addDispatch(workspace_editor_dispatch);
    server.addDispatch(workspace_component_dispatch);
    server.addDispatch(workspace_modules_dispatch);
    server.addDispatch(candle_library_dispatch);
    server.addDispatch(filesystem_dispatch);
    server.addDispatch(candle_favicon_dispatch);
    server.addDispatch($404_dispatch);

    logger.log(`HTTPS Server initialized and listening on port [ ${port} ] `);
    logger.log(`Checkout out your workspace at [ https://localhost:${port} ]!`);

    initializeWebSocketServer(server);
}
