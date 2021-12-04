import { comp } from "@model";
import { sys } from "@api";

var
    canvas = "@canvas", ctx = "@ctx2D",
    draw_type = "wheel",
    width = 200, height = 200,
    type = "COLOR_TOOL", mode = "hsl", col = "", hsv = "", rgb = "",
    r = 1, g = 1, b = 1, a = 1, saturation = 1, m = 0.17, n = 0.51,
    smpl = ("@#sample");

function getColor(x, y) {

    let color;

    const { css: { CSS_Color } } = sys;

    //square types
    if (draw_type === "doughnut" || draw_type === "wheel") { //wheel or doughnut
        //vector from center to xy
        x = (x - width * 0.5) / (width * 0.5);
        y = (y - height * 0.5) / (width * 0.5);

        //normalize
        let l = Math.sqrt(x * x + y * y); // l becomes a useful value

        if (l == 0) x = 0, y = 0;

        //if (l > 1) debugger;

        //console.log(x, y);

        if (
            l > 0.95) { // discard points outside and inside circle
            return new CSS_Color(0, 0, 0, 0);
        } else {
            //calculate angle and convert degrees
            var angle = (Math.atan2(y, x) * 180 / Math.PI) + 360 + 90;
            angle %= 360;
            let a = l * m; //now even more useful

            if (draw_type === "doughnut") {
                if (mode == "hsl") {
                    color = CSS_Color.fromHSL(angle, 0.5, 1);
                } else {
                    color = CSS_Color.fromHSV(angle, 0.5, (1 - (l * 2.5 - 1.5)));
                }
            } else {
                //if (false) {
                let v = Math.max(0.01, (l));
                let colorA = CSS_Color.fromHSV(angle, l ** 1.5, 0.8);
                //} else {
                //l *= Math.sqrt(2);
                v = Math.max(0.01, l);
                color = CSS_Color.fromHSL(angle, 1.05, 0.55);
                l *= l;
                //color = colorA;

                color.r = (color.r * (l) + colorA.r * (1 - l));
                color.g = (color.g * (l) + colorA.g * (1 - l));
                color.b = (color.b * (l) + colorA.b * (1 - l));

                //}
            }
        }
    } else { //square
        if (mode === "hsl") {
            color = CSS_Color.fromHSL(x / width * 360, saturation, 1 - y / height);
        } else {
            color = CSS_Color.fromHSV(x / width * 360, saturation, 1 - y / height);
        }
    }

    //color.r = Math.round(color.r / 128) * 128;
    //color.g = Math.round(color.g / 128) * 128;
    //color.b = Math.round(color.b / 128) * 128;

    return color;
}

function $draw() {

    let
        id = ctx.getImageData(0, 0, width, height),
        data = id.data;

    for (var i = 0; i < height; i++) {

        for (var j = 0; j < width; j++) {

            var index = (i * width + j) * 4;

            const { r, g, b, a } = getColor(j, i);

            if (a === 0) continue;

            data[index + 0] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(id, 0, 0);

    //Extras
    switch (draw_type) {
        case "doughnut":
            ctx.strokeStyle = "white";
            ctx.lineWidth = width * 0.025;

            ctx.beginPath();
            ctx.arc(width * 0.5, height * 0.5, width * 0.475, Math.PI * 2, false);
            ctx.stroke();

            ctx.strokeStyle = this.draw_mode === "hsl" ? "white" : "black";
            ctx.beginPath();
            ctx.arc(width * 0.5, height * 0.5, width * 0.295, Math.PI * 2, false);
            ctx.stroke();

            break;
        case "wheel":
            ctx.strokeStyle = "white";
            ctx.lineWidth = width * 0.025;
            ctx.beginPath();
            ctx.arc(width * 0.5, height * 0.5, width * 0.475, Math.PI * 2, false);
            ctx.stroke();
            break;
        default:
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, width, height);
            break;
    }
}

function handleClick(e) {

    const
        { x, y } = e,
        { top: ey, left: ex } = canvas.getBoundingClientRect();

    const color = getColor(x - ex, y - ey);

    if (color.a == 0) return;

    col = color.toString();
    rgb = color.toRGBAString();
    hsv = color.toHSLString();

    smpl.style.backgroundColor = color;

    e.stopPropagation();
    e.preventDefault();
}

export default <div>
    <canvas onpointermove="${handleClick}" width="${width}" height="${height}"></canvas>
    <input type="number" step="0.01" value="${m}" />
    <input type="number" step="0.01" value="${n}" />
    <div id="sample"></div>
    <p>${col}</p>
    <p>${rgb}</p>
    <p>${hsv}</p>
</div>;
<style>
    root{
        position:relative;
        width:200px;
        height:400px;
        overflow:hidden
    }

    #sample{
        position:relative;
        width: 20px;
        height:20px;
    }
</style>;