
import CB from "@candlelib/css/build/types/cubic_bezier.js";

export interface KeyArg {
    val: any,
    dur?: number,
    eas?: CB;
}

export interface AnimationArgs {
    [key: string]: KeyArg[];
}

export interface BaseAnimateObjectArg {
    /**
     * Any object with properties that can be animated.
     */
    obj: any;

    match?: any;

    delay?: number;
}

export interface AnimateObjectArg extends BaseAnimateObjectArg {

    [key: string]: KeyArg[];
}