import { AnimGroup } from "./anim_group.js";
import { Animation } from "./anim";
export { AnimSequence } from "./anim_sequence";
export { AnimProp } from "./anim_prop.js";
export { VectorAnimProp } from "./vector_anim_prop.js";
import { Key } from "./key.js";
import { Transition, Transitioneer } from "./transitioneer.js";
import { TransformTo } from "./transformto.js";
export { GlowAnimation } from './types.js';

export { Transition, Transitioneer, TransformTo, Animation, AnimGroup, Key };

const Glow = Object.assign(Animation, {
	createTransition: Transitioneer.createTransition,
	transformTo: TransformTo
});

export default Glow;

