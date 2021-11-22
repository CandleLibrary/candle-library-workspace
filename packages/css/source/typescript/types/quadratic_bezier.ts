import Point2D from "./point.js";

function curvePoint(curve, t) {
    var point = {
        x: 0,
        y: 0
    };
    point.x = posOnCurve(t, curve[0], curve[2], curve[4]);
    point.y = posOnCurve(t, curve[1], curve[3], curve[5]);
    return point;
}

function posOnCurve(t, p1, p2, p3) {
    var ti = 1 - t;
    return ti * ti * p1 + 2 * ti * t * p2 + t * t * p3;
}

function splitCurve(bp, t) {
    var left = [];
    var right = [];

    function drawCurve(bp, t) {
        if (bp.length == 2) {
            left.push(bp[0], bp[1]);
            right.push(bp[0], bp[1]);
        } else {
            var new_bp = []; //bp.slice(0,-2);
            for (var i = 0; i < bp.length - 2; i += 2) {
                if (i == 0) {
                    left.push(bp[i], bp[i + 1]);
                }
                if (i == bp.length - 4) {
                    right.push(bp[i + 2], bp[i + 3]);
                }
                new_bp.push((1 - t) * bp[i] + t * bp[i + 2]);
                new_bp.push((1 - t) * bp[i + 1] + t * bp[i + 3]);
            }
            drawCurve(new_bp, t);
        }
    }

    drawCurve(bp, t);

    return {
        x: new QBezier(right),
        y: new QBezier(left)
    };
}

function curveIntersections(p1, p2, p3) {
    var intersections = {
        a: Infinity,
        b: Infinity
    };

    var a = p1 - 2 * p2 + p3;

    var b = 2 * (p2 - p1);

    var c = p1;

    if (b == 0) { } else if (Math.abs(a) < 0.00000000005) {
        intersections.a = (-c / b); //c / b;
    } else {

        intersections.a = ((-b - Math.sqrt((b * b) - 4 * a * c)) / (2 * a));
        intersections.b = ((-b + Math.sqrt((b * b) - 4 * a * c)) / (2 * a));
    }
    return intersections;
}

export default class QBezier {

    x1: number;
    x2: number;
    x3: number;
    y1: number;
    y2: number;
    y3: number;
    constructor(x1: number | QBezier | number[], y1?: number, x2?: number, y2?: number, x3?: number, y3?: number) {
        this.x1 = 0;
        this.x2 = 0;
        this.x3 = 0;
        this.y1 = 0;
        this.y2 = 0;
        this.y3 = 0;

        if (typeof (x1) == "number") {
            this.x1 = x1;
            this.x2 = x2;
            this.x3 = x3;
            this.y1 = y1;
            this.y2 = y2;
            this.y3 = y3;
            return;
        }

        if (x1 instanceof QBezier) {
            this.x1 = x1.x1;
            this.x2 = x1.x2;
            this.x3 = x1.x3;
            this.y1 = x1.y1;
            this.y2 = x1.y2;
            this.y3 = x1.y3;
            return;
        }

        if (x1 instanceof Array) {
            this.x1 = x1[0];
            this.y1 = x1[1];
            this.x2 = x1[2];
            this.y2 = x1[3];
            this.x3 = x1[4];
            this.y3 = x1[5];
            return;
        }
    }

    reverse() {
        return new QBezier(
            this.x3,
            this.y3,
            this.x2,
            this.y2,
            this.x1,
            this.y1
        );
    }

    point(t) {
        return new Point2D(
            posOnCurve(t, this.x1, this.x2, this.x3),
            posOnCurve(t, this.y1, this.y2, this.y3));

    }

    tangent(t) {
        var tan = {
            x: 0,
            y: 0
        };

        var px1 = this.x2 - this.x1;
        var py1 = this.y2 - this.y1;

        var px2 = this.x3 - this.x2;
        var py2 = this.y3 - this.y2;

        tan.x = (1 - t) * px1 + t * px2;
        tan.y = (1 - t) * py1 + t * py2;

        return tan;
    }

    toArray() {
        return [this.x1, this.y1, this.x2, this.y2, this.x3, this.y3];
    }

    split(t) {
        return splitCurve(this.toArray(), t);
    }

    rootsX() {
        return this.roots(
            this.x1,
            this.x2,
            this.x3
        );

    }

    roots(p1, p2, p3) {
        var curve = this.toArray();

        var c = p1 - (2 * p2) + p3;
        var b = 2 * (p2 - p1);
        var a = p1;
        var a2 = a * 2;
        var sqrt = Math.sqrt(b * b - (a * 4 * c));
        var t1 = (-b + sqrt) / a2;
        var t2 = (-b - sqrt) / a2;

        return [t1, t2];
    }

    rootsa() {
        var curve = this.toArray();

        var p1 = curve[1];
        var p2 = curve[3];
        var p3 = curve[5];
        var x1 = curve[0];
        var x2 = curve[2];
        var x3 = curve[4];

        var py1d = 2 * (p2 - p1);
        var py2d = 2 * (p3 - p2);
        var ad1 = -py1d + py2d;
        var bd1 = py1d;

        var px1d = 2 * (x2 - x1);
        var px2d = 2 * (x3 - x2);
        var ad2 = -px1d + px2d;
        var bd2 = px1d;

        var t1 = -bd1 / ad1;
        var t2 = -bd2 / ad2;

        return [t1, t2];
    }
    /*
        boundingBox() {
            var x1 = this[0];
            var y1 = this[1];
            var x2 = this[2];
            var y2 = this[3];
            var x3 = this[4];
            var y3 = this[5];
            var roots = this.getRootsClamped(curve);
            var min_x = Math.min(x1, x2, x3, roots.y[0] || Infinity, roots.x[0] || Infinity);
            var min_y = Math.min(y1, y2, y3, roots.y[1] || Infinity, roots.x[1] || Infinity);
            var max_x = Math.max(x1, x2, x3, roots.y[0] || -Infinity, roots.x[0] || -Infinity);
            var max_y = Math.max(y1, y2, y3, roots.y[1] || -Infinity, roots.x[1] || -Infinity);
    
            return {
                min: {
                    x: min_x,
                    y: min_y
                },
                max: {
                    x: max_x,
                    y: max_y
                }
            };
        }
    */
    rotate(angle, offset) {
        angle = (angle / 180) * Math.PI;

        var new_curve = this.toArray();

        for (var i = 0; i < 6; i += 2) {
            var x = this[i] - offset.x;
            var y = this[i + 1] - offset.y;
            new_curve[i] = ((x * Math.cos(angle) - y * Math.sin(angle))) + offset.x;
            new_curve[i + 1] = ((x * Math.sin(angle) + y * Math.cos(angle))) + offset.y;
        }

        return new QBezier(new_curve);
    }

    intersects() {
        return {
            x: curveIntersections(this.x1, this.x2, this.x3),
            y: curveIntersections(this.y1, this.y2, this.y3)
        };
    }

    add(x, y) {
        if (typeof (x) == "number") {
            return new QBezier(
                this.x1 + x,
                this.y1 + y,
                this.x2 + x,
                this.y2 + y,
                this.x3 + x,
                this.y3 + y,
            );
        }
    }
}