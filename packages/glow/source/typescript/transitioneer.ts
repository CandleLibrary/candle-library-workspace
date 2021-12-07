import { Animation } from "./anim.js";
import { TransformTo } from "./transformto.js";
import common_methods from "./common_methods.js";
import { AnimationMethods } from "./types.js";
import { AnimSequence } from './anim_sequence.js';

let obj_map: WeakMap<any, Map<string, AnimSequence>> = new WeakMap();

function overrideExtantSequences(seq: AnimSequence) {
    if (!obj_map.has(seq.obj))
        obj_map.set(seq.obj, new Map);

    const props = obj_map.get(seq.obj);

    if (props) {
        for (const [name] of seq.props) {
            if (true == props.has(name))
                props.get(name)?.props.delete(name);
            props.set(name, seq);
        }
    }
}

function removeSequences(seq: AnimSequence) {

    if (!obj_map.has(seq.obj))
        return;

    const props = obj_map.get(seq.obj);

    if (props) {
        for (const [name] of seq.props) {
            if (props.get(name) == seq)
                props.delete(name);
        }
    }
}

function $in(this: TransitionClass, ...data: any[]) {
    let
        seq: AnimSequence | null = null,
        length = data.length,
        delay = 0;

    if (typeof (data[length - 1]) == "number")
        delay = +data[length - 1], length--;

    for (let i = 0; i < length; i++) {

        let anim_data = data[i];

        if (typeof (anim_data) == "object") {

            if (anim_data.match && this.TT[anim_data.match]) {
                let
                    duration = anim_data.duration,
                    easing = anim_data.easing;
                seq = this.TT[anim_data.match](anim_data.obj, duration, easing);
            } else
                seq = <any>Animation(anim_data);

            //Parse the object and convert into animation props. 
            if (seq) {

                this.in_seq.push(seq);

                this.in_duration = Math.max(this.in_duration, seq.duration);

                if (this.OVERRIDE) overrideExtantSequences(seq);
            }
        }
    }

    this.in_duration = Math.max(this.in_duration, delay);

    return this.in;
}

function $out(this: TransitionClass, ...data: any[]) {
    //Every time an animating component is added to the Animation stack delay and duration need to be calculated.
    //The highest in_delay value will determine how much time is afforded before the animations for the in portion are started.
    let
        length = data.length,
        delay = 0;

    if (typeof (data[length - 1]) == "number") {
        if (typeof (data[length - 2]) == "number") {
            //in_delay = data[length - 2];
            delay = data[length - 1];
            length -= 2;
        } else
            delay = data[length - 1], length--;
    }

    for (let i = 0; i < length; i++) {
        let anim_data = data[i];

        if (typeof (anim_data) == "object") {

            if (anim_data.match) {
                this.TT[anim_data.match] = TransformTo(anim_data.obj);
            } else {
                let seq = <any>Animation(anim_data);

                if (seq) {

                    this.out_seq.push(seq);

                    this.out_duration = Math.max(this.out_duration, seq.duration);

                    if (this.OVERRIDE) overrideExtantSequences(seq);
                }

                this.in_delay = Math.max(this.in_delay, +delay);
            }
        }
    }
}



export class TransitionClass {



    in_duration: number;

    out_duration: number;

    in_delay: number;

    in_seq: AnimSequence[];

    out_seq: AnimSequence[];

    TT: any;

    out: any;

    in: any;

    OVERRIDE: boolean;


    constructor(override = true) {
        this.constructCommon();
        this.in_duration = 0;
        this.out_duration = 0;
        // If set to zero transitions for out and in will happen simultaneously.
        this.in_delay = 0;

        this.in_seq = [];
        this.out_seq = [];

        this.TT = {};
        //Final transition time is given by max(start_len+in_delay, end_len);\

        this.out = $out.bind(this);
        this.out.addEventListener = this.addEventListener.bind(this);
        this.out.removeEventListener = this.removeEventListener.bind(this);
        //@ts-ignore
        this.out.easing = Animation.easing;

        this.in = $in.bind(this);
        this.in.addEventListener = this.addEventListener.bind(this);
        this.in.removeEventListener = this.removeEventListener.bind(this);
        //@ts-ignore
        this.in.easing = Animation.easing;

        Object.defineProperty(this.out, "out_duration", {
            get: () => this.out_duration
        });

        this.OVERRIDE = override;
    }

    constructCommon() { }

    destroyCommon() { }
    addEventListener() { }

    removeEventListener() { }

    destroy() {
        this.in_seq.forEach(removeSequences);
        this.out_seq.forEach(removeSequences);
        this.in_seq.length = 0;
        this.out_seq.length = 0;
        this.out = null;
        this.in = null;
        this.destroyCommon();
    }

    get duration() {
        return Math.max(this.in_duration + this.in_delay, this.out_duration);
    }

    set duration(e) { };

    run(t: number): boolean {

        for (let i = 0; i < this.out_seq.length; i++) {
            let seq = this.out_seq[i];
            if (!seq.run(t) && !seq.FINISHED) {
                seq.issueEvent("stopped");
                seq.FINISHED = true;
            }
        }

        const in_t = t - this.in_delay;

        if (in_t >= 0) {
            for (let i = 0; i < this.in_seq.length; i++) {
                let seq = this.in_seq[i];
                if (!seq.run(in_t) && !seq.FINISHED) {
                    seq.issueEvent("stopped");
                    seq.FINISHED = true;
                }
            }
        }

        return (t <= this.duration && t >= 0);
    }
}

Object.assign(TransitionClass.prototype, common_methods);

export type Transition = TransitionClass & AnimationMethods;

export const Transitioneer = { createTransition: (OVERRIDE: boolean = false): Transition => <Transition>new TransitionClass(OVERRIDE) };
