import { parseProperty } from "@candlelib/css/build/properties/parse_property_value.js";
import { types } from "@candlelib/css/build/properties/property_and_type_definitions.js";
import { AnimateObjectArg, KeyArg, AnimationArgs } from "./AnimateObject";
import common_methods from "./common_methods.js";
import { getYatXCubic } from './cubic.js';
import { AnimationInterpolation, GlowAnimation } from "./types.js";

type Animatable<T> = {
    copy: (t: any) => T;
    lerp: (v: T, i: number) => T;
};

function getComputedCSS(obj: HTMLElement | any) {
    if (obj instanceof HTMLElement) {
        return window.getComputedStyle(obj);
    } else
        return null;
}

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
     * The amount tics this key takes to complete its
     * transition
     */
    t_dur: number;

    /**
     * The number of tics this key takes to actually start
     * transforming the target value.
     */
    t_del: number;

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
        duration: number,
        delay: number,
        val: T,
        p1_x: number = -1,
        p1_y: number = -1,
        p2_x: number = -1,
        p2_y: number = -1,
    ) {
        this.t_off = tic_offset;
        this.t_dur = duration;
        this.t_del = delay;
        this.p1_x = p1_x;
        this.p1_y = p1_y;
        this.p2_x = p2_x;
        this.p2_y = p2_y;
        this.val = val;
    }

    get duration(): number {
        return this.t_dur + this.t_del;
    }

    get starting_tic(): number {
        return this.t_off;
    }

    get ending_tic(): number {
        return this.starting_tic + this.t_dur + this.t_del;
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
        start_val: T
    ): T {
        const len = this.duration;

        const delay = this.t_del;

        const adjust_tic = tic - this.starting_tic;

        if (adjust_tic < len) {
            if (adjust_tic < delay) {
                return start_val;
            } else {
                let x: number = (adjust_tic - delay) / len;
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
        }

        return this.val;
    }
}

const enum TransformType {
    CSS_STYLE = 0,
    JS_OBJECT = 1,
    SVG = 3
}

const
    html_element = typeof (HTMLElement) !== "undefined" ? HTMLElement : class { },
    SVG__ = (typeof (SVGElement) !== "undefined") ? SVGElement : function () { },
    CSS_Length = types.length_,
    CSS_Percentage = types.percentage_,
    CSS_Color = types.color,
    CSS_Transform2D = types.transform2D,
    CSS_Transform3D = types.transform3D,
    CSS_Path = types.path,
    CSS_Bezier = types.cubic_bezier,
    CSS_String = types.string;
//Inject some special magic into css properties.
function setType(obj: any): TransformType {

    if (obj instanceof html_element)
        return TransformType.CSS_STYLE;

    if (obj instanceof SVG__)
        return TransformType.SVG;

    return TransformType.JS_OBJECT;
}

const Linear: AnimationInterpolation = { lerp: (to, t, from = 0) => from + (to - from) * t, getYatX: x => x, toString: () => "linear" };


// Class to linearly interpolate number.
class lerpNumber extends Number {
    lerp(to: any, t: any, from = 0) { return Number(this) + (to - Number(this)) * t; }
    copy(val: any) { return new lerpNumber(val); }
}

class lerpNonNumeric {

    v: any;
    constructor(v: any) { this.v = v; }
    lerp(to: any, t: any, from: any) {
        return from.v;
    }
    copy(val: any) { return new lerpNonNumeric(val); }
}


// Store animation data for a single property on a single object. Hosts methods that can create CSS based interpolation and regular JS property animations. 
export class AnimProp<T extends Animatable<T>> {
    prop_name: string;
    duration: number;
    end: boolean;
    keys: Key<T>[];
    starting_val: T;
    curr_key: number;
    time_cache: number;
    type: any;

    constructor(
        obj: any,
        prop_name: string,
        keys: KeyArg[],
        type: TransformType,
        computed_css: CSSStyleDeclaration | null = getComputedCSS(obj)
    ) {

        this.duration = 0;

        this.end = false;

        this.keys = [];

        this.curr_key = 0;

        this.time_cache = 0;

        this.prop_name = prop_name;

        const
            IS_ARRAY = Array.isArray(keys),

            k0 = IS_ARRAY ? keys[0] : keys,

            k0_val = typeof (k0.val) !== "undefined" ? k0.val : 0;

        if (prop_name == "transform")
            this.type = CSS_Transform2D;
        else
            this.type = this.getType(prop_name, k0_val);

        this.starting_val = this.getValue(obj, prop_name, type, k0_val, computed_css);

        let p = this.starting_val;

        if (IS_ARRAY)
            keys.forEach(k => p = this.addKey(k, p));
        else
            this.addKey(keys, p);
    }

    destroy() {
        this.keys.length = 0;
        this.type = null;
    }

    getValue(
        obj: any,
        prop_name: string,
        type: TransformType,
        k0_val: any,
        computed_css: CSSStyleDeclaration | null
    ): T {
        switch (type) {
            case TransformType.SVG:
                if (obj instanceof SVGPathElement) {
                    if (prop_name == "d") {
                        this.type = <any>CSS_Path;
                        return new this.type(k0_val);
                    }
                }
                break;
            case TransformType.CSS_STYLE:

                let name = prop_name.replace(/[A-Z]/g, (match) => "-" + match.toLowerCase());

                //Try to get computed value. If it does not exist, then get value from the style attribute.
                let value: string | number = computed_css ? computed_css.getPropertyValue(name) : "";

                if (!value) value = obj.style[prop_name];

                //This object will be used to render the intermediate values.
                if (this.type == CSS_Percentage) {

                    value = parseFloat(<string>value);

                    if (obj.parentElement) {

                        const
                            pcs = window.getComputedStyle(obj.parentElement),
                            pvalue = parseFloat(pcs.getPropertyValue(name)),
                            ratio = value / pvalue;

                        value = (ratio * 100);
                    }
                }
                return new this.type(value);
            default:
                return new this.type(obj[prop_name]);
        }

        return new this.type(0);
    }

    getType(name: string, value: any): any {

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
                } else
                    return type;
            //intentional
            case "object":
                return lerpNonNumeric;
        }
    }

    addKey(
        key: KeyArg,
        prev: T
    ) {

        const v = key.val ?? 0;

        const l = this.keys.length, pkey = this.keys[l - 1];

        const easing = key.eas;

        let p1 = -1, p2 = -1, p3 = -1, p4 = -1;

        if (easing) {
            p1 = easing[2],
                p2 = easing[3],
                p3 = easing[4],
                p4 = easing[5];
        }

        const own_key = new Key(
            this.duration,
            key.dur ?? 0,
            key.del ?? 0,
            (prev) ? prev.copy(v) : new this.type(v) ?? new CSS_Length(0, ""),
            p1,
            p2,
            p3,
            p4,
        );

        this.keys.push(own_key);

        this.duration += own_key.duration;

        return own_key.val;
    }

    updateKeys() {

        let dur = 0;
        this.keys.sort((a, b) => a.t_off - b.t_off);

        for (let k of this.keys) {
            k.t_off = dur;
            dur += k.duration;
        }

        this.duration = dur;
    }

    getValueAtTime(tic: number = 0) {

        let key_index = 0;

        let key = this.keys[key_index];

        let len = this.keys.length;

        let reset = 0;

        let current_val = this.starting_val;

        while ((reset = key.isValidKey(tic)) != 0) {
            if (reset > 0) {
                if (key_index == len - 1)
                    break;
                current_val = key.val;
                key_index++;
            } else {
                if (key_index == 0)
                    break;
                key_index--;
            }
            key = this.keys[key_index];
        }

        return key.getValueAtTic(tic, current_val);
    }

    run(obj: any, prop_name: string, time: number, type: any) {
        this.setProp(obj, prop_name, this.getValueAtTime(time), type);
        return time < this.duration;
    }

    setProp(obj: any, prop_name: string, value: any, type: TransformType) {
        switch (type) {
            case TransformType.CSS_STYLE:
                obj.style[prop_name] = value.toString();
                break;
            case TransformType.SVG:
                obj.setAttribute(prop_name, value.toString());
                break;
            default:
                obj[prop_name] = value;
        }
    }

    unsetProp(obj: any, prop_name: string) {
        this.setProp(obj, prop_name, "", TransformType.CSS_STYLE);
    }

    toCSSString(time = 0, prop_name = "") {
        const value = this.getValueAtTime(time);
        return `${prop_name}:${value.toString()}`;
    }
}


// Stores animation data for a group of properties. Defines delay and repeat.
export class AnimSequence {
    duration: number;

    CSS_ANIMATING: boolean;

    props: Map<string, AnimProp<any>>;

    obj: any;
    type: TransformType;
    style: any;

    constructor(
        obj: any,
        props: AnimationArgs
    ) {

        //@ts-ignore
        this.constructCommon();
        this.obj = null;
        this.type = setType(obj);
        this.CSS_ANIMATING = false;
        this.duration = 0;
        this.props = new Map;

        switch (this.type) {
            case TransformType.CSS_STYLE:
                this.obj = obj;
                break;
            case TransformType.SVG:
            case TransformType.JS_OBJECT:
                this.obj = obj;
                break;
        }

        this.setProps(props, getComputedCSS(obj));
    }

    destroy_props() {
        for (const [, prop] of this.props)
            prop.destroy();
        this.props.clear();
    }

    destroy() {
        this.destroy_props();

        this.obj = null;


        //@ts-ignore
        this.destroyCommon();
    }

    // Removes AnimProps based on object of keys that should be removed from this sequence.
    removeProps(props: { [key: string]: any; }) {
        if (props instanceof AnimSequence)
            props = props.props;

        for (let name in props) {
            if (this.props.has(name)) {
                this.props.get(name)?.destroy();
                this.props.delete(name);
            }
        }
    }

    setProps(
        props: AnimationArgs,
        computed_css: CSSStyleDeclaration | null = getComputedCSS(this.obj)
    ) {

        this.destroy_props();

        for (let name in props)
            if (this.props.has(name)) {
                const prop = <AnimProp<any>>this.props.get(name);
                this.duration = Math.max(prop.duration, this.duration);
            } else {
                const prop = new AnimProp(this.obj, name, props[name], this.type, computed_css);
                this.props.set(name, prop);
                this.duration = Math.max(prop.duration, this.duration);
            }
    }

    run(i: number) {

        for (const [name, prop] of this.props)
            prop.run(this.obj, name, i, this.type);

        return (i <= this.duration && i >= 0);
    }


    toCSSString(keyfram_id: number) {

        const easing = "linear";

        const strings = [`.${keyfram_id}{animation:${keyfram_id} ${this.duration}ms ${Animation.ease_out.toString()}}`, `@keyframes ${keyfram_id}{`];

        // TODO: Use some function to determine the number of steps that should be taken
        // This should reflect the different keyframe variations that can occur between
        // properties.
        // For now, just us an arbitrary number

        const
            len = 2,
            len_m_1 = len - 1;

        for (let i = 0; i < len; i++) {

            strings.push(`${Math.round((i / len_m_1) * 100)}%{`);

            for (let [name, prop] of this.props)
                strings.push(prop
                    .toCSSString(
                        (i / len_m_1) * this.duration,
                        name.replace(/([A-Z])/g, (match, p1) => "-" + match.toLowerCase()
                        )
                    ) + ";");

            strings.push("}");
        }

        strings.push("}");

        return strings.join("\n");
    }

    beginCSSAnimation() {

        if (!this.CSS_ANIMATING) {

            const anim_class = "class" + ((Math.random() * 10000) | 0);

            this.CSS_ANIMATING = !!anim_class;

            this.obj.classList.add(anim_class);

            let style = document.createElement("style");

            style.innerHTML = this.toCSSString(anim_class);

            document.head.appendChild(style);

            this.style = style;

            setTimeout(this.endCSSAnimation.bind(this), this.duration);
        }
    }

    endCSSAnimation() {

        if (this.CSS_ANIMATING) {

            this.obj.classList.remove(this.CSS_ANIMATING);

            this.CSS_ANIMATING = !!"";

            this.style.parentElement.removeChild(this.style);

            this.style = null;
        }
    }
}


export class AnimGroup {
    seq: Array<any>;

    duration: number;

    constructor(sequences: AnimSequence[]) {

        //@ts-ignore
        this.constructCommon();

        this.seq = [];

        this.duration = 0;

        for (const seq of sequences)
            this.add(seq);
    }

    destroy() {
        this.seq.forEach(seq => seq.destroy());

        this.seq.length = 0;

        //@ts-ignore
        this.destroyCommon();
    }

    add(seq: AnimSequence) {

        this.seq.push(seq);

        this.duration = Math.max(this.duration, seq.duration);
    }

    run(t: number) {

        for (let i = 0, l = this.seq.length; i < l; i++) {
            let seq = this.seq[i];
            seq.run(t);
        }
        return (t < this.duration);
    }
}

export const Animation = (function anim() {

    var USE_TRANSFORM = false;

    Object.assign(AnimGroup.prototype, common_methods);

    Object.assign(AnimSequence.prototype, common_methods);

    /** END SHARED METHODS * */

    const GlowFunction = function (...args: AnimateObjectArg[]): GlowAnimation {

        const output = [];

        for (let i = 0; i < args.length; i++) {

            let data = args[i];

            let obj = data.obj;

            if (obj) {

                let props: AnimationArgs = {};

                Object.keys(data)
                    .forEach(
                        k => { if (!({ obj: true, match: true, delay: true }[k])) props[k] = data[k]; }
                    );

                output.push(new AnimSequence(obj, props));
            } else console.error(`Glow animation was passed an undefined object.`);
        }

        if (args.length > 1) return <GlowAnimation><unknown>new AnimGroup(output);

        return <any>output[0];
    };

    Object.assign(GlowFunction, {

        createSequence: GlowFunction,

        createGroup: (...rest: AnimSequence[]) => new AnimGroup(rest),

        set USE_TRANSFORM(v) { USE_TRANSFORM = !!v; },

        get USE_TRANSFORM() { return USE_TRANSFORM; },

        linear: Linear,

        easing: {
            ease: new CSS_Bezier(0.25, 0.1, 0.25, 1),
            ease_in: new CSS_Bezier(0.42, 0, 1, 1),
            ease_out: new CSS_Bezier(0, 0, 0.0, 1),
            ease_in_out: new CSS_Bezier(0.42, 0, 0.58, 1),
            overshoot: new CSS_Bezier(5, 5, 0.2, 0.8),
            anticipate: new CSS_Bezier(0.5, -0.1, 0.5, 0.8),
        },

        custom: (x1: number, y1: number, x2: number, y2: number) => new CSS_Bezier(x1, y1, x2, y2)
    });

    return GlowFunction;
})();
