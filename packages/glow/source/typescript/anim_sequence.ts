import { AnimationArgs } from "./anim_obj.js";
import { AnimProp } from './props/anim_prop.js';
import { getComputedCSS, getValueType, typeIsArray, setType, TransformType } from './common.js';
import { VectorAnimProp } from './props/vector_anim_prop.js';
import { Animation } from "./anim.js";

// Stores animation data for a group of properties. Defines delay and repeat.

export class AnimSequence {
    duration: number;

    CSS_ANIMATING: boolean;

    props: Map<string, AnimProp<any> | VectorAnimProp<any>>;

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

        for (let name in props) {

            let new_prop = props[name];
            const
                k0 = new_prop[0], k0_type = getValueType(name, k0.val ?? 0);

            if (this.props.has(name)) {
                const prop = <AnimProp<any>>this.props.get(name);
                this.duration = Math.max(prop.duration, this.duration);
            } else {

                if (typeIsArray(k0_type)) {
                    const prop = new VectorAnimProp(this.obj, name, props[name], this.type, k0_type, computed_css);
                    this.props.set(name, prop);
                    this.duration = Math.max(prop.duration, this.duration);
                } else {
                    const prop = new AnimProp(this.obj, name, props[name], this.type, k0_type, computed_css);
                    this.props.set(name, prop);
                    this.duration = Math.max(prop.duration, this.duration);
                }

            }
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
        // For now, just use an arbitrary number
        const
            len = 2, len_m_1 = len - 1;

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
