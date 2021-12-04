import { getYatXCubic } from './cubic.js';
import { Animatable } from "./common.js";

/**
 * A class that stores the minimum information
 * necessary to transform a single object attribute
 * across a set period of time.
 */
export class Key<T extends Animatable<T>> {
    /**
     * The amount tics that must elapse before this key takes effect
     */
    t_off: number;

    /**
     * A reference to the value object with which output
     * values are calculated
     */
    val: T;

    /** The X axis value of the first bezier curve handle*/
    p1_x;
    /** The Y axis value of the first bezier curve handle*/
    p1_y;
    /** The X axis value of the second bezier curve handle*/
    p2_x;
    /** The Y axis value of the second bezier curve handle*/
    p2_y;

    constructor(
        tic_offset: number,
        val: T,
        p1_x: number = -1,
        p1_y: number = -1,
        p2_x: number = -1,
        p2_y: number = -1
    ) {
        this.val = val;
        this.t_off = tic_offset;
        this.p1_x = p1_x;
        this.p1_y = p1_y;
        this.p2_x = p2_x;
        this.p2_y = p2_y;
    }

    get duration(): number {
        return this.t_off;
    }

    get starting_tic(): number {
        return this.t_off;
    }

    get ending_tic(): number {
        return this.starting_tic + this.t_off;
    }

    isValidKey(tic: number) {
        if (tic > this.ending_tic)
            return tic - this.ending_tic;
        else if (tic < this.starting_tic)
            return tic - this.starting_tic;

        else
            return 0;
    }

    getValueAtTic(
        tic: number,
        prev_off: number,
        start_val: T,
        LAST: boolean
    ): T {
        const len = this.t_off - prev_off;

        const adjust_tic = tic - prev_off;

        if (adjust_tic < len) {
            let x: number = adjust_tic / len;
            let i: number = 0;
            if (this.p2_x < 0) {
                if (this.p1_x < 0) {
                    //Do Linear interpolation
                    i = x;
                } else {
                    //Do Quadratic interpolation
                }
            } else {
                //Do Cubic interpolation
                i = getYatXCubic(x, this.p1_x, this.p1_y, this.p2_x, this.p2_y);
            }
            return start_val.lerp(this.val, i);
        }

        return this.val;
    }
}

export class StepKey extends Key<any> {
    getValueAtTic(
        tic: number,
        prev_off: number,
        start_val: any,
        LAST: boolean
    ): number {
        return LAST ? this.val : start_val;
    }
};


export class NumericKey extends Key<any> {
    getValueAtTic(
        tic: number,
        prev_off: number,
        start_val: number,
        LAST: boolean
    ): number {
        const diff = this.t_off - prev_off;
        const len = diff == 0 ? 1 : diff;

        const adjust_tic = tic - prev_off;

        if (adjust_tic < len) {
            let x: number = adjust_tic / len;
            let i: number = 0;
            if (this.p2_x < 0) {
                if (this.p1_x < 0) {
                    //Do Linear interpolation
                    i = x;
                } else {
                    //Do Quadratic interpolation
                }
            } else {
                //Do Cubic interpolation
                i = getYatXCubic(x, this.p1_x, this.p1_y, this.p2_x, this.p2_y);
            }

            return start_val + (this.val - start_val) * i;
        }

        return this.val;
    }
};