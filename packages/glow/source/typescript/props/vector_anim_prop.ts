import { KeyArg } from "../anim_obj.js";
import {
    Animatable, AnimTransform, CSS_Path, getComputedCSS, TransformType, typeIsArray, valueIsArray
} from "../common.js";
import { NumericKey } from '../key.js';


/**
 * Used for animation of vector like objects stored in arrays,
 * 
 * Namely: 
 * - Transform2D
 * - Transform3D
 * - Color
 */

export class VectorAnimProp<T extends Animatable<T> & Array<any>> {

    prop_name: string;
    duration: number;
    end: boolean;
    starting_val: T;
    curr_key: number;
    time_cache: number;
    type: any;
    scalar_keys: NumericKey[][];

    vector_length: number;
    constructor(
        obj: any,
        prop_name: string,
        keys: KeyArg[],
        type: TransformType,
        val_type: any,
        computed_css: CSSStyleDeclaration | null = getComputedCSS(obj)
    ) {
        this.duration = 0;

        this.end = false;

        this.curr_key = 0;

        this.time_cache = 0;

        this.prop_name = prop_name;

        this.scalar_keys = [];

        this.type = val_type;

        if (!typeIsArray(this.type))
            throw new Error("Expecting an array like object for type");

        const k0 = keys[0], k0_val = typeof (k0.val) !== "undefined" ? k0.val : 0;

        this.starting_val = this.getValue(obj, prop_name, type, k0_val, computed_css);

        this.vector_length = this.starting_val.length;

        let isTransform = this.starting_val instanceof AnimTransform;

        for (let i = 0; i < this.vector_length; i++) {
            this.scalar_keys.push([]);
            if (this.starting_val[i] == Infinity) {
                if (
                    isTransform
                    &&
                    (i == 2 || i == 3 || i == 8))
                    this.starting_val[i] = 1;
                else
                    this.starting_val[i] = 0;
            }
        }

        let p = this.starting_val;

        for (const k of keys)
            p = <any>this.addKey(k, p);

        this.updateKeys();
    }

    destroy() {
        this.scalar_keys.length = 0;
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
        this.duration = Math.max(this.duration, <number>key.tic);

        const item = new this.type(key.val);

        if (!valueIsArray(item))
            throw new Error(`Invalid type ${item} submitted to VectorAnimProp`);

        if (item.length > this.vector_length)
            throw new Error(`Expected length ${this.vector_length} got length ${item.length}`);

        let i = 0;

        for (const val of item) {
            if (val < Infinity) {
                const own_key = new NumericKey(
                    <number>key.tic,
                    val,
                    p1,
                    p2,
                    p3,
                    p4
                );
                this.scalar_keys[i].push(own_key);
            }
            i++;
        }

    }

    updateKeys(scalar_index: number = -1) {

        let max_duration = 0;

        if (scalar_index >= 0 && this.scalar_keys[scalar_index]) {
            const sv = this.scalar_keys[scalar_index];
            if (sv.length > 0) {
                sv.sort((a, b) => a.t_off - b.t_off);

                max_duration = Math.max(sv[sv.length - 1].t_off, max_duration);
            }
        } else for (const sv of this.scalar_keys) {
            if (sv.length > 0) {
                sv.sort((a, b) => a.t_off - b.t_off);

                max_duration = Math.max(sv[sv.length - 1].t_off, max_duration);
            }
        }
        this.duration = max_duration;
    }

    getValueAtTime(tic: number = 0) {

        let out_val = this.starting_val.copy();

        let i = 0;
        for (const sv of this.scalar_keys) {
            if (sv.length == 0) {
                out_val[i] = this.starting_val[i];
            } else {

                let key_index = 0;

                let prev = null;

                let key = sv[key_index];

                let len = sv.length;

                for (let i = 1; i < len; i++) {
                    prev = key;
                    key = sv[i];

                    if (tic < key.t_off)
                        break;
                }

                if (prev)
                    out_val[i] = key.getValueAtTic(tic, prev.t_off, prev.val);
                else
                    out_val[i] = key.getValueAtTic(tic, 0, this.starting_val[i]);

            }
            i++;
        }

        return out_val;
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
};
