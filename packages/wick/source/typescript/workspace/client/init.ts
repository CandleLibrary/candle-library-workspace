import * as css from "@candlelib/css";
import { Logger } from "@candlelib/log";
import spark from "@candlelib/spark";
import { Context, UserPresets, WickLibrary, WickRTComponent } from '../../index.js';
import * as ACTIONS from "./actions/action.js";
import { APPLY_ACTION, START_ACTION } from './action_initiators.js';
import { getComponentNameFromElement } from './common_functions.js';
import { initializeEvents } from './event.js';
import { initSystem } from './system.js';
import { WorkspaceSystem } from './types/workspace_system.js';

export const logger = Logger.createLogger("wick-client").activate();

export function init() {

    const editor_frame = document.createElement("iframe");
    const edited_frame = document.createElement("iframe");

    editor_frame.src = "/flame-editor/";
    editor_frame.style.width = "100%";
    editor_frame.style.height = "100%";
    editor_frame.style.position = "fixed";
    editor_frame.style.boxSizing = "border-box";
    editor_frame.style.top = "0";
    editor_frame.style.left = "0";
    editor_frame.style.border = "1px solid black";
    //editor_frame.style.pointerEvents = "none";
    editor_frame.style.zIndex = "1000000";
    editor_frame.style.display = "none";

    document.body.appendChild(editor_frame);

    //@ts-ignore
    const page_wick: WickLibrary = <any>globalThis["wick"];

    return new Promise((res, rej) => {
        editor_frame.contentWindow.addEventListener("load", async () => {

            const editor_window = editor_frame.contentWindow;

            //@ts-ignore
            const editor_wick: WickLibrary = editor_window["wick"];

            const host = document.location.hostname;
            const port = document.location.port;
            const protocol = "wss";
            const uri = `${protocol}://${host}:${port}`;

            const system = await initSystem(uri, page_wick, editor_wick, css, editor_window, editor_frame);

            const session = system.session;
            debugger;
            editor_wick.appendPresets(<UserPresets>{
                models: {
                    "active-selection": system.active_selection,
                    "flame-editor": system.editor_model,
                    "edited-components": system.editor_model
                },
                api: {
                    sys: system,
                    getComponentNameFromElement,
                    APPLY_ACTION: APPLY_ACTION,
                    START_ACTION: START_ACTION,
                    ACTIONS: ACTIONS,

                }
            });

            // Allow sometime for the editor components to 
            // initialize

            await spark.sleep(300);

            system.action_bar.setModel(system.active_selection);

            initializeEvents(system, window);

            editor_frame.style.display = "block";

            res(true);
        });
    });
};
