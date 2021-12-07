import spark from '@candlelib/spark';
import { getCSSCache } from './cache/css_cache.js';
import {
    getSelectionFromPoint, invalidateAllSelections, invalidateInactiveSelections, updateSelections
} from "./common_functions.js";
import { DrawObject } from "./editor_model.js";
import { ButtonType, InputHandler } from "./types/input";
import { WorkspaceSystem } from "./types/workspace_system";



const default_handler: InputHandler = <InputHandler>{
    down: (e, sys) => default_handler,
    up(e, sys) {
        const { ui: { event_intercept_frame: event_intercept_ele } } = sys;

        //Check for an active 
        if (event_intercept_ele)
            event_intercept_ele.style.pointerEvents = "none";

        if (e.ctrlKey)
            invalidateInactiveSelections(sys);
        else
            invalidateAllSelections(sys);

        const sel = getSelectionFromPoint(e.x, e.y, sys);

        if (sys.active_selection)
            if (!sel.ACTIVE) {
                sel.ACTIVE = true;
                sys.active_selection.ele = sel.ele;
                sys.active_selection.ACTIVE = true;
                sys.active_selection.css = getCSSCache(sys, sel.ele);
                sys.active_selection.px = sel.px;
                sys.active_selection.py = sel.py;
                sys.active_selection.left = sel.left;
                sys.active_selection.top = sel.top;
                sys.active_selection.width = sel.width;
                sys.active_selection.height = sel.height;
                sys.active_selection.actual_left = sel.actual_left;
                sys.active_selection.actual_top = sel.actual_top;
                sys.active_selection.actual_width = sel.actual_width;
                sys.active_selection.actual_height = sel.actual_height;
                sel.css = sys.active_selection.css;
            }
        if (event_intercept_ele)
            event_intercept_ele.style.pointerEvents = "";

        // Load Handler with data



        return default_handler;
    },
    drag(e, button: ButtonType, sys) {


        if (button == ButtonType.MIDDLE) return drag_handler.drag(e, button, sys);

        return draw_box_handler;
    },
    move(e, sys) {

        const { ui: { event_intercept_frame: event_intercept_ele } } = sys;
        if (event_intercept_ele)
            event_intercept_ele.style.pointerEvents = "none";

        invalidateInactiveSelections(sys);

        getSelectionFromPoint(e.x, e.y, sys);

        updateSelections(sys);
        if (event_intercept_ele)
            event_intercept_ele.style.pointerEvents = "";

        return default_handler;
    },
    wheel(e, sys) {
        const { ui: { transform } } = sys,
            { x, y, deltaY } = e,
            { px, py, scale } = transform,
            old_scale = scale,
            new_scale = Math.max(0.2, Math.min(1, old_scale + -deltaY * 0.0005));

        // transform.scale = new_scale;
        // transform.px -= ((((px - x) * old_scale) - ((px - x) * new_scale))) / (old_scale);
        // transform.py -= ((((py - y) * old_scale) - ((py - y) * new_scale))) / (old_scale);

        const { ui: { event_intercept_frame: event_intercept_ele } } = sys;
        if (event_intercept_ele)
            event_intercept_ele.style.pointerEvents = "none";

        //  invalidateInactiveSelections(sys);

        //getSelectionFromPoint(e.x, e.y, sys);

        updateSelections(sys);
        if (event_intercept_ele)
            event_intercept_ele.style.pointerEvents = "";

        // sys.editor_model.sc++;

        e.stopPropagation();
        e.stopImmediatePropagation();

        spark.queueUpdate({
            scheduledUpdate: () => {
                const d = document.body.style;
                updateSelections(sys);
                updateSelections(sys);
                updateSelections(sys);
            }
        }, 100);

        return default_handler;
    }
};

let draw_box: DrawObject | null = null;

const draw_box_handler: InputHandler = <InputHandler>{
    down(e, sys) { return default_handler; },
    up(e, sys) {
        if (draw_box) {
            sys.editor_model.selection_box = draw_box;
            sys.editor_model.draw_objects.splice(
                sys.editor_model.draw_objects.indexOf(draw_box),
                1
            );
            draw_box = null;
        }

        sys.editor_model.sc++;
        return default_handler;
    },
    drag(e, b: ButtonType, sys) {

        //        sys.editor_model.selection_box = null;

        const { px, py, scale } = sys.ui.transform,
            { cx, cy, dx, dy } = sys;

        if (!draw_box) {
            const len = sys.editor_model.draw_objects.length;

            sys.editor_model.draw_objects.push({
                type: "box",
                px1: (-px + cx) / scale,
                py1: (-py + cy) / scale,
                px2: (-px + cx) / scale,
                py2: (-py + cy) / scale,
            });

            draw_box = sys.editor_model.draw_objects[len];
        } else {
            draw_box.px2 += dx / scale;
            draw_box.py2 += dy / scale;
        }

        updateSelections(sys);

        sys.editor_model.sc++;

        return draw_box_handler;
    },
    move(e, sys) { return default_handler; },
    wheel(e, sys) { return default_handler; }
};

const drag_handler: InputHandler = <InputHandler>{
    down(e, sys) { return default_handler; },
    up(e, sys) { return default_handler; },
    drag(e, b, sys) {
        const { dx, dy, ui: { transform } } = sys;

        transform.px += dx;
        transform.py += dy;

        updateSelections(sys);

        sys.editor_model.sc++;

        return drag_handler;
    },
    move(e, sys) { return default_handler; },
    wheel(e, sys) { return default_handler; }
};

let active_input_handler = default_handler;

function keypressEventResponder(e: KeyboardEvent, sys: WorkspaceSystem): boolean {
    return false;
};

let POINTER_DOWN = false, DRAG_BUTTON = 0;

function contextMenuEventResponder(e: Event, sys: WorkspaceSystem) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
}


function pointerUpEventResponder(e: PointerEvent, sys: WorkspaceSystem) {

    POINTER_DOWN = false;
    DRAG_BUTTON = 0;

    active_input_handler = active_input_handler.up(e, sys);

    e.stopPropagation();
    e.stopImmediatePropagation();
}

function pointerDownEventResponder(e: PointerEvent, sys: WorkspaceSystem) {
    POINTER_DOWN = true;
    DRAG_BUTTON = e.button + 1;

    active_input_handler = active_input_handler.down(e, sys);

    e.stopPropagation();
    e.stopImmediatePropagation();
}

function pointerMoveEventResponder(e: PointerEvent, sys: WorkspaceSystem) {
    sys.dx = e.x - sys.cx;
    sys.cx = e.x;
    sys.dy = e.y - sys.cy;
    sys.cy = e.y;


    if (POINTER_DOWN)
        active_input_handler = active_input_handler.drag(e, <ButtonType><unknown>DRAG_BUTTON, sys);
    else
        active_input_handler = active_input_handler.move(e, sys);
}

function wheelScrollEventResponder(e: WheelEvent, sys: WorkspaceSystem) {

    active_input_handler = active_input_handler.wheel(e, sys);

    e.stopImmediatePropagation();
    e.stopPropagation();
}

function windowResizeEventResponder(e: Event, sys: WorkspaceSystem) {
    sys.editor_model.sc++;
}


export function initializeEvents(
    sys: WorkspaceSystem,
    edited_window: Window,
) {
    const { ui: { event_intercept_frame: event_intercept_ele } } = sys;

    //edited_window.document.addEventListener("pointermove", e => pointerMoveEventResponder(e, sys));
    if (!event_intercept_ele)
        return;
    event_intercept_ele.addEventListener("pointermove", e => {

        sys.editor_iframe.style.pointerEvents = "none";

        try {
            pointerMoveEventResponder(e, sys);
        } finally {
            sys.editor_iframe.style.pointerEvents = "all";
        }

    });
    event_intercept_ele.addEventListener("pointerdown", e => {

        sys.editor_iframe.style.pointerEvents = "none";

        event_intercept_ele.setPointerCapture(e.pointerId);
        try {
            pointerDownEventResponder(e, sys);
        } finally {
            sys.editor_iframe.style.pointerEvents = "all";
        }
    });

    event_intercept_ele.addEventListener("pointerup", e => {

        sys.editor_iframe.style.pointerEvents = "none";
        try {
            pointerUpEventResponder(e, sys);
        } finally {
            event_intercept_ele.releasePointerCapture(e.pointerId);

            sys.editor_iframe.style.pointerEvents = "all";
        }
    });

    window.addEventListener("scroll", e => {
        sys.editor_iframe.style.pointerEvents = "none";
        try {
            wheelScrollEventResponder(e, sys);
        } finally {
            sys.editor_iframe.style.pointerEvents = "all";
        }

    });

    edited_window.addEventListener("resize", e => windowResizeEventResponder(e, sys));

    window.addEventListener("keydown", e => { });

    window.addEventListener("keypress", e => {
        if (keypressEventResponder(e, sys)) {
            e.preventDefault();
        }

    });
}
