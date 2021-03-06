import { AnimGroup } from './anim_group.js';
import { AnimateObjectArg, AnimationArgs } from "./anim_obj.js";
import { AnimSequence } from './anim_sequence.js';
import { CSS_Bezier, Linear } from './common.js';
import common_methods from "./common_methods.js";
import { AnimSequence as AS, AnimGroup as AG } from './types.js';


export const Animation = ((function anim() {

    var USE_TRANSFORM = false;

    Object.assign(AnimGroup.prototype, common_methods);

    Object.assign(AnimSequence.prototype, common_methods);

    /** END SHARED METHODS * */
    const GlowFunction = function (...args: AnimateObjectArg[]): AS | AG {

        const output = [];

        for (let i = 0; i < args.length; i++) {

            let data = args[i];

            let obj = data.obj;

            if (obj) {

                let props: AnimationArgs = {};

                for (const [name, val] of Object.entries(data)) {

                    if ((new Set(["obj", "match", "delay"])).has(name)) continue;

                    if (!Array.isArray(val))
                        throw new Error(
                            `Expected the type of attribute ${name} to be an Array.`);

                    let i = 0;

                    for (const key of val) {
                        if (typeof obj !== "object")
                            throw new Error(`Expected object type for key ${name}[${i}]`);

                        if (key.tic === undefined)
                            throw new Error(
                                `
Key ${name}[${i}] does not have correct value for "tic" attribute. 
Expected a number type but got instead ${typeof key.tic}.`);

                        if (key.val === undefined)
                            throw new Error(
                                `
Key ${name}[${i}] does not have a valid "val" attribute. `);

                        i++;
                    }

                    props[name] = val;
                }


                output.push(new AnimSequence(obj, props));
            } else
                console.error(`Glow animation was passed an undefined object.`);
        }

        if (args.length > 1)
            return <any>new AnimGroup(output);

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
            ease_in: new CSS_Bezier(0.7, 0.05, 1, 1),
            ease_out: new CSS_Bezier(0.1, 0.0, 0.2, 0.95),
            ease_in_out: new CSS_Bezier(0.42, 0, 0.58, 1),
            overshoot: new CSS_Bezier(5, 5, 0.2, 0.8),
            anticipate: new CSS_Bezier(0.5, -0.1, 0.5, 0.8),
        },

        custom: (x1: number, y1: number, x2: number, y2: number) => new CSS_Bezier(x1, y1, x2, y2)
    });

    return GlowFunction;
})());
