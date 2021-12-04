import wind, { Lexer } from "@candlelib/wind";
import { consumeComma } from "./consume_comma.js";

/*
    BODY {color: black; background: white }
    H1 { color: maroon }
    H2 { color: olive }
    EM { color: #f00 }              // #rgb //
    EM { color: #ff0000 }           // #rrggbb //
    EM { color: rgb(255,0,0) }      // integer range 0 - 255 //
    EM { color: rgb(100%, 0%, 0%) } // float range 0.0% - 100.0% //
*/

const color_list = {
    "aliceblue": [240, 248, 255],
    "antiquewhite": [250, 235, 215],
    "aquamarine": [127, 255, 212],
    "aqua": [0, 255, 25],
    "azure": [240, 255, 255],
    "beige": [245, 245, 220],
    "bisque": [255, 228, 196],
    "black": [],
    "blanchedalmond": [255, 235, 205],
    "blueviolet": [138, 43, 226],
    "blue": [0, 0, 255],
    "brown": [165, 42, 42],
    "burlywood": [222, 184, 135],
    "cadetblue": [95, 158, 160],
    "chartreuse": [127, 255],
    "chocolate": [210, 105, 30],
    "clear": [255, 255, 255],
    "coral": [255, 127, 80],
    "cornflowerblue": [100, 149, 237],
    "cornsilk": [255, 248, 220],
    "crimson": [220, 20, 60],
    "cyan": [0, 255, 25],
    "darkblue": [0, 0, 139],
    "darkcyan": [0, 139, 139],
    "darkgoldenrod": [184, 134, 11],
    "darkgray": [169, 169, 169],
    "darkgreen": [0, 100],
    "darkkhaki": [189, 183, 107],
    "darkmagenta": [139, 0, 139],
    "darkolivegreen": [85, 107, 47],
    "darkorange": [255, 140],
    "darkorchid": [153, 50, 204],
    "darkred": [139],
    "darksalmon": [233, 150, 122],
    "darkseagreen": [143, 188, 143],
    "darkslateblue": [72, 61, 139],
    "darkslategray": [47, 79, 79],
    "darkturquoise": [0, 206, 209],
    "darkviolet": [148, 0, 211],
    "deeppink": [255, 20, 147],
    "deepskyblue": [0, 191, 255],
    "dimgray": [105, 105, 105],
    "dodgerblue": [30, 144, 255],
    "firebrick": [178, 34, 34],
    "floralwhite": [255, 250, 240],
    "forestgreen": [34, 139, 34],
    "fuchsia": [255, 0, 255],
    "gainsboro": [220, 220, 220],
    "ghostwhite": [248, 248, 255],
    "gold": [255, 215],
    "goldenrod": [218, 165, 32],
    "gray": [128, 128, 128],
    "greenyellow": [173, 255, 47],
    "green": [0, 128],
    "honeydew": [240, 255, 240],
    "hotpink": [100, 149, 237],
    "indianred": [205, 92, 92],
    "indigo": [75, 0, 130],
    "invisible": [0, 0, 0, 0],
    "ivory": [255, 255, 240],
    "khaki": [240, 230, 140],
    "lavenderblush": [255, 240, 245],
    "lavender": [230, 230, 250],
    "lawngreen": [124, 252],
    "lemonchiffon": [255, 250, 205],
    "lightblue": [173, 216, 230],
    "lightcoral": [240, 128, 128],
    "lightcyan": [224, 255, 255],
    "lightgoldenrodyellow": [250, 250, 210],
    "lightgray": [211, 211, 211],
    "lightgreen": [144, 238, 144],
    "lightpink": [255, 182, 193],
    "lightsalmon": [255, 160, 122],
    "lightseagreen": [32, 178, 170],
    "lightskyblue": [135, 206, 250],
    "lightslategray": [119, 136, 153],
    "lightsteelblue": [176, 196, 222],
    "lightyellow": [255, 255, 224],
    "limegreen": [50, 205, 50],
    "lime": [0, 255],
    "linen": [250, 240, 230],
    "magenta": [255, 0, 255],
    "maroon": [128],
    "mediumaquamarine": [102, 205, 170],
    "mediumblue": [0, 0, 205],
    "mediumorchid": [186, 85, 211],
    "mediumpurple": [147, 112, 219],
    "mediumseagreen": [60, 179, 113],
    "mediumslateblue": [123, 104, 238],
    "mediumspringgreen": [0, 250, 154],
    "mediumturquoise": [72, 209, 204],
    "mediumvioletred": [199, 21, 133],
    "midnightblue": [25, 25, 112],
    "mintcream": [245, 255, 250],
    "mistyrose": [255, 228, 225],
    "moccasin": [255, 228, 181],
    "navajowhite": [255, 222, 173],
    "navy": [0, 0, 128],
    "oldlace": [253, 245, 230],
    "olivedrab": [107, 142, 35],
    "olive": [128, 128],
    "orangered": [255, 69],
    "orange": [255, 165],
    "orchid": [218, 112, 214],
    "palegoldenrod": [238, 232, 170],
    "palegreen": [152, 251, 152],
    "paleturquoise": [175, 238, 238],
    "palevioletred": [219, 112, 147],
    "papayawhip": [255, 239, 213],
    "peachpuff": [255, 218, 185],
    "peru": [205, 133, 63],
    "pink": [255, 192, 203],
    "plum": [221, 160, 221],
    "powderblue": [176, 224, 230],
    "purple": [128, 0, 128],
    "red": [255],
    "rosybrown": [188, 143, 143],
    "royalblue": [65, 105, 225],
    "saddlebrown": [139, 69, 19],
    "salmon": [250, 128, 114],
    "sandybrown": [244, 164, 96],
    "seagreen": [46, 139, 87],
    "seashell": [255, 245, 238],
    "sienna": [160, 82, 45],
    "silver": [192, 192, 192],
    "skyblue": [135, 206, 235],
    "slateblue": [106, 90, 205],
    "slategray": [112, 128, 144],
    "snow": [255, 250, 250],
    "springgreen": [0, 255, 127],
    "steelblue": [70, 130, 180],
    "tan": [210, 180, 140],
    "teal": [0, 128, 128],
    "thistle": [216, 191, 216],
    "tomato": [255, 99, 71],
    "transparent": [0, 0, 0, 0],
    "turquoise": [64, 224, 208],
    "violet": [238, 130, 238],
    "wheat": [245, 222, 179],
    "whitesmoke": [245, 245, 245],
    "white": [255, 255, 255],
    "yellowgreen": [154, 205, 50],
    "yellow": [255, 255],
    /**
     * test
     */
    "rebeccapurple": [102, 81, 153]
};
type ColorList = { [i in keyof typeof color_list]: CSS_Color };
export default class CSS_Color extends Float64Array {

    static colors: ColorList;

    static fromHCMX(
        h: number,
        c: number,
        m: number,
        x: number
    ) {
        let r = m, g = m, b = m;

        if (h < 1 && h >= 0) {
            r += c;
            g += x;
        } else if (h < 2) {
            r += x;
            g += c;
        } else if (h < 3) {
            g += c;
            b += x;
        } else if (h < 4) {
            g += x;
            b += c;
        } else if (h < 5) {
            r += x;
            b += c;
        } else if (h < 6) {
            r += c;
            b += x;
        };

        r *= 255;
        g *= 255;
        b *= 255;

        return new CSS_Color(r, g, b);
    };

    static fromHSV(
        hue: number,
        saturation: number,
        value: number
    ) {
        const
            h = (hue) / 60,
            c = value * saturation,
            m = value - c,
            x = c * (1 - Math.abs((h % 2) - 1));

        return CSS_Color.fromHCMX(h, c, m, x);
    }

    static fromHSL(
        hue: number,
        saturation: number,
        lightness: number
    ) {
        saturation *= 0.01;
        lightness *= 0.01;

        const
            h = (hue % 360) / 60,
            c = (1 - Math.abs(2 * lightness - 1)) * (saturation),
            x = c * (1 - Math.abs((h % 2) - 1)),
            m = lightness - 0.5 * c;

        return CSS_Color.fromHCMX(h, c, m, x);
    }


    static parse(l: Lexer) {

        let c = CSS_Color._fs_(l);

        if (c) {

            let color = new CSS_Color();

            color.set(c);

            return color;
        }

        return null;
    }

    static _verify_(l: Lexer | string) {
        let c = CSS_Color._fs_(l, true);
        if (c)
            return true;
        return false;
    }

    /**
        Creates a new Color from a string or a Lexer.
    */
    static _fs_(l: Lexer | string, v = false) {
        let c;

        if (typeof (l) == "string")
            l = wind(l);

        let out = { r: 0, g: 0, b: 0, a: 1 };

        var tx;

        switch (l.ch) {
            case "#":
                l.next();
                let pk = l.copy();

                let type = l.types;
                pk.IWS = false;


                while (!(pk.ty & (type.new_line | type.ws)) && !pk.END && pk.ch !== ";") {
                    pk.next();
                }

                var value = pk.slice(l);
                l.sync(pk);
                l.tl = 0;
                l.next();

                let num = parseInt(value, 16);

                if (value.length == 3 || value.length == 4) {

                    if (value.length == 4) {
                        const a = (num >> 8) & 0xF;
                        out.a = (a | a << 4) / 256;
                        num >>= 4;
                    }

                    const r = (num >> 8) & 0xF;
                    out.r = r | r << 4;

                    const g = (num >> 4) & 0xF;
                    out.g = g | g << 4;

                    const b = (num) & 0xF;
                    out.b = b | b << 4;

                } else {

                    if (value.length == 8) {
                        out.a = (num & 0xFF) / 256;
                        num >>= 8;
                    }

                    out.r = (num >> 16) & 0xFF;
                    out.g = (num >> 8) & 0xFF;
                    out.b = (num) & 0xFF;
                }
                l.next();
                break;

            case "r":

                tx = l.tx;

                const RGB_TYPE = tx === "rgba" ? 1 : tx === "rgb" ? 2 : 0;

                if (RGB_TYPE > 0) {

                    l.next().assert("("); // rgb* + (

                    out.r = parseInt(l.tx);

                    consumeComma(l.next());

                    //@ts-ignore
                    if (l.ch == "%") { consumeComma(l.next()); out.r = out.r * 255 / 100; }

                    out.g = parseInt(l.tx);

                    consumeComma(l.next());

                    //@ts-ignore
                    if (l.ch == "%") { consumeComma(l.next()); out.g = out.g * 255 / 100; }

                    out.b = parseInt(l.tx);

                    consumeComma(l.next()); // ) or % or another number or /

                    //@ts-ignore
                    if (l.ch == "%") { consumeComma(l.next()); out.b = out.b * 255 / 100; }

                    if (l.tx != ")") {

                        if (RGB_TYPE == 2) {
                            if (l.tx == "/") {
                                l.next();
                                out.a = parseInt(l.tx);
                                l.next();
                                //@ts-ignore
                                if (l.ch == "%") { l.next(), out.a = out.a * 255 / 100; }
                            }
                        } else if (RGB_TYPE < 2) {

                            out.a = parseFloat(l.tx);

                            l.next();
                            //@ts-ignore
                            if (l.ch == "%") { l.next(), out.a = out.a * 255 / 100; }
                        }
                    }

                    l.assert(")");
                    c = new CSS_Color();
                    c.set(out);
                    return c;
                }  // intentional

            case "h":

                tx = l.tx;

                const HSL_TYPE = tx === "hsla" ? 1 : tx === "hsl" ? 2 : 0;

                let h = 0, s = 0, l_ = 0;

                if (HSL_TYPE > 0) {

                    l.next(); // (

                    h = parseInt(l.next().tx);

                    l.next(); // , or  %
                    //@ts-ignore
                    if (l.ch == "%") {
                        l.next();
                    }

                    s = parseInt(l.next().tx);

                    l.next(); // , or  %
                    //@ts-ignore
                    if (l.ch == "%") {
                        l.next();
                    }


                    l_ = parseInt(l.next().tx);

                    l.next(); // , or ) or %
                    //@ts-ignore
                    if (l.ch == "%")
                        l.next();

                    if (HSL_TYPE < 2) {
                        out.a = parseFloat(l.next().tx);

                        l.next();
                        //@ts-ignore
                        if (l.ch == "%")
                            l.next(), out.a = out.a * 255 / 100;
                    }

                    l.a(")");

                    return CSS_Color.fromHSL(h, s, l_);
                }  // intentional
            default:

                let string = l.tx;

                if (l.ty == l.types.str) { string = string.slice(1, -1); }

                out = CSS_Color.colors[string.toLowerCase()];

                if (out) l.next();
        }

        return out;
    }


    get r(): number { return this[0]; }
    set r(r: number) { this[0] = Math.min(Math.max(0, r), 255) | 0; }

    get g(): number { return this[1]; }
    set g(g: number) { this[1] = Math.min(Math.max(0, g), 255) | 0; }

    get b(): number { return this[2]; }
    set b(b: number) { this[2] = Math.min(Math.max(0, b), 255) | 0; }

    get a(): number { return this[3]; }
    set a(a: number) { this[3] = a; }

    constructor(r?: number, g?: number, b?: number, a: number = 1) {
        super(4);

        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 1;

        if (typeof (r) === "number") {
            this.r = r; //Math.max(Math.min(Math.round(r),255),-255);
            this.g = g; //Math.max(Math.min(Math.round(g),255),-255);
            this.b = b; //Math.max(Math.min(Math.round(b),255),-255);
            this.a = a; //Math.max(Math.min(a,1),-1);
        } else if (typeof (r) == "string")
            this.set(CSS_Color._fs_(r) || { r: 255, g: 255, b: 255, a: 0 });
    }

    set(color: CSS_Color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = (color.a != undefined) ? color.a : this.a;
    }

    add(color: CSS_Color): CSS_Color {
        return new CSS_Color(
            color.r + this.r,
            color.g + this.g,
            color.b + this.b,
            color.a + this.a
        );
    }

    mult(val: number | CSS_Color) {
        if (typeof (val) == "number") {
            return new CSS_Color(
                this.r * val,
                this.g * val,
                this.b * val,
                this.a * val
            );
        } else {
            return new CSS_Color(
                this.r * val.r,
                this.g * val.g,
                this.b * val.b,
                this.a * val.a
            );
        }
    }

    sub(color: CSS_Color) {
        return new CSS_Color(
            this.r - color.r,
            this.g - color.g,
            this.b - color.b,
            this.a - color.a
        );
    }

    lerp(to: CSS_Color, t: number) {
        return this.add(to.sub(this).mult(t));
    }

    from(other: any) { return new CSS_Color(other); }

    toString() {

        if (this.a !== 1)
            return this.toRGBAString();

        return `#${("0" + this.r.toString(16)).slice(-2)}${("0" + this.g.toString(16)).slice(-2)}${("0" + this.b.toString(16)).slice(-2)}`;
    }

    toRGBAString() {
        const rgb = this.toRGBString();
        if (this.a == 1) return rgb;
        return "rgba" + rgb.slice(3, -1) + `,${this.a})`;
    }
    toRGBString() { return `rgb(${this.r | 0},${this.g | 0},${this.b | 0})`; }

    toHSLString() {

        let { r, g, b } = this;

        r /= 255;
        g /= 255;
        b /= 255;

        let h = 0, h_ = 0, l = 0, s = 0,
            // hue
            M = Math.max(r, g, b),
            m = Math.min(r, g, b),
            c = M - m;

        if (M === r)
            h_ = ((g - b) / c);
        else if (M === g)
            h_ = ((b - r) / c) + 2;
        else
            h_ = ((r - g) / c) + 4;

        h_ *= 60;

        h = h_; //(((Math.PI / 180) * 60) * Math.abs(((h_+30) % 360)));

        if (h < 0) h += 360;

        //value
        l = (r * 0.3 + g * 0.59 + b * 0.11) / (r + g + b);

        //saturation
        s = (c == 0) ? 0 : c / M;

        return `hsl(${Math.round(h * 10) / 10},${Math.round(s * 10) / 10},${Math.round(l * 10) / 10})`;
    }

    toHSLAString() {
        const hsv = this.toHSLString();
        if (this.a == 1) return hsv;
        return "hsla" + hsv.slice(3, -1) + `,${this.a})`;
    }
}
let _$ = (r = 0, g = 0, b = 0, a = 1) => (new CSS_Color(r, g, b, a));
let c = [0, 255, 25];
CSS_Color.colors = <ColorList>Object.fromEntries(Object.entries(color_list).map(([key, v]) => [key, new CSS_Color(...v)]));