import
CSS_Color
    from "./color.js";

import
CSS_Percentage
    from "./percentage.js";

import
CSS_Length
    from "./length.js";
import { Lexer } from "@candlelib/wind";
import { consumeComma } from "./consume_comma.js";

class Stop {

    color: CSS_Color;

    percentage: CSS_Percentage;

    constructor(color, percentage) {
        this.color = color;
        this.percentage = percentage || null;
    }

    toString() {
        return `${this.color}${(this.percentage) ? " " + this.percentage.toString() : ""}`;
    }
}

export class CSS_Gradient {

    stops: Stop[];

    type: number;

    direction: CSS_Length;

    static parse(l: Lexer | string) {
        if (typeof l == "string") {
            l = new Lexer(l);
            l.USE_EXTENDED_ID = true;
            l.tl = 0; l.next();
        }
        try {
            if (l.ty == l.types.id) {
                switch (l.tx) {

                    case "linear-gradient":
                        l.next().a("(");
                        let dir, num, rot = null;
                        //@ts-ignore
                        if (l.tx == "to") {
                            //@ts-ignore
                        } else if (l.ty == l.types.num) {
                            rot = CSS_Length.parse(l);
                            l.a(',');
                        }

                        let stops = [];

                        while (!l.END && l.ch != ")") {

                            let v = CSS_Color.parse(l), len = null;

                            if (l.ch != ",") {
                                if (!(len = CSS_Length.parse(l)))
                                    len = CSS_Percentage.parse(l);
                            };

                            consumeComma(l);

                            stops.push(new Stop(v, len));

                            if (l.ch == ")")
                                break;
                        }
                        l.a(")");
                        let grad = new CSS_Gradient(0, rot);
                        grad.stops = stops;
                        l.sync(l);
                        return grad;
                }
            }
        } catch (e) { }

        return null;
    }


    constructor(type = 0, rot = new CSS_Length(0, "deg")) {
        this.type = type; //linear gradient
        this.direction = rot;
        this.stops = [];
    }

    toString() {

        let str = [];

        switch (this.type) {
            case 0:
                str.push("linear-gradient(");
                if (Number(this.direction) !== 0)
                    str.push(this.direction.toString() + ",");
                break;
        }

        for (let i = 0; i < this.stops.length; i++)
            str.push(this.stops[i].toString() + ((i < this.stops.length - 1) ? "," : ""));

        str.push(")");

        return str.join(" ");
    }
}
