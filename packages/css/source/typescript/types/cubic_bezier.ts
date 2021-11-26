import { Lexer } from '@candlelib/wind';

const
	pow = Math.pow,
	sqrt = Math.sqrt,
	acos = Math.acos,
	cos = Math.cos,
	PI = Math.PI;

// A real-cuberoots-only function:
function cuberoot(v: number) {
	if (v < 0) return -pow(-v, 1 / 3);
	return pow(v, 1 / 3);
}

function point(
	t: number,
	p1: number,
	p2: number,
	p3: number,
	p4: number
) {
	var ti = 1 - t;
	var ti2 = ti * ti;
	var t2 = t * t;
	return ti * ti2 * p1 + 3 * ti2 * t * p2 + t2 * 3 * ti * p3 + t2 * t * p4;
}
export default class CSS_Bezier extends Float64Array {
	static parse(l: Lexer) {

		let out = null;

		switch (l.tx) {
			case "cubic":
				l.next().a("(");
				let v1 = parseFloat(l.tx);
				let v2 = parseFloat(l.next().a(",").tx);
				let v3 = parseFloat(l.next().a(",").tx);
				let v4 = parseFloat(l.next().a(",").tx);
				l.a(")");
				out = new CSS_Bezier(v1, v2, v3, v4);
				break;
			case "ease":
				l.next();
				out = new CSS_Bezier(0.25, 0.1, 0.25, 1);
				break;
			case "ease-in":
				l.next();
				out = new CSS_Bezier(0.42, 0, 1, 1);
				break;
			case "ease-out":
				l.next();
				out = new CSS_Bezier(0, 0, 0.58, 1);
				break;
			case "ease-in-out":
				l.next();
				out = new CSS_Bezier(0.42, 0, 0.58, 1);
				break;
		}

		return out;
	}


	constructor(
		x1: number | number[],
		y1?: number,
		x2?: number,
		y2?: number,
		x3?: number,
		y3?: number,
		x4?: number,
		y4?: number
	) {
		super(8);

		if (typeof (x1) == "number") {
			//Map P1 and P2 to {0,0,1,1} if only four arguments are provided; for use with animations
			if (arguments.length == 4) {
				this[0] = 0;
				this[1] = 0;
				this[2] = <number>x1;
				this[3] = <number>y1;
				this[4] = <number>x2;
				this[5] = <number>y2;
				this[6] = 1;
				this[7] = 1;
				return;
			}
			this[0] = x1;
			this[1] = <number>y1;
			this[2] = <number>x2;
			this[3] = <number>y2;
			this[4] = <number>x3;
			this[5] = <number>y3;
			this[6] = <number>x4;
			this[7] = <number>y4;
			return;
		}

		if (x1 instanceof Array) {
			this[0] = x1[0];
			this[1] = x1[1];
			this[2] = x1[2];
			this[3] = x1[3];
			this[4] = x1[4];
			this[5] = x1[5];
			this[6] = x1[6];
			this[7] = x1[4];
			return;
		}
	}

	get x1(): number { return this[0]; }
	set x1(v: number) { this[0] = v; }
	get x2(): number { return this[2]; }
	set x2(v: number) { this[2] = v; }
	get x3(): number { return this[4]; }
	set x3(v: number) { this[4] = v; }
	get x4(): number { return this[6]; }
	set x4(v: number) { this[6] = v; }
	get y1(): number { return this[1]; }
	set y1(v: number) { this[1] = v; }
	get y2(): number { return this[3]; }
	set y2(v: number) { this[3] = v; }
	get y3(): number { return this[5]; }
	set y3(v: number) { this[5] = v; }
	get y4(): number { return this[7]; }
	set y4(v: number) { this[7] = v; }

	add(x: number, y: number = 0) {
		return new CSS_Bezier(
			this[0] + x,
			this[1] + y,
			this[2] + x,
			this[3] + y,
			this[4] + x,
			this[5] + y,
			this[6] + x,
			this[7] + y
		);
	}

	valY(t: number) {
		return point(t, this[1], this[3], this[5], this[7]);
	}

	valX(t: number) {
		return point(t, this[0], this[2], this[4], this[6]);
	}
	/*
	point(t) {
		return new Point2D(
			point(t, this[0], this[2], this[4], this[6]),
			point(t, this[1], this[3], this[5], this[7])
		);
	}
	*/

	/** 
		Adapted from : https://pomax.github.io/bezierinfo/
		Author:  Mike "Pomax" Kamermans
		GitHub: https://github.com/Pomax/
	*/

	roots(p1: number, p2: number, p3: number, p4: number) {
		var d = (-p1 + 3 * p2 - 3 * p3 + p4),
			a = (3 * p1 - 6 * p2 + 3 * p3) / d,
			b = (-3 * p1 + 3 * p2) / d,
			c = p1 / d;

		var p = (3 * b - a * a) / 3,
			p3 = p / 3,
			q = (2 * a * a * a - 9 * a * b + 27 * c) / 27,
			q2 = q / 2,
			discriminant = q2 * q2 + p3 * p3 * p3;

		// and some variables we're going to use later on:
		var u1, v1, root1, root2, root3;

		// three possible real roots:
		if (discriminant < 0) {
			var mp3 = -p / 3,
				mp33 = mp3 * mp3 * mp3,
				r = sqrt(mp33),
				t = -q / (2 * r),
				cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
				phi = acos(cosphi),
				crtr = cuberoot(r),
				t1 = 2 * crtr;
			root1 = t1 * cos(phi / 3) - a / 3;
			root2 = t1 * cos((phi + 2 * PI) / 3) - a / 3;
			root3 = t1 * cos((phi + 4 * PI) / 3) - a / 3;
			return [root3, root1, root2];
		}

		// three real roots, but two of them are equal:
		if (discriminant === 0) {
			u1 = q2 < 0 ? cuberoot(-q2) : -cuberoot(q2);
			root1 = 2 * u1 - a / 3;
			root2 = -u1 - a / 3;
			return [root2, root1];
		}

		// one real root, two complex roots
		var sd = sqrt(discriminant);
		u1 = cuberoot(sd - q2);
		v1 = cuberoot(sd + q2);
		root1 = u1 - v1 - a / 3;
		return [root1];
	}

	rootsY() {
		return this.roots(this[1], this[3], this[5], this[7]);
	}

	rootsX() {
		return this.roots(this[0], this[2], this[4], this[6]);
	}

	getYatX(x: number) {
		var x1 = this[0] - x, x2 = this[2] - x, x3 = this[4] - x, x4 = this[6] - x,
			x2_3 = x2 * 3, x1_3 = x1 * 3, x3_3 = x3 * 3,
			d = (-x1 + x2_3 - x3_3 + x4), di = 1 / d, i3 = 1 / 3,
			a = (x1_3 - 6 * x2 + x3_3) * di,
			b = (-x1_3 + x2_3) * di,
			c = x1 * di,
			p = (3 * b - a * a) * i3,
			p3 = p * i3,
			q = (2 * a * a * a - 9 * a * b + 27 * c) * (1 / 27),
			q2 = q * 0.5,
			discriminant = q2 * q2 + p3 * p3 * p3;

		// and some variables we're going to use later on:
		var u1, v1, root;

		//Three real roots can never happen if p1(0,0) and p4(1,1);

		// three real roots, but two of them are equal:
		if (discriminant < 0) {
			var mp3 = -p / 3,
				mp33 = mp3 * mp3 * mp3,
				r = sqrt(mp33),
				t = -q / (2 * r),
				cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
				phi = acos(cosphi),
				crtr = cuberoot(r),
				t1 = 2 * crtr;
			root = t1 * cos((phi + 4 * PI) / 3) - a / 3;
		} else if (discriminant === 0) {
			u1 = q2 < 0 ? cuberoot(-q2) : -cuberoot(q2);
			root = -u1 - a * i3;
		} else {
			var sd = sqrt(discriminant);
			// one real root, two complex roots
			u1 = cuberoot(sd - q2);
			v1 = cuberoot(sd + q2);
			root = u1 - v1 - a * i3;
		}

		return point(root, this[1], this[3], this[5], this[7]);
	}
	/**
		Given a Canvas 2D context object and scale value, strokes a cubic bezier curve.
	*/
	draw(ctx: CanvasRenderingContext2D, s = 1) {
		ctx.beginPath();
		ctx.moveTo(this[0] * s, this[1] * s);
		ctx.bezierCurveTo(
			this[2] * s, this[3] * s,
			this[4] * s, this[5] * s,
			this[6] * s, this[7] * s
		);
		ctx.stroke();
	}

	toString() {
		return `cubic-bezier(${this[2]},${this[3]},${this[4]},${this[5]})`;
	}
}
