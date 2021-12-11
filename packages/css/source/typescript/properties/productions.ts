import whind from "@candlelib/wind";
var step = 0;

export function checkDefaults(lx) {
    const tx = lx.tx;
    /* https://drafts.csswg.org/css-cascade/#inherited-property */
    switch (lx.tx) {
        case "initial": //intentional
        case "inherit": //intentional
        case "unset": //intentional
        case "revert": //intentional
            if (!lx.pk.pk.END) // These values should be the only ones present. Failure otherwise.
                return 0; // Default value present among other values. Invalid
            return 1; // Default value present only. Valid
    };
    return 2; // Default value not present. Ignore
}

class JUX { /* Juxtaposition */

    get type() { return "jux"; }

    static step: number;
    id: number;
    r: any[];
    terms: any[];
    HAS_PROP: boolean;
    name: string;
    virtual: boolean;
    REQUIRE_COMMA: boolean;
    constructor() {
        this.id = JUX.step++;
        this.r = [NaN, NaN];
        this.terms = [];
        this.HAS_PROP = false;
        this.name = "";
        this.REQUIRE_COMMA = false;
    }
    mergeValues(existing_v, new_v) {
        if (existing_v)
            if (existing_v.v) {
                if (Array.isArray(existing_v.v))
                    existing_v.v.push(new_v.v);
                else {
                    existing_v.v = [existing_v.v, new_v.v];
                }
            } else
                existing_v.v = new_v.v;
    }

    sp(value, out_val) { /* Set Property */
        if (this.HAS_PROP) {
            if (value)
                if (Array.isArray(value) && value.length === 1 && Array.isArray(value[0]))
                    out_val[0] = value[0];
                else
                    out_val[0] = value;
        }
    }

    isRepeating() {
        return !(isNaN(this.r[0]) && isNaN(this.r[1]));
    }

    parse(data) {
        const prop_data = [];

        this.parseLVL1(data instanceof whind.constructor ? data : whind(data + ""), prop_data);

        return prop_data;
    }

    checkForComma(lx, out_val, temp_val = [], j = 0) {
        if (this.REQUIRE_COMMA) {
            if (out_val) {
                if (j > 0)
                    out_val.push(",", ...temp_val);
                else
                    out_val.push(...temp_val);
            }

            if (lx.ch !== ",")
                return false;



            lx.next();
        } else if (out_val)
            out_val.push(...temp_val);

        return true;
    }

    parseLVL1(lx, out_val = [], ROOT = true) {

        if (typeof (lx) == "string")
            lx = whind(lx);

        let bool = false;

        if (ROOT) {
            switch (checkDefaults(lx)) {
                case 1:
                    this.sp(lx.tx, out_val);
                    return true;
                case 0:
                    return false;
            }
            bool = this.parseLevel2(lx, out_val, this.start, this.end);
        } else
            bool = this.parseLevel2(lx, out_val, this.start, this.end);




        return bool;
    }

    parseLevel2(lx, out_val, start, end) {


        let bool = false,
            top_copy = lx.copy(),
            temp_val = [], j = 0;

        repeat:
        for (j = 0; j < end && !top_copy.END; j++) {

            const
                copy = top_copy.copy(),
                temp = [];

            for (let i = 0, l = this.terms.length; i < l; i++) {

                const term = this.terms[i];

                if (!term.parseLVL1(copy, temp, false)) {
                    if (!term.OPTIONAL) {
                        break repeat;
                    }
                }
            }

            top_copy.sync(copy);

            bool = true;

            if (!this.checkForComma(top_copy, temp_val, temp, j)) {
                j++;
                break;
            }

        }

        if (j < start) {
            return false;
        }

        out_val.push(...temp_val);

        lx.sync(top_copy);

        return bool;
    }

    get start() {
        return isNaN(this.r[0]) ? 1 : this.r[0];
    }
    set start(e) { }

    get end() {
        return isNaN(this.r[1]) ? 1 : this.r[1];
    }
    set end(e) { }

    get OPTIONAL() { return this.r[0] === 0; }
    set OPTIONAL(a) { }
}
JUX.step = 0;

const enum Matched {
    TRUE = 2,
    OPTIONAL = 1,
    FALSE = 0
}
class AND extends JUX {

    get type() { return "and"; }
    parseLevel2(lx, out_val, start, end) {


        const
            PROTO = new Array(this.terms.length),
            l = this.terms.length;

        let bool = false;

        repeat:
        for (let j = 0; j < end && !lx.END; j++) {

            const
                matched: Matched[] = PROTO.fill(0),
                copy = lx.copy(),
                temp_val = [];

            and:
            while (!copy.END) {

                for (let i = 0; i < l; i++) {

                    if (matched[i] === Matched.TRUE) continue;

                    let term = this.terms[i];

                    const temp = [];

                    if (!term.parseLVL1(copy, temp, false)) {
                        if (term.OPTIONAL)
                            matched[i] = Matched.OPTIONAL;
                        else
                            matched[i] = Matched.FALSE;
                    } else {
                        temp_val.push(...temp);
                        matched[i] = Matched.TRUE;
                        continue and;
                    }
                }

                if (matched.reduce((a, v) => a * v, 1) === 0)
                    break repeat;

                break;
            }
            lx.sync(copy);

            bool = true;

            if (!this.checkForComma(copy, out_val, temp_val, j))
                break;
        }

        return bool;
    }
}

class OR extends JUX {
    get type() { return "or"; }
    parseLevel2(lx, out_val, start, end) {
        const
            PROTO = new Array(this.terms.length),
            l = this.terms.length;

        let
            bool = false,
            NO_HIT = true;


        repeat:
        for (let j = 0; j < end && !lx.END; j++) {

            const
                matched: Matched[] = PROTO.fill(0),
                copy = lx.copy(),
                temp_val = [];

            or:
            while (!copy.END) {

                for (let i = 0; i < l; i++) {

                    if (matched[i] === Matched.TRUE) continue;

                    let term = this.terms[i];

                    if (term.parseLVL1(copy, temp_val, false)) {
                        NO_HIT = false;
                        matched[i] = Matched.TRUE;
                        continue or;
                    }
                }

                if (NO_HIT) break repeat;

                break;
            }

            bool = true;

            lx.sync(copy);

            if (!this.checkForComma(copy, out_val, temp_val, j))
                break;

        }

        return bool;
    }
}

OR.step = 0;

class ONE_OF extends JUX {
    get type() { return "one_of"; }
    parseLevel2(lx, out_val, start, end) {

        let BOOL = false;

        for (let j = 0; j < end && !lx.END; j++) {

            let bool = false;

            const
                copy = lx.copy();

            let temp_val = [];

            for (const term of this.terms) {

                temp_val.length = 0;

                if (term.parseLVL1(copy, temp_val, false)) {
                    bool = true;
                    break;
                }
            }

            if (!bool) break;

            lx.sync(copy);

            BOOL = true;

            if (!this.checkForComma(copy, out_val, temp_val, j))
                break;
        }

        return BOOL;
    }
}

ONE_OF.step = 0;

export { JUX, AND, OR, ONE_OF };
