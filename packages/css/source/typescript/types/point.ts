export default class Point2D extends Float64Array{
	
	constructor(x, y) {
		super(2)

		if (typeof(x) == "number") {
			this[0] = x;
			this[1] = y;
			return;
		}

		if (x instanceof Array) {
			this[0] = x[0];
			this[1] = x[1];
		}
	}

	draw(ctx, s = 1){
		ctx.beginPath();
		ctx.moveTo(this.x*s,this.y*s);
		ctx.arc(this.x*s, this.y*s, s*0.01, 0, 2*Math.PI);
		ctx.stroke();
	}

	get x (){ return this[0]}
	set x (v){if(typeof(v) !== "number") return; this[0] = v}

	get y (){ return this[1]}
	set y (v){if(typeof(v) !== "number") return; this[1] = v}
}