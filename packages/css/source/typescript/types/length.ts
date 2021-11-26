import wind from "@candlelib/wind";

import CSS_Percentage from "./percentage.js";
import CSS_Number from "./number.js";

export default class CSS_Length extends Number {

    static parse(l) {
        let tx = l.tx,
            pky = l.pk.ty;

        if (l.ty == l.types.num || tx == "-" && pky == l.types.num) {

            let sign = 1;

            if (l.ch == "-") {
                sign = -1;
                tx = l.p.tx;
                l.p.next();
            }
            if (l.p.ty == l.types.id) {
                let id = l.sync().tx;
                l.next();
                return new CSS_Length(parseFloat(tx) * sign, id);
            } else if (l.p.ch == "%") {
                l.sync().next();
                return new CSS_Percentage(parseFloat(tx) * sign);
            } else {
                l.next();
                return new CSS_Number(parseFloat(tx) * sign);
            }
        }
        return null;
    }

    static _verify_(l) {
        if (typeof (l) == "string" && !isNaN(parseInt(l)) && !l.includes("%")) return true;
        return false;
    }

    constructor(v, u = "") {

        if (typeof (v) == "string") {
            let lex = wind(v);
            let val = CSS_Length.parse(lex);
            //@ts-ignore
            if (val) return val;
        }

        if (u) {
            switch (u) {
                //Flex 
                case "fr": return new FlexLength(v);
                //Absolute
                case "px": return new PXLength(v);
                case "mm": return new MMLength(v);
                case "cm": return new CMLength(v);
                case "in": return new INLength(v);
                case "pc": return new PCLength(v);
                case "pt": return new PTLength(v);

                //Relative
                case "ch": return new CHLength(v);
                case "em": return new EMLength(v);
                case "ex": return new EXLength(v);
                case "rem": return new REMLength(v);

                //View Port
                case "vh": return new VHLength(v);
                case "vw": return new VWLength(v);
                case "vmin": return new VMINLength(v);
                case "vmax": return new VMAXLength(v);

                //Deg
                case "deg": return new DEGLength(v);

                //Temporal
                case "s": return new SecondsLength(v);
                case "ms": return new MillisecondsLength(v);

                case "%": return <CSS_Length><any>new CSS_Percentage(v);
            }
        }

        super(v);
    }

    get milliseconds() {
        switch (this.unit) {
            case ("s"):
                return Number(this) * 1000;
        }
        return Number(this);
    }

    toString(radix = 10) {
        return super.toString(radix) + "" + this.unit;
    }

    toJSON(radix = 10) {
        return super.toString(radix) + "" + this.unit;
    }

    get str() {
        return this.toString();
    }

    lerp(to: CSS_Length, t: number) {
        return new CSS_Length(Number(this) + (to - Number(this)) * t, this.unit);
    }

    copy(other: number | CSS_Length = this) {
        return new CSS_Length(other, this.unit);
    }

    set unit(t) { }
    get unit() { return ""; }
}

export class PXLength extends CSS_Length {
    get unit() { return "px"; }
}
export class MMLength extends CSS_Length {
    get unit() { return "mm"; }
}
export class CMLength extends CSS_Length {
    get unit() { return "cm"; }
}
export class INLength extends CSS_Length {
    get unit() { return "in"; }
}
export class PTLength extends CSS_Length {
    get unit() { return "pt"; }
}
export class PCLength extends CSS_Length {
    get unit() { return "pc"; }
}
export class CHLength extends CSS_Length {
    get unit() { return "ch"; }
}
export class EMLength extends CSS_Length {
    get unit() { return "em"; }
}
export class EXLength extends CSS_Length {
    get unit() { return "ex"; }
}
export class REMLength extends CSS_Length {
    get unit() { return "rem"; }
}
export class VHLength extends CSS_Length {
    get unit() { return "vh"; }
}
export class VWLength extends CSS_Length {
    get unit() { return "vw"; }
}
export class VMINLength extends CSS_Length {
    get unit() { return "vmin"; }
}
export class VMAXLength extends CSS_Length {
    get unit() { return "vmax"; }
}
export class DEGLength extends CSS_Length {
    get unit() { return "deg"; }
}
export class SecondsLength extends CSS_Length {
    get unit() { return "s"; }
}
export class MillisecondsLength extends CSS_Length {
    get unit() { return "ms"; }
}

export class FlexLength extends CSS_Length {
    get unit() { return "fr"; }
}