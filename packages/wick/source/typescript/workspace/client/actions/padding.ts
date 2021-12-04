import { Action } from "../types/action.js";
import { ActionType } from "../types/action_type.js";
import { FlameSystem } from "../types/flame_system.js";
import { ObjectCrate } from "../types/object_crate.js";
import { noop, setNumericValue } from "./common.js";
import {
    SETDELTAHEIGHT,
    SETDELTAWIDTH
} from "./dimensions.js";
import { sealCSS, updateCSS } from "./update_css.js";


export function SETPADDINGTOP(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "padding_top", x, setNumericValue.parent_height);
}

export function SETPADDINGBOTTOM(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "padding_bottom", x, setNumericValue.parent_height);
}
export function SETPADDINGLEFT(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "padding_left", x, setNumericValue.parent_width);
}
export function SETPADDINGRIGHT(sys: FlameSystem, crate: ObjectCrate, x: number) {
    setNumericValue(sys, crate, "padding_right", x, setNumericValue.parent_width);
}

export const SETDELTAPADDINGTOP = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const
            style = crate.css_cache.computed,
            value = parseFloat(style.paddingTop) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;
        SETPADDINGTOP(sys, crate, value + delta);
        SETDELTAHEIGHT.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};
export const SETDELTAPADDINGBOTTOM = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const
            style = crate.css_cache.computed,
            value = parseFloat(style.paddingBottom) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETPADDINGBOTTOM(sys, crate, value + delta);
        SETDELTAHEIGHT.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};
export const SETDELTAPADDINGRIGHT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const
            style = crate.css_cache.computed,
            value = parseFloat(style.paddingRight) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;
        SETPADDINGRIGHT(sys, crate, value + delta);
        SETDELTAWIDTH.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const SETDELTAPADDINGLEFT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const
            style = crate.css_cache.computed,
            value = parseFloat(style.paddingLeft) || 0,
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;
        SETPADDINGLEFT(sys, crate, value + delta);
        SETDELTAWIDTH.updateFN(sys, crate, ratio, true);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEPADDINGT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setLimits: (sys, crate) => {
        const
            padding_top = parseFloat(crate.css_cache.computed.paddingTop) || 0,
            padding_bottom = parseFloat(crate.css_cache.computed.paddingBottom) || 0,
            height = crate.sel.actual_height,
            min_y = -padding_top,
            max_y = height - padding_top - padding_bottom;

        return { min_y, max_y };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {

        if (ratio.adjusted_delta == 0) return;

        SETDELTAPADDINGTOP.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEPADDINGB = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setLimits: (sys, crate) => {
        const
            padding_bottom = parseFloat(crate.css_cache.computed.paddingBottom) || 0,
            padding_top = parseFloat(crate.css_cache.computed.paddingTop) || 0,
            height = crate.sel.actual_height,
            min_y = (-height + padding_bottom) + padding_top,
            max_y = padding_bottom;

        return { min_y, max_y };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {
        if (ratio.adjusted_delta == 0) return;
        SETDELTAPADDINGBOTTOM.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEPADDINGL = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setLimits: (sys, crate) => {

        const
            padding_left = parseFloat(crate.css_cache.computed.paddingLeft) || 0,
            width = crate.sel.actual_width,
            min_x = -padding_left,
            max_x = width;

        return { min_x, max_x };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {
        if (ratio.adjusted_delta == 0) return;
        SETDELTAPADDINGLEFT.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEPADDINGR = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: noop,
    setLimits: (sys, crate) => {

        const
            padding_right = parseFloat(crate.css_cache.computed.paddingRight) || 0,
            width = crate.sel.actual_width,
            min_x = -width,
            max_x = padding_right;

        return { min_x, max_x };
    },
    setRatio: (sys, crate) => ({ max_level: 1 }),
    updateFN: (sys, crate, ratio) => {
        if (ratio.adjusted_delta == 0) return;
        SETDELTAPADDINGRIGHT.updateFN(sys, crate, ratio, false);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};
