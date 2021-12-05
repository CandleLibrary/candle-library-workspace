/**
 * Copyright (C) 2021 Anthony Weathersby - Flame Language Server & Dev Server
 */

import lantern, {
    $404_dispatch,
    candle_favicon_dispatch,
    candle_library_dispatch,
    filesystem_dispatch,
    LanternServer
} from "@candlelib/lantern";
import URI from '@candlelib/uri';
import { WebSocketServer } from "ws";
import { rt } from '../client/runtime/global.js';
import { WickCompileConfig } from '../types/config.js';
import { set_resolved_working_directory } from './dispatchers/resolved_working_directory.js';
import { workspace_component_dispatch } from './dispatchers/workspace_component_dispatch.js';
import { workspace_editor_dispatch } from './dispatchers/workspace_editor_dispatch.js';
import { workspace_modules_dispatch } from './dispatchers/workspace_modules_dispatch.js';
import { logger } from './logger';
import { ServerSession } from './server/session.js';
import { initializeDefualtSessionDispatchHandlers } from './server/session_handlers.js';
import { loadComponents } from './server/store.js';

URI.server();
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



export async function initDevServer(
    port: number = 8082,
    config: WickCompileConfig,
    working_directory: URI,
) {
    rt.setPresets();

    set_resolved_working_directory(<URI>URI.resolveRelative(working_directory, process.cwd() + "/"));

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
