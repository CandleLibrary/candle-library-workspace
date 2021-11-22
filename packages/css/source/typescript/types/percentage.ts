import wind, { Lexer } from "@candlelib/wind";

export default class CSS_Percentage extends Number {

    static label_name: string;

    static parse(l: Lexer) {
        let tx = l.tx,
            pky = l.pk.ty;

        if (l.ty == l.types.num || tx == "-" && pky == l.types.num) {
            let mult = 1;

            if (l.ch == "-") {
                mult = -1;
                tx = l.p.tx;
                l.p.next();
            }

            if (l.p.ch == "%") {
                l.sync().next();
                return new CSS_Percentage(parseFloat(tx) * mult);
            }
        }
        return null;
    }

    static _verify_(l) {
        if (typeof (l) == "string" && !isNaN(parseInt(l)) && l.includes("%"))
            return true;
        return false;
    }

    constructor(v) {

        if (typeof (v) == "string") {
            let lex = wind(v);
            let val = CSS_Percentage.parse(lex);
            if (val)
                return val;
        }

        super(v);
    }

    toJSON() {
        return super.toString() + "%";
    }

    toString(radix = 10) {
        return super.toString(radix) + "%";
    }

    get str() {
        return this.toString();
    }

    lerp(to, t) {
        return new CSS_Percentage(Number(this) + (to - Number(this)) * t);
    }

    copy(other) {
        return new CSS_Percentage(other);
    }

    get type() {
        return "%";
    }
}

CSS_Percentage.label_name = "Percentage";

