import {
    CLEARMARGINTOP,
    CLEARMARGINLEFT,
    CLEARLEFT,
    CLEARTOP
} from "./clear.js";
import {
    getCSSCache
} from "../cache/css_cache.js";
import {
    getFirstPositionedAncestor,
    setValue
} from "./common.js";
import {
    SETLEFT,
    SETTOP
} from "./position.js";
import {
    SETMARGINLEFT,
    SETMARGINTOP
} from "./margin.js";

import { CSS_Length, CSS_Percentage } from "@candlelib/css";
let types = {
    length: CSS_Length,
    percentage: CSS_Percentage,

};

/**
 * Actions for converting position and layout to different forms. 
 */
export function TOMARGINLEFT() { }
export function TOMARGINRIGHT() { }
export function TOMARGINLEFTRIGHT() { }
export function TOLEFT() { }
export function TORIGHT() { }
export function TOLEFTRIGHT() { }
export function TOTOP() { }
export function TOTOPBOTTOM() { }

function getNativeDisplay(element) {
    let display = "block";

    switch (element.tagName) {
        case "A":
        case "SPAN":
            display = "inline";
    }

    return display;
}


function setToAbsolute(cache, KEEP_UNIQUE) {
    const css = cache.rules;
    if (KEEP_UNIQUE) {
        if (cache.unique.r.props.position) css.props.position = "absolute";
        else cache.setCSSProp("position:absolute");
    } else {
        if (css.props.position) css.props.position = "absolute";
        else cache.setCSSProp("position:absolute");
    }
}

function setToRelative(cache, KEEP_UNIQUE) {
    const css = cache.rules;
    if (KEEP_UNIQUE) {
        if (cache.unique.r.props.position) css.props.position = "relative";
        else cache.setCSSProp("position:relative");
    } else {
        if (css.props.position) css.props.position = "relative";
        else cache.setCSSProp("position:relative");
    }
}

/**
 * Convert position to ```absolute```
 */
export function TOPOSITIONABSOLUTE(system, component, element, LINKED = false) {
    let cache = getCSSCache(system, element);
    let css = cache.rules;
    let KEEP_UNIQUE = system.flags.KEEP_UNIQUE;
    switch (css.props.position) {
        case "relative":
            /** 
                Need to take margin offset into account when converting to absolute
            */
            let rect = element.getBoundingClientRect();
            let par_prop = system.window.getComputedStyle(element);
            rect = element.getBoundingClientRect();

            let x = rect.x;
            let y = rect.y; //- parseFloat(par_prop["margin-top"]);

            if (css.props.margin) { }

            CLEARMARGINTOP(system, component, element, true);
            CLEARMARGINLEFT(system, component, element, true);

            SETLEFT(system, component, element, x, true);
            SETTOP(system, component, element, y, true);

            break;
        case "absolute":
            /*no op*/
            break;
        case "fixed":
            //add parent offset values to current position to keep it predictably in place. 
            break;
        default:
            //Manually add required data
            break;
    }

    setToAbsolute(cache, KEEP_UNIQUE);

    if (!LINKED) {
        prepUIUpdate(system, component, element, "STYLE");
        element.wick_node.rebuild();
    }
}

/**
 * Convert position to ```relative```
 */
export function TOPOSITIONRELATIVE(system, component, element) {
    const cache = getCSSCache(system, element);
    const css = cache.rules;
    const KEEP_UNIQUE = system.flags.KEEP_UNIQUE;

    switch (css.props.position) {
        case "relative":
            /*no op*/
            break;
        case "absolute":
            //find the last child element that is positioned relative or static
            //get it's offset top and left + margin left and top
            let node = element.previousSibling;
            let offsetX = 0;
            let offsetY = 0;

            let rect = element.getBoundingClientRect();

            //Get Parent display type 
            let par_prop = system.window.getComputedStyle(element.parentElement);
            let ele_css = system.window.getComputedStyle(element);

            let par_out_dis = par_prop.display;
            let ele_in_dis = css.props.display || getNativeDisplay(element);
            const IS_INLINE = ele_in_dis.includes("inline");

            if (ele_in_dis == "inline")//force inline-block positioning
                setValue(system, component, element, "display", "block");

            //PARENT positining
            //TODO handle grid positioning;
            //TODO handle flex positioning;
            //TODO handle inline and inline block positioning;

            //Outer positioning

            //Assuming Normal box positioning. 
            while (node) {
                if (node instanceof HTMLElement) {

                    let rect = node.getBoundingClientRect();
                    let style = system.window.getComputedStyle(node);
                    if ((!style.position || style.position == "relative" || style.position == "static") && style.display !== "none") {

                        if (IS_INLINE)
                            offsetX = node.offsetLeft + parseFloat(style.width) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth) + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.marginLeft) + parseFloat(style.marginRight);

                        offsetY = node.offsetTop + parseFloat(style.height) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.marginTop) + parseFloat(style.marginBottom);

                        break;
                    }
                }
                node = node.previousSibling;
            }

            var rectp = element.parentElement.getBoundingClientRect();

            var innerWidth = rectp.width - ((parseFloat(par_prop.borderLeftWidth) || 0) + (parseFloat(par_prop.paddingLeft) || 0) +
                (parseFloat(par_prop.borderRightWidth) || 0) + (parseFloat(par_prop.paddingRight) || 0));

            if (IS_INLINE && (offsetX + rect.width) >= innerWidth)
                offsetX = 0;

            if (offsetX == 0)
                offsetX += (parseFloat(par_prop.borderLeftWidth) || 0) + (parseFloat(par_prop.paddingLeft) || 0);

            if (offsetY == 0)
                offsetY += (parseFloat(par_prop.borderTopWidth) || 0) + (parseFloat(par_prop.paddingTop) || 0);


            var x1 = rect.x, y1 = rect.y, x = x1 - offsetX, y = y1 - offsetY;

            CLEARLEFT(system, component, element, true);
            CLEARTOP(system, component, element, true);

            SETMARGINLEFT(system, component, element, x, true);
            SETMARGINTOP(system, component, element, y, true);

            setToRelative(cache, KEEP_UNIQUE);

            prepUIUpdate(system, component, element, "STYLE");
            element.wick_node.rebuild();
            rect = element.getBoundingClientRect();
            //enforce Position
            var x2 = rect.x;
            var y2 = rect.y;

            if (x2 != x1)
                SETMARGINLEFT(system, component, element, x - (x2 - x1), true);
            if (y2 != y1)
                SETMARGINTOP(system, component, element, y - (y2 - y1), true);

            break;
        case "fixed":
            //add parent offset values to current position to keep it predictably in place. 
            break;
        default:
            //Manually add required data
            break;
    }

    prepUIUpdate(system, component, element, "STYLE");
    element.wick_node.rebuild();
}


export function CONVERT_TOP(system, component, element, type) {
    let cache = getCSSCache(system, element);
    let position = parseFloat(system.window.getComputedStyle(element).top);

    switch (type) {
        case "%":
            cache.rules.props.top.setValue(new types.percentage(1));
            break;
        case "em":
            cache.rules.props.top.setValue(new types.length(1, "em"));
            break;
        case "vh":
            cache.rules.props.top.setValue(new types.length(1, "vh"));
            break;
        case "vw":
            cache.rules.props.top.setValue(new types.length(1, "vw"));
            break;
        case "vmin":
            cache.rules.props.top.setValue(new types.length(1, "vmin"));
            break;
        case "vmax":
            cache.rules.props.top.setValue(new types.length(1, "vmax"));
            break;
        default:
            cache.rules.props.top.setValue(new types.length(1, 'px'));
            break;
    }
    SETTOP(system, component, element, position);

    prepUIUpdate(system, component, element, "STYLE");
}

export function CONVERT_LEFT(system, component, element, type) {
    let cache = getCSSCache(system, element);
    let position = parseFloat(system.window.getComputedStyle(element).left);

    switch (type) {
        case "%":
            cache.rules.props.left.setValue(new types.percentage(1));
            break;
        case "em":
            cache.rules.props.left.setValue(new types.length(1, "em"));
            break;
        case "vh":
            cache.rules.props.left.setValue(new types.length(1, "vh"));
            break;
        case "vw":
            cache.rules.props.left.setValue(new types.length(1, "vw"));
            break;
        case "vmin":
            cache.rules.props.left.setValue(new types.length(1, "vmin"));
            break;
        case "vmax":
            cache.rules.props.left.setValue(new types.length(1, "vmax"));
            break;
        default:
            cache.rules.props.left.setValue(new types.length(1, 'px'));
            break;
    }
    SETLEFT(system, component, element, position);

    prepUIUpdate(system, component, element, "STYLE");
}

//Converting from unit types
//left
export function LEFTTOPX() { }
export function LEFTTOEM() { }
export function LEFTTOPERCENTAGE() { }
export function LEFTTOVH() { }
export function LEFTTOVW() { }
//right
//top
//bottom
//margin top
//margin bottom
//margin right
//margin left
//border top
//border bottom
//border left
//border right
//padding top
//padding bottom
//padding right
//padding left


export function TOPOSITIONFIXED() { }
export function TOPOSITIONSTICKY() { /* NO OP */ }
export function TOGGLE_UNIT(system, component, element, horizontal, vertical) {
    // Get CSS information on element and update appropriate records
    let cache = getCSSCache(system, element);
    let css = cache.rules;
    let rect = getFirstPositionedAncestor(element).getBoundingClientRect();
    if (horizontal) {
        switch (cache.move_hori_type) {
            case "left right":
            case "left right margin":
                if (css.props.right.value instanceof types.length) {
                    css.props.right.setValue(new types.percentage((css.props.right / rect.width) * 100));
                } else {
                    css.props.right.setValue(new types.length(rect.width * (css.props.right / 100), "px"));
                } /** Intentional fall through **/
            case "left":
                if (css.props.left.value instanceof types.length) {
                    css.props.left.setValue(new types.percentage((css.props.left / rect.width) * 100));
                } else {
                    css.props.left.setValue(new types.length(rect.width * (css.props.left / 100), "px"));
                }
                break;
            case "right":
                if (css.props.right.value instanceof types.length) {
                    css.props.right.setValue(new types.percentage((css.props.right / rect.width) * 100));
                } else {
                    css.props.right.setValue(new types.length(rect.width * (css.props.right / 100), "px"));
                }
                break;
        }
    }
    prepUIUpdate(system, component, element, "STYLE");
}
