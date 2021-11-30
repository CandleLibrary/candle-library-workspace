import { parseProperty } from "@candlelib/css/build/properties/parse_property_value.js";
import { types } from "@candlelib/css/build/properties/property_and_type_definitions.js";
import { AnimationInterpolation } from "./types.js";


export class AnimTransform extends types.transform3D {
    constructor(input: string) {
        super(
            input,
            Infinity,
            Infinity,
            Infinity,
            Infinity,
            Infinity,
            Infinity,
            Infinity,
            Infinity,
            Infinity,
        );
    }
}

export function typeIsArray(t: any | any[]): t is any[] {
    return [
        AnimTransform,
        types.transform2D,
        types.transform3D,
        types.color,
        types.cubic_bezier,
        Float32Array,
        Float64Array,
        Uint32Array,
        Uint16Array,
        Uint8Array,
        Int32Array,
        Int16Array,
        Int8Array
    ].includes(t);
}

export function valueIsArray(t: any | any[]): t is any[] {
    if (
        Array.isArray(t)
        ||
        t instanceof Float32Array
        ||
        t instanceof Float64Array
        ||
        t instanceof Uint32Array
        ||
        t instanceof Uint16Array
        ||
        t instanceof Uint8Array
        ||
        t instanceof Int32Array
        ||
        t instanceof Int16Array
        ||
        t instanceof Int8Array
    )
        return true;

    return false;
}

export type Animatable<T> = {
    copy: () => T;
    from: (v: any) => T;
    lerp: (v: T, i: number) => T;
};

export function getComputedCSS(obj: HTMLElement | any) {
    if (obj instanceof HTMLElement) {
        return window.getComputedStyle(obj);
    }
    else
        return null;
}

export const enum TransformType {
    CSS_STYLE = 0,
    JS_OBJECT = 1,
    SVG = 3
}

export const
    html_element = typeof (HTMLElement) !== "undefined" ? HTMLElement : class { },
    SVG__ = (typeof (SVGElement) !== "undefined") ? SVGElement : function () { },
    CSS_Length = types.length_,
    CSS_Percentage = types.percentage_,
    CSS_Color = types.color,
    CSS_Number = types.number_,
    CSS_Transform2D = types.transform2D,
    CSS_Transform3D = types.transform3D,
    CSS_Path = types.path,
    CSS_Bezier = types.cubic_bezier,
    CSS_String = types.string;

//Inject some special magic into css properties.
export function setType(obj: any): TransformType {

    if (obj instanceof html_element)
        return TransformType.CSS_STYLE;

    if (obj instanceof SVG__)
        return TransformType.SVG;

    return TransformType.JS_OBJECT;
}
export const Linear: AnimationInterpolation = { lerp: (to, t, from = 0) => from + (to - from) * t, getYatX: x => x, toString: () => "linear" };
// Class to linearly interpolate number.


export class lerpNumber extends Number implements Animatable<lerpNumber | number> {
    lerp(to: lerpNumber | number, t: any) { return Number(this) + (Number(to) - Number(this)) * t; }

    from(val: number) { return new lerpNumber(val); }

    copy() { return new lerpNumber(this); }
}

export class lerpNonNumeric {

    v: any;
    constructor(v: any) { this.v = v; }
    lerp(to: any, t: any, from: any) {
        return from.v;
    }
    copy(val: any) { return new lerpNonNumeric(val); }
}

export function getValueType(name: string, value: any): any {

    if (name == "transform")
        return AnimTransform;

    switch (typeof (value)) {

        case "number":
            return lerpNumber;

        case "string":
            const type = parseProperty(name, value, false)?.val?.[0]?.constructor;

            if (!type) {
                if (CSS_Length._verify_(value))
                    return CSS_Length;
                if (CSS_Percentage._verify_(value))
                    return CSS_Percentage;
                if (CSS_Color._verify_(value))
                    return CSS_Color;
            }
            else
                return type;
        //intentional
        case "object":
            return lerpNonNumeric;
    }
}
