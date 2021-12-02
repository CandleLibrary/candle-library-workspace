
import CB from "@candlelib/css/build/types/cubic_bezier.js";

export interface KeyArg {

    /**
     * The value of the target property
     * at this keyframe.
     */
    val: any,

    /**
     * The animation `tic` position at which
     * the value is completely transitioned
     * to the target val set by this keyframe.
     */
    tic?: number,

    /**
     * A Bezier curve defining the easing that
     * should be used to transition from the last
     * value to the one set by the this keyframe.
     */
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

export interface AnimateObjectArgProps {

    [key: string]: KeyArg[];
}

export type AnimateObjectArg = BaseAnimateObjectArg & AnimateObjectArgProps;