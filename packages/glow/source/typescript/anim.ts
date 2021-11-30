import { AnimSequence } from './anim_sequence.js';
import { AnimateObjectArg, AnimationArgs } from "./anim_obj.js";
import { CSS_Bezier, Linear } from './common.js';
import common_methods from "./common_methods.js";
import { GlowAnimation } from "./types.js";
import { AnimGroup } from './anim_group.js';


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
                        k => {
                            if (!({ obj: true, match: true, delay: true }[k]))
                                props[k] = data[k];
                        }
                    );

                output.push(new AnimSequence(obj, props));
            } else
                console.error(`Glow animation was passed an undefined object.`);
        }

        if (args.length > 1)
            return <GlowAnimation><unknown>new AnimGroup(output);

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
})();
