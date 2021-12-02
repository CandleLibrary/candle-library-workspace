import { RuntimeComponent } from "@candlelib/wick";
import { FlameSystem } from "../types/flame_system.js";
import { ObjectCrate } from "../types/object_crate.js";

export interface RatioMarker {
    /**
     * Metric to track when determining the
     * rate of change.
     */
    type: string;

    original_delta: number,

    original_value: number,

    delta_value: number,

    adjusted_delta: number,

    input_value: number,
    /**
     * The output value of the metric
     * after delta changes applied. 
     * 
     * Linear ratio [i] implies 
     * 
     * output_value = input_value + delta
     */
    output_value: number,

    ratio: number,

    goal_value: number,

    t1: number,
    t2: number,
    t3: number,
    level: number;

    max_level: number;
}

const ratio_markers = (new Array(64)).fill({}, 0, 64).map(c => <RatioMarker>{
    type: "",
    input_value: 0,
    output_value: 0,
    ratio: 0,
    output_value: 0,
    ratio: 1,
    level: 0,
    t1: 0,
    t2: 0,
    t3: 0,
    max_level: 0
});

let pointer = 0;

export function startRatioMeasure(sys: FlameSystem, crate: ObjectCrate, delta: number = 0, measurement_key: string = "", max_level: number = 4): RatioMarker {
    const

        { ele } = crate.sel,

        measure = (measurement_key) ? ele.getBoundingClientRect()[measurement_key] / 1 : 0,

        marker = Object.assign(ratio_markers.pop(), <RatioMarker>{
            type: measurement_key,
            original_delta: delta,
            delta_value: delta,
            adjusted_delta: delta,
            goal_value: delta + measure,
            input_value: measure,
            original_value: measure,
            output_value: 0,
            ratio: 1,
            level: 0,
            t1: 0,
            t2: 0,
            t3: 0,
            max_level
        });

    return marker;
}

export function markRatioMeasure(sys: FlameSystem, crate: ObjectCrate, marker: RatioMarker): RatioMarker {

    const
        { ele } = crate.sel,

        {
            delta_value,
            input_value,
            type,
            original_value,
            goal_value,
            level,
            t1, t2, t3
        } = marker,

        actual_value = ele.getBoundingClientRect()[type] / 1,

        actual_delta = actual_value - original_value,

        err = goal_value - actual_value;



    if (actual_delta == 0) //No change !?!
        return;

    marker.input_value = actual_value;

    if (err !== 0) {

        switch (level) {
            case 0:
                marker.t1 = delta_value / actual_delta;
                marker.adjusted_delta = err * marker.t1;
                break;
            case 1:
                marker.t2 = (delta_value / actual_delta);
                marker.adjusted_delta = err * (t1 + (err * marker.t2));
                break;
            case 2:
                marker.t3 = (delta_value / actual_delta) ** 2;
                marker.adjusted_delta = err * (t1 + (err * (marker.t2 + (marker.t3 * err))));
                break;
            default:
                marker.adjusted_delta = err * (t1 + (err * (marker.t2 + (marker.t3 * err))));
        }
        marker.level++;
    } else
        marker.adjusted_delta = 0;
}

export function clearRatioMeasure(marker: RatioMarker) {
    if (marker)
        ratio_markers.push(marker);
};

export function getRatio(
    system: FlameSystem,
    component: RuntimeComponent,
    element,
    funct,
    original_value,
    delta_value,
    delta_measure,
    ALLOW_NEGATIVE = false,
    NO_ADJUST = false
) { }
