import { AnimSequence } from './anim_sequence.js';

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


