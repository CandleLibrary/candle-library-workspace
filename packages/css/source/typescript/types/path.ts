import wind from "@candlelib/wind";
/**
 * @brief Path Info
 * @details Path syntax information for reference
 * 
 * MoveTo: M, m
 * LineTo: L, l, H, h, V, v
 * Cubic Bézier Curve: C, c, S, s
 * Quadratic Bézier Curve: Q, q, T, t
 * Elliptical Arc Curve: A, a
 * ClosePath: Z, z
 * 
 * Capital symbols represent absolute positioning, lowercase is relative
 */
const PathSym = {
    M: 0,
    m: 1,
    L: 2,
    l: 3,
    h: 4,
    H: 5,
    V: 6,
    v: 7,
    C: 8,
    c: 9,
    S: 10,
    s: 11,
    Q: 12,
    q: 13,
    T: 14,
    t: 15,
    A: 16,
    a: 17,
    Z: 18,
    z: 19,
    pairs: 20
};

function getSignedNumber(lex) {
    let mult = 1,
        tx = lex.tx;
    if (tx == "-") {
        mult = -1;
        tx = lex.n.tx;
    }
    lex.next();
    return parseFloat(tx) * mult;
}

function getNumberPair(lex, array) {
    let x = getSignedNumber(lex);
    if (lex.ch == ',') lex.next();
    let y = getSignedNumber(lex);
    array.push(x, y);
}

function parseNumberPairs(lex, array) {
    while ((lex.ty == lex.types.num || lex.ch == "-") && !lex.END) {
        array.push(PathSym.pairs);
        getNumberPair(lex, array);
    }
}
/**
 * @brief An array store of path data in numerical form
 */
export default class CSS_Path extends Array {
    static FromString(string, array) {
        let lex = wind(string);
        lex.USE_EXTENDED_NUMBER_TYPES = true;
        while (!lex.END) {
            let relative = false,
                x = 0,
                y = 0;
            switch (lex.ch) {
                //Move to
                case "m":
                    relative = true;
                case "M":
                    lex.next(); //
                    array.push((relative) ? PathSym.m : PathSym.M);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                //Line to
                case "h":
                    relative = true;
                case "H":
                    lex.next();
                    x = getSignedNumber(lex);
                    array.push((relative) ? PathSym.h : PathSym.H, x);
                    continue;
                case "v":
                    relative = true;
                case "V":
                    lex.next();
                    y = getSignedNumber(lex);
                    array.push((relative) ? PathSym.v : PathSym.V, y);
                    continue;
                case "l":
                    relative = true;
                case "L":
                    lex.next();
                    array.push((relative) ? PathSym.l : PathSym.L);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                //Cubic Curve
                case "c":
                    relative = true;
                case "C":
                    lex.next();
                    array.push((relative) ? PathSym.c : PathSym.C);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                case "s":
                    relative = true;
                case "S":
                    lex.next();
                    array.push((relative) ? PathSym.s : PathSym.S);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                //Quadratic Curve0
                case "q":
                    relative = true;
                case "Q":
                    lex.next();
                    array.push((relative) ? PathSym.q : PathSym.Q);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                case "t":
                    relative = true;
                case "T":
                    lex.next();
                    array.push((relative) ? PathSym.t : PathSym.T);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                //Elliptical Arc
                //Close path:
                case "z":
                    relative = true;
                case "Z":
                    array.push((relative) ? PathSym.z : PathSym.Z);
            }
            lex.next();
        }
    }

    static ToString(array) {
        let string = [], l = array.length, i = 0;
        while (i < l) {
            switch (array[i++]) {
                case PathSym.M:
                    string.push("M", array[i++], array[i++]);
                    break;
                case PathSym.m:
                    string.push("m", array[i++], array[i++]);
                    break;
                case PathSym.L:
                    string.push("L", array[i++], array[i++]);
                    break;
                case PathSym.l:
                    string.push("l", array[i++], array[i++]);
                    break;
                case PathSym.h:
                    string.push("h", array[i++]);
                    break;
                case PathSym.H:
                    string.push("H", array[i++]);
                    break;
                case PathSym.V:
                    string.push("V", array[i++]);
                    break;
                case PathSym.v:
                    string.push("v", array[i++]);
                    break;
                case PathSym.C:
                    string.push("C", array[i++], array[i++], array[i++], array[i++], array[i++], array[i++]);
                    break;
                case PathSym.c:
                    string.push("c", array[i++], array[i++], array[i++], array[i++], array[i++], array[i++]);
                    break;
                case PathSym.S:
                    string.push("S", array[i++], array[i++], array[i++], array[i++]);
                    break;
                case PathSym.s:
                    string.push("s", array[i++], array[i++], array[i++], array[i++]);
                    break;
                case PathSym.Q:
                    string.push("Q", array[i++], array[i++], array[i++], array[i++]);
                    break;
                case PathSym.q:
                    string.push("q", array[i++], array[i++], array[i++], array[i++]);
                    break;
                case PathSym.T:
                    string.push("T", array[i++], array[i++]);
                    break;
                case PathSym.t:
                    string.push("t", array[i++], array[i++]);
                    break;
                case PathSym.Z:
                    string.push("Z");
                    break;
                case PathSym.z:
                    string.push("z");
                    break;
                case PathSym.pairs:
                    string.push(array[i++], array[i++]);
                    break;
                case PathSym.A:
                case PathSym.a:
                default:
                    i++;
            }
        }

        return string.join(" ");
    }


    constructor(data) {
        super();

        if (typeof (data) == "string") {
            CSS_Path.FromString(data, this);
        } else if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                this.push(parseFloat(data[i]));
            }
        }
    }

    copy(value) {
        return new CSS_Path(value);
    }

    toString() {
        return CSS_Path.ToString(this);
    }
    /**
     * 
     * @param to Assumes another path of identical element configuration
     * @param t 
     * @param array 
     */
    lerp(to, t, array = new CSS_Path(to)) {
        let l = Math.min(this.length, to.length);

        for (let i = 0; i < l; i++)
            array[i] = this[i] + (to[i] - this[i]) * t;

        return array;
    }
}
