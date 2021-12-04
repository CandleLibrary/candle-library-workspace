import { Lexer } from "@candlelib/wind";
import CSS_Length from "./length.js";

/**
 * @brief An rectangle object
 */
export default class CSS_Rectangle {

    top: CSS_Length;
    right: CSS_Length;
    left: CSS_Length;
    bottom: CSS_Length;

    static parse(lex: Lexer) {
        let t, l, b, r;
        //@ts-ignore
        if (lex.tx == "rect" && lex.next().tx == "(") {

            lex.next();

            t = (lex.text == "auto") ? new CSS_Length(0, "%") : CSS_Length.parse(lex);
            if (t) {
                if (lex.next().tx == ",") lex.next();
                r = (lex.text == "auto") ? new CSS_Length(100, "%") : CSS_Length.parse(lex);
                if (r) {
                    if (lex.next().tx == ",") lex.next();
                    b = (lex.text == "auto") ? new CSS_Length(100, "%") : CSS_Length.parse(lex);
                    if (b) {
                        if (lex.next().tx == ",") lex.next();
                        l = (lex.text == "auto") ? new CSS_Length(0, "%") : CSS_Length.parse(lex);

                        if (lex.text == ")") {
                            lex.next();
                            return new CSS_Rectangle(t, r, b, l);
                        }
                    }
                }
            }
        }

        return null;
    }


    constructor(top: CSS_Length, right: CSS_Length, bottom: CSS_Length, left: CSS_Length) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    from() {
        return new CSS_Rectangle(this.top, this.right, this.bottom, this.left);
    }

    copy() {
        return new CSS_Rectangle(this.top, this.right, this.bottom, this.left);
    }

    toString() {
        return `rect(${[this.top, this.right, this.bottom, this.left].join(",")})`;
    }
}
