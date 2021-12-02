import { Action } from "../types/action.js";
import { ActionType } from "../types/action_type.js";
import { FlameSystem } from "../types/flame_system.js";
import { ObjectCrate } from "../types/object_crate.js";
import { getContentBox, noop, setNumericValue } from "./common.js";
import {
    SETDELTAHEIGHT,
    SETDELTAWIDTH
} from "./dimensions.js";
import { sealCSS, updateCSS } from "./update_css.js";


export function SETMARGINTOP(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "margin_top", x, setNumericValue.parent_height);
}

export function SETMARGINBOTTOM(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "margin_bottom", x, setNumericValue.parent_height);
}
export function SETMARGINLEFT(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "margin_left", x, setNumericValue.parent_width);
}
export function SETMARGINRIGHT(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "margin_right", x, setNumericValue.parent_width);
}

export const SETDELTAMARGINTOP = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {

        const
            style = crate.css_cache.computed,
            value = parseFloat(style.marginTop) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;
        SETMARGINTOP(sys, crate, value + delta);
        SETDELTAHEIGHT.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};
export const SETDELTAMARGINBOTTOM = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {

        const
            style = crate.css_cache.computed,
            value = parseFloat(style.marginBottom) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETMARGINBOTTOM(sys, crate, value + delta);
        SETDELTAHEIGHT.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};
export const SETDELTAMARGINRIGHT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {

        const
            style = crate.css_cache.computed,
            value = parseFloat(style.marginRight) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETMARGINRIGHT(sys, crate, value + delta);
        SETDELTAWIDTH.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const SETDELTAMARGINLEFT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const
            style = crate.css_cache.computed,
            value = parseFloat(style.marginLeft) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETMARGINLEFT(sys, crate, value + delta);
        SETDELTAWIDTH.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEMARGINT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setLimits: (sys, crate) => {
        const
            margin_top = parseFloat(crate.css_cache.computed.marginTop) || 0,
            margin_bottom = parseFloat(crate.css_cache.computed.marginBottom) || 0,
            height = getContentBox(crate.sel.ele, sys.editor_window, sys).height,
            min_y = -margin_top,
            max_y = height - margin_top - margin_bottom;

        return { min_y, max_y };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {

        if (ratio.adjusted_delta == 0) return;

        SETDELTAMARGINTOP.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEMARGINB = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setLimits: (sys, crate) => {
        const
            margin_bottom = parseFloat(crate.css_cache.computed.marginBottom) || 0,
            margin_top = parseFloat(crate.css_cache.computed.marginTop) || 0,
            height = getContentBox(crate.sel.ele, sys.editor_window, sys).height,
            min_y = (-height + margin_bottom) + margin_top,
            max_y = margin_bottom;

        return { min_y, max_y };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {
        if (ratio.adjusted_delta == 0) return;
        SETDELTAMARGINBOTTOM.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEMARGINL = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setLimits: (sys, crate) => {
        const
            margin_left = parseFloat(crate.css_cache.computed.marginLeft) || 0,
            width = getContentBox(crate.sel.ele, sys.editor_window, sys).width,
            min_x = -margin_left,
            max_x = width;

        return { min_x, max_x };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {
        if (ratio.adjusted_delta == 0) return;
        SETDELTAMARGINLEFT.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEMARGINR = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setLimits: (sys, crate) => {
        const
            margin_right = parseFloat(crate.css_cache.computed.marginRight) || 0,
            width = getContentBox(crate.sel.ele, sys.editor_window, sys).width,
            min_x = -width,
            max_x = margin_right;

        return { min_x, max_x };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {
        if (ratio.adjusted_delta == 0) return;
        SETDELTAMARGINRIGHT.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};
