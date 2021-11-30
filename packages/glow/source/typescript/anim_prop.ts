
import { KeyArg } from "./anim_obj.js";
import { Key } from './key.js';
import {
    Animatable,
    TransformType,
    getComputedCSS,
    CSS_Transform2D,
    CSS_Path,
    CSS_Percentage,
    lerpNumber,
    CSS_Length,
    CSS_Color,
    lerpNonNumeric
} from "./common.js";



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
        val_type: any,
        computed_css: CSSStyleDeclaration | null = getComputedCSS(obj)
    ) {

        this.type = val_type;

        this.duration = 0;

        this.end = false;

        this.keys = [];

        this.curr_key = 0;

        this.time_cache = 0;

        this.prop_name = prop_name;

        const k0 = keys[0], k0_val = typeof (k0.val) !== "undefined" ? k0.val : 0;

        this.starting_val = this.getValue(obj, prop_name, type, k0_val, computed_css);

        let p = this.starting_val;
        keys.forEach(k => p = this.addKey(k, p));
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

                if (!value)
                    value = obj.style[prop_name];

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

    addKey(
        key: KeyArg,
        prev: T
    ) {

        const v = key.val ?? 0;

        const easing = key.eas;

        let p1 = -1, p2 = -1, p3 = -1, p4 = -1;

        if (easing) {
            p1 = easing[2];
            p2 = easing[3];
            p3 = easing[4];
            p4 = easing[5];
        }

        this.duration += <number>key.dur;

        const own_key = new Key(
            this.duration,
            (prev) ? prev.from(v) : new this.type(v) ?? new CSS_Length(0, ""),
            p1,
            p2,
            p3,
            p4
        );

        this.keys.push(own_key);

        return own_key.val;
    }

    updateKeys() {
        this.keys.sort((a, b) => a.t_off - b.t_off);

        this.duration = this.keys[this.keys.length - 1].t_off;
    }

    getValueAtTime(tic: number = 0) {

        let key_index = 0;

        let prev = null;

        let key = this.keys[key_index];

        let len = this.keys.length;

        for (let i = 1; i < len; i++) {
            prev = key;
            key = this.keys[i];

            if (tic < key.t_off)
                break;
        }

        if (prev)
            return key.getValueAtTic(tic, prev.t_off, prev.val);

        return key.getValueAtTic(tic, 0, this.starting_val);
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
