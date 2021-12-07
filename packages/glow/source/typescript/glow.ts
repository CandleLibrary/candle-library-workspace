import { AnimGroup } from "./anim_group.js";
import { Animation } from "./anim.js";
export { __AnimSequence__ as AnimSequence } from "./anim_sequence.js";
export { AnimProp } from "./props/anim_prop.js";
export { VectorAnimProp } from "./props/vector_anim_prop.js";
export { Key, NumericKey } from "./key.js";
import { Transition, Transitioneer } from "./transitioneer.js";
import { TransformTo } from "./transformto.js";
export { AnimationArgs, AnimateObjectArg } from './anim_obj.js';
export { GlowAnimation } from './types.js';



export { Transition, Transitioneer, TransformTo, Animation, AnimGroup };

const Glow = Object.assign(Animation, {
	createTransition: Transitioneer.createTransition,
	transformTo: TransformTo
});

//@ts-ignore
globalThis["glow"] = Glow;

export default Glow;

