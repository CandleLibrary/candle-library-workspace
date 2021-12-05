import { CSSFlags } from "../cache/css_cache.js";
import { Action } from "../types/action.js";
import { ActionType } from "../types/action_type.js";
import { WorkspaceSystem } from "../types/workspace_system.js";
import { ObjectCrate } from "../types/object_crate.js";
import { EditorSelection } from "../types/selection.js";
import {
    setNumericValue
} from "./common.js";
import {
    SETDELTAHEIGHT, SETDELTAWIDTH
} from "./dimensions.js";
import { SETDELTAMARGINLEFT, SETDELTAMARGINRIGHT, SETDELTAMARGINTOP } from "./margin.js";
import { sealCSS, updateCSS } from "./update_css.js";


/***************************************************************************************/
/********************************** POSITION SUB ACTIONS *************************************/
/***************************************************************************************/

export function SETLEFT(sys: WorkspaceSystem, crate: ObjectCrate, val: number = 0) {

    const { css_cache, data: { dx } } = crate, pos = val || dx;

    if (css_cache.box_model_flags & 1)
        setNumericValue(sys, crate, "left", pos, setNumericValue.parent_width, true);
    else
        setNumericValue(sys, crate, "left", pos, setNumericValue.positioned_ancestor_width, true);

    css_cache.applyScratchRule(sys, 0);
}

export function SETRIGHT(sys: WorkspaceSystem, crate: ObjectCrate, val: number = 0) {

    const { css_cache, data: { dx } } = crate, pos = val || dx;

    if (css_cache.box_model_flags & 1)
        setNumericValue(sys, crate, "right", pos, setNumericValue.parent_width, true);
    else
        setNumericValue(sys, crate, "right", pos, setNumericValue.positioned_ancestor_width, true);

    css_cache.applyScratchRule(sys, 0);
}

export function SETTOP(sys: WorkspaceSystem, crate: ObjectCrate, val: number = 0) {

    const { css_cache, data: { dy } } = crate, pos = val || dy;

    if (css_cache.box_model_flags & 1)
        setNumericValue(sys, crate, "top", pos, setNumericValue.parent_height, true);
    else
        setNumericValue(sys, crate, "top", pos, setNumericValue.positioned_ancestor_height, true);

    css_cache.applyScratchRule(sys, 0);
}

export function SETBOTTOM(sys: WorkspaceSystem, crate: ObjectCrate, val: number = 0) {

    const { css_cache, data: { dy } } = crate, pos = val || dy;

    if (css_cache.box_model_flags & 1)
        setNumericValue(sys, crate, "bottom", pos, setNumericValue.parent_height, true);
    else
        setNumericValue(sys, crate, "bottom", pos, setNumericValue.positioned_ancestor_height, true);

    css_cache.applyScratchRule(sys, 0);
}

/***************************************************************************************/
/********************************** DELTA SUB ACTIONS *************************************/
/***************************************************************************************/

function getComputedStyle(sel: EditorSelection) {
    return window.getComputedStyle(sel.ele);
}

export const SETDELTALEFT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dx, type: "left" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const { ele } = crate.sel,
            value = parseFloat(getComputedStyle(crate.sel).left),
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETLEFT(sys, crate, value + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const SETDELTARIGHT = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dx, type: "right" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const
            value = parseFloat(getComputedStyle(crate.sel).right),
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        console.log(delta, INVERSE, value);

        SETRIGHT(sys, crate, value + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const SETDELTATOP = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dy, type: "top" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const { ele } = crate.sel,
            value = parseFloat(getComputedStyle(crate.sel).top),
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;

        SETTOP(sys, crate, value + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};


export const SETDELTABOTTOM = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: (sys, crate) => { },
    setRatio: (sys, crate) => ({ delta: crate.data.dy, type: "bottom" }),
    updateFN: (sys, crate, ratio, INVERSE = false) => {
        const { ele } = crate.sel,
            value = parseFloat(getComputedStyle(crate.sel).bottom),
            delta = INVERSE ? -ratio.adjusted_delta : ratio.adjusted_delta;


        SETBOTTOM(sys, crate, value + delta);
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

/***************************************************************************************/
/********************************** RESIZE ACTIONS *************************************/
/***************************************************************************************/

//Horizontal
const LEFT_WIDTH_POSITIONING = CSSFlags.LEFT_VAL | CSSFlags.WIDTH_VAL;
//margin should not be set. Convert margin contribution to left right values if necessary. Needs absolute positioning
const LEFT_RIGHT_POSITIONING = CSSFlags.LEFT_VAL | CSSFlags.RIGHT_VAL;
const WIDTH_MARGIN_POSITIONING = CSSFlags.WIDTH_VAL | CSSFlags.MARGIN_L_VAL | CSSFlags.MARGIN_R_VAL; //width cannot be set
const WIDTH_AUTO_MARGIN_POSITIONING = CSSFlags.WIDTH_VAL | CSSFlags.MARGIN_L_VAL | CSSFlags.MARGIN_R_VAL; //width cannot be set
const HORIZONTAL_MARGIN_FLAGS = CSSFlags.MARGIN_L_VAL | CSSFlags.MARGIN_R_VAL;

//Vertical
const TOP_HEIGHT_POSITIONING = CSSFlags.TOP_VAL | CSSFlags.HEIGHT_VAL;
//margin should not be set. Convert margin contribution to left right values if necessary. Needs absolute positioning
const TOP_BOTTOM_POSITIONING = CSSFlags.TOP_VAL | CSSFlags.BOTTOM_VAL;
const HEIGHT_MARGIN_POSITIONING = CSSFlags.HEIGHT_VAL | CSSFlags.MARGIN_T_VAL | CSSFlags.MARGIN_B_VAL; //width cannot be set
const HEIGHT_AUTO_MARGIN_POSITIONING = CSSFlags.HEIGHT_VAL | CSSFlags.MARGIN_T_VAL | CSSFlags.MARGIN_B_VAL; //width cannot be set
const VERTICAL_MARGIN_FLAGS = CSSFlags.MARGIN_T_VAL | CSSFlags.MARGIN_B_VAL;

function setHorizontalBoxModel(sys: WorkspaceSystem, crate: ObjectCrate) {

    const
        { css_cache } = crate,
        v = css_cache.getHorizontalBoxFlag();

    // If nothing is set then we need to define the 
    // position and width in units that user desires
    //
    // It could either be relative or fixed units. [px] is the
    // preferred default.

    if ((v & CSSFlags.HORIZONTAL_BOX_MASK) == 0) {
        // Nothing is set within the local component information. 
        // We are starting from scratch with this one.

        // Based on user and display factors, we'll go with on of the following:
        //
        // left + width positioning system if absolutely or relatively positioned by default
        //
        // left + right positioning system if absolute positioned if user wants this type - and parent width is less than some maximum
        // 
        // width + auto-margin if relative positioned and parent width is set and user desires a centered view
        //
        // width + set-margin if relative positioned and parent width is set and user desires this type

        if (css_cache.box_model_flags & CSSFlags.ABSOLUTE) {
            //temp - starting with top + width position

            css_cache.box_model_flags |= LEFT_WIDTH_POSITIONING;
            //Elevate the computed properties 
            css_cache.getProp("width");
            css_cache.getProp("left");
            css_cache.unsetProp("right");

            return;
            css_cache.box_model_flags |= LEFT_RIGHT_POSITIONING;
            css_cache.setProp(css_cache.getProp("left"));
            css_cache.setProp(css_cache.getProp("right"));
            debugger;

            css_cache.unsetProp("width", true);
            css_cache.unsetProp("margin_left");
            css_cache.unsetProp("margin_right");
            return;
        } else {
            css_cache.getProp("width");
            css_cache.getProp("margin_left");
            css_cache.getProp("margin_right");
            return;
        }

        css_cache.box_model_flags |= LEFT_WIDTH_POSITIONING;

        //Elevate the computed properties 
        css_cache.getProp("width");
        css_cache.getProp("left");
        css_cache.unsetProp("right");

        css_cache.box_model_flags |= LEFT_RIGHT_POSITIONING;

        // And all that's left is for the update mechanism to adjust the 
        // values based on type unit the user wants
    } else {
        //Prepare new props based on the user needs, and the current positioning profile

        if (css_cache.box_model_flags & CSSFlags.ABSOLUTE) {

        } else {

        }
    }
}

//same as above, just vertical
function setVerticalBoxModel(sys: WorkspaceSystem, crate: ObjectCrate) {

    const
        { css_cache } = crate,
        v = css_cache.getVerticalBoxFlag();

    // If nothing is set then we need to define the 
    // position and width in units that user desires
    //
    // It could either be relative or fixed units. [px] is the
    // preferred default.

    if ((v & CSSFlags.VERTICAL_BOX_MASK) == 0) {

        if (css_cache.box_model_flags & CSSFlags.ABSOLUTE) {
            //temp - starting with top + width position

            css_cache.box_model_flags |= TOP_HEIGHT_POSITIONING;
            //Elevate the computed properties 
            css_cache.getProp("height");
            css_cache.getProp("top");
            css_cache.unsetProp("bottom");

            return;
            css_cache.box_model_flags |= TOP_BOTTOM_POSITIONING;
            css_cache.setProp(css_cache.getProp("top"));
            css_cache.setProp(css_cache.getProp("bottom"));
            css_cache.unsetProp("height", true);
            css_cache.unsetProp("margin_top");
            css_cache.unsetProp("margin_bottom");
            return;
        } else {
            css_cache.getProp("height");
            css_cache.getProp("margin_top");
            css_cache.getProp("margin_bottom");
            return;
        }

        css_cache.box_model_flags |= TOP_HEIGHT_POSITIONING;

        //Elevate the computed properties 
        css_cache.getProp("height");
        css_cache.getProp("top");
        css_cache.unsetProp("bottom");

        css_cache.box_model_flags |= TOP_BOTTOM_POSITIONING;

    } else {

        if (css_cache.box_model_flags & CSSFlags.ABSOLUTE) {

        } else {

        }
    }
}
export const RESIZEL = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: setHorizontalBoxModel,
    setLimits: (sys, crate) => {
        const
            width = crate.sel.actual_width,
            max_x = width - 2;
        return { max_x };
    },
    setRatio: (sys, crate) => ({ delta: crate.data.dx, type: "left" }),
    updateFN: (sys, crate, ratio) => {

        const { css_cache: { box_model_flags } } = crate;

        if (box_model_flags & CSSFlags.ABSOLUTE) {
            if (
                (box_model_flags & LEFT_RIGHT_POSITIONING) == LEFT_RIGHT_POSITIONING
                && (box_model_flags & HORIZONTAL_MARGIN_FLAGS) == 0
            ) {
                SETDELTALEFT.updateFN(sys, crate, ratio, false);
            } else {
                SETDELTALEFT.updateFN(sys, crate, ratio, false);
                SETDELTAWIDTH.updateFN(sys, crate, ratio, true);
            }

        } else /*relative positioned */ {
            if (
                (box_model_flags & HORIZONTAL_MARGIN_FLAGS) == HORIZONTAL_MARGIN_FLAGS
                && (box_model_flags & CSSFlags.WIDTH_VAL) == CSSFlags.WIDTH_VAL
                && (box_model_flags & CSSFlags.LEFT_VAL) == 0
            ) {
                SETDELTAMARGINLEFT.updateFN(sys, crate, ratio, false);
            } else {
                SETDELTALEFT.updateFN(sys, crate, ratio, false);
                SETDELTAWIDTH.updateFN(sys, crate, ratio, false);
            }
        }
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZER = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: setHorizontalBoxModel,
    setRatio: (sys, crate) => ({ delta: crate.data.dx, type: "right" }),
    setLimits: (sys, crate) => {
        const
            width = crate.sel.actual_width,
            min_x = 2 - width;
        return { min_x };
    },
    updateFN: (sys, crate, ratio) => {

        const { css_cache: { box_model_flags } } = crate;

        if (box_model_flags & CSSFlags.ABSOLUTE) {
            if (
                (box_model_flags & LEFT_RIGHT_POSITIONING) == LEFT_RIGHT_POSITIONING
                && (box_model_flags & HORIZONTAL_MARGIN_FLAGS) == 0
            ) {
                SETDELTARIGHT.updateFN(sys, crate, ratio, false);
            } else
                SETDELTAWIDTH.updateFN(sys, crate, ratio, true);

        } else /*relative positioned */ {
            if (
                (box_model_flags & HORIZONTAL_MARGIN_FLAGS) == HORIZONTAL_MARGIN_FLAGS
                && (box_model_flags & CSSFlags.WIDTH_VAL) == 0
                && (box_model_flags & CSSFlags.LEFT_VAL) == 0
            ) {
                SETDELTAMARGINRIGHT.updateFN(sys, crate, ratio, false);
            } else
                SETDELTAWIDTH.updateFN(sys, crate, ratio, false);
        }
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};


export const RESIZET = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: setVerticalBoxModel,
    setLimits: (sys, crate) => {
        const
            height = crate.sel.actual_height,
            max_y = height - 2;
        return { max_y };
    },
    setRatio: (sys, crate) => ({ delta: crate.data.dy, type: "top" }),
    updateFN: (sys, crate, ratio) => {

        const { css_cache: { box_model_flags } } = crate;

        if (box_model_flags & CSSFlags.ABSOLUTE) {
            if (
                (box_model_flags & TOP_BOTTOM_POSITIONING) == TOP_BOTTOM_POSITIONING
                && (box_model_flags & VERTICAL_MARGIN_FLAGS) == 0
            ) {
                SETDELTATOP.updateFN(sys, crate, ratio, false);
            } else {
                SETDELTATOP.updateFN(sys, crate, ratio, false);
                SETDELTAHEIGHT.updateFN(sys, crate, ratio, true);
            }

        } else /*relative positioned */ {
            if (
                (box_model_flags & VERTICAL_MARGIN_FLAGS) == VERTICAL_MARGIN_FLAGS
                && (box_model_flags & CSSFlags.HEIGHT_VAL) == CSSFlags.HEIGHT_VAL
                && (box_model_flags & CSSFlags.TOP_VAL) == 0
            ) {
                SETDELTAMARGINTOP.updateFN(sys, crate, ratio, false);
            } else {
                SETDELTATOP.updateFN(sys, crate, ratio, false);
                SETDELTAHEIGHT.updateFN(sys, crate, ratio, false);
            }
        }
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};

export const RESIZEB = <Action>{
    type: ActionType.SET_CSS,
    priority: 0,
    sealFN: sealCSS,
    initFN: setVerticalBoxModel,
    setLimits: (sys, crate) => {
        const
            height = crate.sel.actual_height,
            min_y = 2 - height;
        return { min_y };
    },
    setRatio: (sys, crate) => ({ delta: crate.data.dy, type: "bottom" }),
    updateFN: (sys, crate, ratio) => {

        const { css_cache: { box_model_flags } } = crate;

        if (box_model_flags & CSSFlags.ABSOLUTE) {
            if (
                (box_model_flags & TOP_BOTTOM_POSITIONING) == TOP_BOTTOM_POSITIONING
                && (box_model_flags & VERTICAL_MARGIN_FLAGS) == 0
            ) {
                SETDELTABOTTOM.updateFN(sys, crate, ratio, false);
            } else
                SETDELTAHEIGHT.updateFN(sys, crate, ratio, true);

        } else /*relative positioned */ {
            if (
                (box_model_flags & VERTICAL_MARGIN_FLAGS) == VERTICAL_MARGIN_FLAGS
                && (box_model_flags & CSSFlags.HEIGHT_VAL) == 0
                && (box_model_flags & CSSFlags.TOP_VAL) == 0
            ) {
                SETDELTABOTTOM.updateFN(sys, crate, ratio, false);
            } else
                SETDELTAHEIGHT.updateFN(sys, crate, ratio, false);
        }
    },
    historyProgress: updateCSS,
    historyRegress: updateCSS
};


