import { Action } from "../types/action.js";
import { ActionType } from "../types/action_type.js";
import { WorkspaceSystem } from "../types/workspace_system.js";
import { ObjectCrate } from "../types/object_crate.js";
import { EditorSelection } from "../types/selection.js";
import { setNumericValue } from "./common.js";
import { sealCSS, updateCSS } from "./update_css.js";

function getContentBox(sel: EditorSelection, sys: WorkspaceSystem) {

    const
        { ele } = sel,

        scale = sys.ui.transform.scale,

        rect = ele.getBoundingClientRect(),
        par_prop = window.getComputedStyle(ele),

        border_l = parseFloat(par_prop.getPropertyValue("border-left")),
        border_r = parseFloat(par_prop.getPropertyValue("border-right")),
        border_t = parseFloat(par_prop.getPropertyValue("border-top")),
        border_b = parseFloat(par_prop.getPropertyValue("border-bottom")),

        padding_l = parseFloat(par_prop.getPropertyValue("padding-left")),
        padding_r = parseFloat(par_prop.getPropertyValue("padding-right")),
        padding_t = parseFloat(par_prop.getPropertyValue("padding-top")),
        padding_b = parseFloat(par_prop.getPropertyValue("padding-bottom")),

        top = rect.top / scale + border_t,
        left = rect.left / scale + border_l,
        width = rect.width / scale - border_l - border_r - padding_l - padding_r,
        height = rect.height / scale - border_t - border_b - padding_t - padding_b;

    return { top, left, width, height };
}

function getNumericValue(sys: WorkspaceSystem, crate: ObjectCrate, type: string): number {
    return getContentBox(crate.sel, sys)[type];
}

export function SETWIDTH(system, crate: ObjectCrate, x: number) {
    setNumericValue(system, crate, "width", x, setNumericValue.parent_width);
}

export function SETHEIGHT(system, crate: ObjectCrate, y: number) {
    setNumericValue(system, crate, "height", y, setNumericValue.parent_height);
}

export const SETDELTAWIDTH = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dx, type: "width" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {

        const start_x = getNumericValue(sys, crate, "width"),

            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETWIDTH(sys, crate, start_x + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};



export const SETDELTAHEIGHT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dy, type: "height" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {

        const start_x = getNumericValue(sys, crate, "height"),

            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETHEIGHT(sys, crate, start_x + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};
