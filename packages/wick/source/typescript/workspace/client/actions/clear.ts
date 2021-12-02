import { getCSSCache } from "../cache/css_cache.js";

export function CLEARLEFT(system, component, element, LINKED = false) {
    let cache = getCSSCache(system, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
    if (css.props.left) {
        if (KEEP_UNIQUE) cache.setPropFromString(`left:auto`);
        else css.props.left = "auto";
    }
    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
}
//clear top
export function CLEARTOP(system, component, element, LINKED = false) {
    let cache = getCSSCache(system, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
    if (css.props.top) {
        if (KEEP_UNIQUE) cache.setPropFromString(`top:auto`);
        else css.props.top = "auto";
    }
    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
}
//clear right
export function CLEARIGHT(system, component, element, LINKED = false) {
    let cache = getCSSCache(system, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
    if (css.props.right) {
        if (KEEP_UNIQUE) cache.setPropFromString(`right:auto`);
        else css.props.right = "auto";
    }
    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
}
//clear bottom
export function CLEABOTTOM(system, component, element, LINKED = false) {
    let cache = getCSSCache(system, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
    if (css.props.bottom) {
        if (KEEP_UNIQUE) cache.setPropFromString(`bottom:auto`);
        else css.props.bottom = "auto";
    }
    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
}

//clear margin-top
export function CLEARMARGINTOP(system, component, element, LINKED = false) {
    let cache = getCSSCache(system, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.setPropFromString(`margin-top:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
}
//clear margin-left
export function CLEARMARGINLEFT(system, component, element, LINKED = false) {
    let cache = getCSSCache(system, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
    if (css.props.margin_left) {
        if (KEEP_UNIQUE) cache.setPropFromString(`margin-left:0`);
        else css.props.margin_left = 0;
    }
    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
}

//clear margin-right
export function CLEARMARGINRIGHT(system, component, element, LINKED = false) {
    let cache = getCSSCache(system, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
    if (css.props.margin_right) {
        if (KEEP_UNIQUE) cache.setPropFromString(`margin-right:0`);
        else css.props.margin_right = 0;
    }
    if (!LINKED) prepUIUpdate(system, component, element, "STYLE");
}
//clear margin-bottom
//clear padding-left
//clear padding-right
//clear padding-bottom
//clear padding-top
//clear border-left
//clear border-right
//clear border-bottom
//clear border-top
