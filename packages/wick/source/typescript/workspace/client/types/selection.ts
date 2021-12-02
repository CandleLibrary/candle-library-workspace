import { ObservableModel } from '@candlelib/wick';
import { ObservableScheme } from '../../../../../wick/build/types/runtime/observable/observable_prototyped';
import { CSSCache } from '../cache/css_cache';

/**
 * User selected edit element. Coordinate in screen space. 
 */
export interface EditorSelection {
    ele: HTMLElement;

    component: string;

    /**
     * True if the selection represents a selection locked to a single object.
     */
    ACTIVE: boolean;

    /**
     * True if the selection is actually accessible to the user.
     */
    VALID: boolean;

    /**
     * Position of top edge of the selection box in screen coords.
     */
    top: number;

    /**
     * Position of left edge of the selection box in screen coords.
     */
    left: number;

    /**
     * Width of selection box in screen coords.
     */
    width: number;
    /**
     * Height of selection box in screen coords.
     */
    height: number;
    /**
     * Position of top edge of the selection box in element local coords.
     */
    actual_top: number;

    /**
     * Position of left edge of the selection box in element local coords.
     */
    actual_left: number;

    /**
     * Width of selection box in element in element local coords.
     */
    actual_width: number;
    /**
     * Height of selection box in element in element local coords.
     */
    actual_height: number;

    /**
     * Style Information for the selected element
     */
    css: CSSCache;

    //transform information

    rx: number;
    ry: number;
    rz: number;
    sx: number;
    sy: number;
    sz: number;
    px: number;
    py: number;
    pz: number;
    max_x: number;
    max_y: number;
    min_x: number;
    min_y: number;

}
