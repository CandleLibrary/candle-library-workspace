import { CSS_Length } from '@candlelib/css';
import { getCSSCache } from "../cache/css_cache.js";
import { getFirstPositionedAncestor, prepRebuild } from "./common.js";
import {
    SETDELTABOTTOM, SETDELTALEFT, SETDELTARIGHT, SETDELTATOP
} from "./position.js";


/**
 * Actions provide mechanisms for updating an element, document, and component through user input. 
 */
export function MOVE(system, component, element, dx, dy, IS_COMPONENT = false, LINKED = false) {

    if (IS_COMPONENT) {
        if (!component) debugger;
        component.x += dx;
        component.y += dy;
    } else {

        // Get CSS information on element and update appropriate records
        let cache = getCSSCache(system, element);

        let css = cache.rules;

        if (!css.props.position)
            cache.setPropFromString("position:relative");

        if (css.props.position.value !== "static") {

            switch (cache.move_hori_type) {
                case "left right margin":
                    //in cases of absolute
                    cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB).ratio;
                    cache.valueA = SETDELTALEFT(system, component, element, dx, cache.valueA).ratio;
                    break;
                case "left right":
                    cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB).ratio;
                case "left":
                    cache.valueA = SETDELTALEFT(system, component, element, dx, cache.valueA).ratio;
                    break;
                case "right":
                    cache.valueB = SETDELTARIGHT(system, component, element, -dx, cache.valueB).ratio;
                    break;
            }

            switch (cache.move_vert_type) {
                case "top bottom":
                    cache.valueC = SETDELTABOTTOM(system, component, element, -dy, cache.valueC).ratio;
                case "top":
                    cache.valueD = SETDELTATOP(system, component, element, dy, cache.valueD).ratio;
                    break;
                case "bottom":
                    cache.valueC = SETDELTABOTTOM(system, component, element, -dy, cache.valueC).ratio;
                    break;
            }
        }

        prepRebuild(system, component, element, LINKED);
    }
}

export function CENTER(system, component, element, HORIZONTAL = true, VERTICAL = true, LINKED = false) {
    // Get CSS information on element and update appropriate records
    let cache = getCSSCache(system, element);
    let css = cache.rules;

    let ancestor = getFirstPositionedAncestor(element);

    let ancestor_box = ancestor.getBoundingClientRect();

    let own_box = element.getBoundingClientRect();

    let w = own_box.width;
    let diff = (ancestor_box.width - w) / 2;

    switch (cache.move_hori_type) {
        case "left right":
            //get the width of the parent element
            css.props.left = new CSS_Length(diff, "px");
            css.props.right = new CSS_Length(diff, "px");
            cache.setPropFromString(`margin-left:auto; margin-right:auto`);
            break;
        case "left":
            cache.setPropFromString(`margin-left:auto; margin-right:auto;left:0px;right:0px`);
            break;
        case "right":
            break;
        case "margin-left":
            break;
        case "margin-left margin-right":
            break;
        case "margin":
            break;
    }

    /*
    switch (cache.move_vert_type) {
        case "top bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC).ratio;
        case "top":
            cache.valueD = setDeltaTop(element, dy, css, cache.valueD);
            break;
        case "bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
            break;
    }
    */

    prepRebuild(system, component, element, LINKED);
}
