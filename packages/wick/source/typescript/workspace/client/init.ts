import * as css from "@candlelib/css";
import * as ACTIONS from "./actions/action.js";
import { APPLY_ACTION, START_ACTION } from './action_initiators.js';
import { initSystem } from './system.js';
import { Logger } from "@candlelib/log";
import spark from "@candlelib/spark";
import { FlameSystem } from './types/flame_system.js';
import { initializeEvents } from './event.js';
import { getComponentNameFromElement } from './common_functions.js';
import { Context, UserPresets, WickLibrary, WickRTComponent } from '../../index.js';

export const logger = Logger.createLogger("flame-client").activate();

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

    const page_wick: WickLibrary = <any>window["wick"];

    return new Promise((res, rej) => {
        editor_frame.contentWindow.addEventListener("load", async () => {

            const editor_window = editor_frame.contentWindow;
            const editor_wick: WickLibrary = editor_window["wick"];

            const host = document.location.hostname;
            const port = document.location.port;
            const protocol = "wss";
            const uri = `${protocol}://${host}:${port}`;

            const system = await initSystem(uri, page_wick, editor_wick, css, editor_window, editor_frame);

            const session = system.session;

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

            //  system.action_bar.setModel(system.active_selection);

            // initializeEvents(system, window);

            // editor_frame.style.display = "block";

            res(true);
        });
    });
};

function extractIFrameContentAndPlaceIntoHarness(
    system: FlameSystem,
    harness_component: WickRTComponent,
    captive_window: Window,
    page_context: Context
) {
    //Pull out the content of the app and place into a harness component
    const
        //Every new component will be placed in its own harness, which is used to 
        //represent the component's window and document context.
        root_component: WickRTComponent =
            (<Element & { wick_component: WickRTComponent; }>
                captive_window.document.querySelector("[w\\3A c]"))
                .wick_component;

    system.edited_components.components.push({ comp: root_component.name }); //= [];

    const ele = document.querySelector("iframe");
    document.body.removeChild(ele);
    root_component.destructor();

    const harness = new (harness_component.class_with_integrated_css)(
        system.edited_components,
        undefined,
        undefined,
        undefined,
        undefined,
        page_context
    );

    window.document.body.appendChild(harness.ele);
    //root_component.par = harness;
    ////harness.onModelUpdate();
    //
    system.edit_view = harness.ele;
    system.edit_view.style.transformOrigin = "top left";
    //
}
