import { Animation, AnimProp, AnimSequence, AnimGroup, Key } from "./animation.js";
import { Transition, Transitioneer } from "./transitioneer.js";
import { TransformTo } from "./transformto.js";
export { GlowAnimation } from './types.js';

export { Transition, Transitioneer, TransformTo, Animation, AnimProp, AnimSequence, AnimGroup, Key };

const Glow = Object.assign(Animation, {
	createTransition: Transitioneer.createTransition,
	transformTo: TransformTo
});

export default Glow;

