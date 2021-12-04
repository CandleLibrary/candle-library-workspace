import { RatioMarker } from "../actions/ratio.js";
import { CSSCache } from "../cache/css_cache.js";
import { HTMLCache } from "../cache/html_cache.js";
import { Action } from "./action.js";
import { EditorSelection } from "./selection.js";

/**
 * Stores information on object that needs to be updated.
 */
export interface ObjectCrate {
    /**
     * The hash_name of the component that owns
     * the selected element.
     */
    comp: string,
    sel: EditorSelection;
    css_cache: CSSCache;
    html_cache: HTMLCache;

    /**
     * Max Limits for delta values with the start value being [0,0] 
    * and max and min cumulative delta value defined by the limits
    */
    limits: {
        min_x: number;
        max_x: number;
        min_y: number;
        max_y: number;
    };

    data: {
        abs_x?: number;
        abs_y?: number;
        dx?: number;
        dy?: number;
        dz?: number;
        dsx?: number;
        dsy?: number;
        dsz?: number;
        drx?: number;
        dry?: number;
        drz?: number;
        val?: string;
        key?: string;
        data?: string;
        ele_index?: number;
        curr_comp?: string;
        new_comp?: string;
        ref_ele?: HTMLElement;
    };
    action_list: Action[];
    ratio_list: RatioMarker[];
}