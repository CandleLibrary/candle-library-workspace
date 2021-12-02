import BoxWidget from "../widget/box_widget.js.js";

function CreateBoxes(ele, LineMachine, target, IS_COMPONENT = false) {

    LineMachine.boxes.push(new BoxWidget(ele));

    let children = ele.children;

    if (!IS_COMPONENT)
        for (let i = 0; i < children.length; i++) {
            if (target == children[i]) continue;
            CreateBoxes(children[i], LineMachine, target);
        }
}

function CreateComponentBoxes(c, LineMachine, target) {
    if (c == target) return;
    LineMachine.boxes.push(new ComponentLineBox(c));
}

export class LineMachine {
    constructor() {
        this.boxes = [];
        this.tolerance = 7;

        this.activex = { id: -1, ot: 0, tt: 0 };
        this.activey = { id: -1, ot: 0, tt: 0 };
    }

    setPotentialBoxes(widget, components) {

        this.boxes.length = 0;

        if (widget.IS_COMPONENT)
            components.forEach(c => CreateBoxes(c.element, this, widget.component.element, true));
        else
            //get root of component and create boxes from elements inside the component. 
            CreateBoxes(
                widget.component.element.shadowRoot.children[0],
                this,
                widget.element
            );
    }

    getSuggestedLine(scale, widget, dx, dy) {

        if (!widget) return { dx, dy };

        //tolerance based on rate
        let mx = this.tolerance - 0.5; //Math.min(this.tolerance / Math.max(Math.abs(dx)*1.55, 0.1), this.tolerance);
        let my = this.tolerance - 0.5; //Math.min(this.tolerance / Math.max(Math.abs(dy) * 1.55, 0.1), this.tolerance);

        let x_set = false;
        let y_set = false;

        const box = widget.getBox(widget.boxType, widget.edgeType),
            l = box.l,
            r = box.r,
            LO = (l - r == 0),
            t = box.t,
            b = box.b,
            ch = (l + r) / 2,
            cv = (t + b) / 2,
            tolx = mx,
            toly = my;
        // console.log(box)

        for (let i = 0; i < this.boxes.length; i++) {
            let box = this.boxes[i].MarginBox;

            //Make sure the ranges overlap

            //Vertical
            if (!x_set && l <= (box.r + tolx + 1) && r >= (box.l - tolx - 1)) {
                //There is overlap; find the best alignment
                let c = (box.l + box.r) * 0.5;
                let tol = Math.abs(mx);
                let array = [
                    //left
                    l - box.l, l - box.r, l - c,
                    //right
                    r - box.l, r - box.r, r - c,
                    //center
                    ch - box.l, ch - box.r, ch - c
                ];

                let length = LO ? 3 : 9; // Singl

                for (let j = 0; j < length; j++) {

                    if (Math.abs(array[j]) < Math.abs(mx)) {
                        mx = array[j];
                        this.activex.id = i;
                        this.activex.tt = (j % 3);
                        this.activex.ot = (j / 3) | 0;
                        //x_set = true;
                        //break;
                    }
                }
            }

            //Horizontal
            if (!y_set && t < (box.b + toly + 1) && b > (box.t - toly - 1)) {
                //There is overlap; find the best alignment
                let c = (box.t + box.b) * 0.5;
                let tol = Math.abs(my);
                let array = [
                    /*top*/
                    t - box.t, t - box.b, t - c,
                    /*bottom*/
                    b - box.t, b - box.b, b - c,
                    /*center*/
                    cv - box.t, cv - box.b, cv - c
                ];
                for (let j = 0; j < 9; j++)
                    if (Math.abs(array[j]) < tol) {
                        my = array[j];
                        this.activey.id = i;
                        this.activey.tt = (j % 3);
                        this.activey.ot = (j / 3) | 0;
                        //y_set = true;
                        break;
                    }
            }

            if (x_set && y_set) break;
        }

        let dx_ = dx,
            dy_ = dy,
            MX = false,
            MY = false;

        if (Math.abs(mx) < tolx && Math.abs(dx) < tolx) {
            MX = true;
            dx_ = mx;
        } else
            this.activex.id = -1;

        if (Math.abs(my) < toly && Math.abs(dy) < toly) {
            MY = true;
            dy_ = my;
        } else
            this.activey.id = -1;

        return { dx: dx_, dy: dy_, MX, MY };
    }

    render(ctx, transform, widget) {

        let component = widget.component;

        let min_x = transform.px + (component.x) * transform.scale;
        let max_x = transform.px + (component.x + component.width) * transform.scale;
        let min_y = transform.py + (component.y) * transform.scale;
        let max_y = transform.py + (component.y + component.height) * transform.scale;

        if (!widget || this.boxes.length == 0) return;

        const boxc = widget.getBox(widget.boxType, widget.edgeType);



        ctx.save();

        //Horizontal Alignement

        if (this.activex.id > -1) {
            //0 = l, 1 = r, 2 = c 

            const
                box = this.boxes[this.activex.id].getBox(0, 0, transform),
                x = [box.l, box.r, (box.r + box.l) / 2][this.activex.tt];
            //y1 = [box.t, box.t, (box.t + box.b) / 2][this.activex.tt],
            //y2 = [boxc.t, boxc.t, (boxc.t + boxc.b) / 2][this.activex.ot];
            ctx.beginPath();
            ctx.moveTo(x, min_y);
            ctx.lineTo(x, max_y);

            ctx.strokeStyle = "white";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        //Vertical Alignement

        if (this.activey.id > -1) {
            //0 = t, 1 = b, 2 = c 
            ctx.strokeStyle = "green";

            const
                box = this.boxes[this.activey.id].getBox(0, 0, transform),
                y = [box.t, box.b, (box.t + box.b) / 2][this.activey.tt];
            //x1 = [box.l, box.l, (box.r + box.l) / 2][this.activey.tt],
            //x2 = [boxc.l, boxc.l, (boxc.r + boxc.l) / 2][this.activey.ot];

            ctx.beginPath();
            ctx.moveTo(min_x, y);
            ctx.lineTo(max_x, y);

            ctx.strokeStyle = "white";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.strokeStyle = "green";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }
}
