import { Logger } from "@candlelib/log";
import spark from "@candlelib/spark";
import { rt, WickEnvironment } from '../../client/runtime/runtime.js';
import { Environment, setEnv } from '../../common/env.js';
import { UserPresets, WickLibrary } from '../../index.js';
import { getComponentNameFromElement } from './common_functions.js';
import { initializeEvents } from './event.js';
import { initSystem } from './system.js';

export const logger = Logger.createLogger("wick-client").activate();

setEnv(Environment.WORKSPACE);
export function init() {


    const editor_toggle = document.createElement("button");
    editor_toggle.innerHTML = "ES";
    editor_toggle.style.position = "fixed";
    editor_toggle.style.bottom = "20px";
    editor_toggle.style.right = "20px";
    editor_toggle.style.width = "40px";
    editor_toggle.style.zIndex = "1000001";

    const editor_frame = document.createElement("iframe");

    editor_frame.src = "/flame-editor/";
    editor_frame.style.width = "100%";
    editor_frame.style.height = "100%";
    editor_frame.style.position = "fixed";
    editor_frame.style.boxSizing = "border-box";
    editor_frame.style.top = "0";
    editor_frame.style.left = "0";
    editor_frame.style.border = "1px solid black";
    editor_frame.style.zIndex = "1000000";
    editor_frame.style.display = "none";

    document.body.appendChild(editor_frame);
    document.body.appendChild(editor_toggle);

    //@ts-ignore
    const page_wick: WickLibrary = <any>globalThis["wick"];

    rt.workspace_init_promise = new Promise((res, rej) => {

        if (editor_frame.contentWindow) {

            const editor_window = editor_frame.contentWindow;
            editor_frame.contentWindow.addEventListener("load", async () => {

                //@ts-ignore
                const editor_wick: WickLibrary = editor_window["wick"];

                const host = document.location.hostname;
                const port = document.location.port;
                const protocol = "wss";
                const uri = `${protocol}://${host}:${port}`;

                const system = await initSystem(uri, page_wick, editor_wick, editor_window, editor_frame);
                if (system) {
                    editor_wick.appendPresets(<UserPresets>{
                        models: {
                            "active-selection": system.active_selection,
                            "flame-editor": system.editor_model,
                            "edited-components": system.editor_model
                        },
                        api: {
                            sys: system,
                            getComponentNameFromElement,

                        }
                    });

                    // Allow sometime for the editor components to 
                    // initialize

                    await spark.sleep(300);

                    initializeEvents(system, window);

                    editor_frame.style.display = "block";
                    editor_toggle.addEventListener("click", () => { system.toggle(); });

                    res(true);
                } else {
                    res(false);
                }
            });
        }
    });
};
