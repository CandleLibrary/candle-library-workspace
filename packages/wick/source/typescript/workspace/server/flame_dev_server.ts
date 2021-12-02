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
import wick, { ComponentData } from "@candlelib/wick";
import { WickCompileConfig } from '@candlelib/wick/build/types/types/all';
import { WebSocketServer } from "ws";
import { ServerSession } from './session.js';
import { initializeDefualtSessionDispatchHandlers } from './session_handlers.js';
import { loadComponents, store } from './store.js';
const logger = Logger.get("flame");
Logger.get("lantern");
Logger.get("wick");
URI.server();

function initializeWebSocketServer(lantern: LanternServer<any>) {
    const ws_logger = logger.get("web-socket");
    ws_logger.log("Initializing WebSocket server");

    const ws_server = new WebSocketServer({
        server: lantern.server
    });

    ws_server.on("listening", () => {
        ws_logger.log(`WebSocket server initialized and listening at [ ${
            /**/
            //@ts-ignore
            (ws_server.address()?.address + ":" + ws_server.address()?.port)
            } ]`);
    });

    ws_server.on("connection", (connection) => {
        ws_logger.log("Connection Made");
        initializeDefualtSessionDispatchHandlers(new ServerSession(connection));
    });

    ws_server.on("close", () => {
        ws_logger.log("Websocket server closed");
    });

    ws_server.on("error", e => {
        ws_logger.get("error").error(e);
    });
}


async function renderPage(

    component: ComponentData

): Promise<string> {

    try {
        const hooks = Object.assign({},
            component.RADIATE
                ? wick.utils.default_radiate_hooks
                : wick.utils.default_wick_hooks
        );

        if (component.RADIATE)
            hooks.init_script_render = function () {
                return `
    import init_router from "/@cl/wick-radiate/";
    init_router();
    import "/@cl/flame/";
                `;
            };


        else
            hooks.init_script_render = function () {
                return `
    import w from "/@cl/wick-rt/";
    w.hydrate();
    import "/@cl/flame/";
                `;
            };


        return (await wick.utils.RenderPage(
            component,
            wick.rt.context,
            {
                VERBOSE_ANNOTATION_ATTRIBUTES: true,
                INTEGRATED_CSS: true,
            },
            hooks
        )).page;

    } catch (e) {
        logger.error(e);
        throw e;
    }
};
const flaming_wick_dispatch = <Dispatcher>{
    name: "Flaming Wick",
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

            if (store.endpoints.has(tools.dir)) {

                const { comp } = store.endpoints.get(tools.dir);

                for (const error of comp.errors)
                    logger.error(error);

                const page = await renderPage(comp);

                return tools.sendUTF8String(page);
            }
        }


        return false;
    }
};


const flame_editor_dispatch = <Dispatcher>{
    name: "Flame Editor",
    MIME: "text/html",
    keys: [],
    init(lantern, dispatcher) {
        dispatcher.keys = [{ ext: ext_map.none, dir: "/flame-editor" }];
    },
    respond: async function (tools) {
        const flame_editor_presets = new wick.objects.Context();

        const editor_path = URI.resolveRelative("@candlelib/flame/source/components/editor.wick");

        const comp = await wick(editor_path, flame_editor_presets);

        if (comp.HAS_ERRORS)
            for (const error of comp.errors)
                Logger.get("flame").get("editor-dispatch").log(error);

        const { page } = await wick.utils.RenderPage(comp, flame_editor_presets);

        return tools.sendUTF8String(page);
    }
};
export async function initDevServer(
    port: number = 8082,
    config: WickCompileConfig
) {

    wick.rt.setPresets();

    const working_directory = new URI(process.cwd());

    await loadComponents(
        working_directory,
        wick.rt.context,
        config
    );

    logger.log(`Initializing HTTP server`);

    const server = await lantern({
        port,
        host: "0.0.0.0",
        secure: lantern.mock_certificate,
        log: lantern.null_logger
    });

    server.addDispatch(flame_editor_dispatch);
    server.addDispatch(flaming_wick_dispatch);
    server.addDispatch(candle_library_dispatch);
    server.addDispatch(filesystem_dispatch);
    server.addDispatch(candle_favicon_dispatch);
    server.addDispatch($404_dispatch);


    logger.log(`HTTP Server initialized and listening at [ ${port} ] `);

    initializeWebSocketServer(server);
}
