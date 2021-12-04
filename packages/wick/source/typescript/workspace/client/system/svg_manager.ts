//const paper = require("paper");
//const Point = paper.Point;
//const Size = paper.Size;
//const Path = paper.Path;

/**
 * @brief Provides interface tools for manipulating SVG elements
 */
export class SVGManager {
    constructor(system) {
        return
        this.system = system;

        this.target = null;

        this.canvas = document.createElement("canvas");
        this.canvas.style.position = "absolute";
        //paper.setup(this.canvas);
        //this.proj = paper.project;
        let point = new Point(0, 0);

        this.selection = null;

        let dx = 0;
        let dy = 0;
        let POINTER_DOWN = false;
        let path;


        this.canvas.addEventListener("pointerdown", (e) => {
            let x = e.offsetX - 20;
            let y = e.offsetY - 20;
            dx = x;
            dy = y;
            point.x = x;
            point.y = y;

            if (e.button == 0) {
                if (!path) {
                    path = new Path();
                    path.strokeColor = "black";
                    path.fullySelected = true;
                } else {
                    path.add(point);
                }
            }else{
            	path.closePath();
            }
            this.proj.view.update();


            return;
            POINTER_DOWN = true;

            this.selection = this.proj.hitTest(point, { fill: true, stroke: true });

            if (this.selection) {
                this.selection.item.selected = true;
                this.proj.view.update();
            }

        });

        this.canvas.addEventListener("pointermove", (e) => {
            if (!POINTER_DOWN) return;
            let x = dx - e.offsetX;
            let y = dy - e.offsetY;

            dx = e.offsetX;
            dy = e.offsetY;
            let selection = this.selection;
            if (selection) {
                let item = selection.item;
                switch (selection.type) {
                    case "fill":
                    case "stroke":
                        item.translate(new Point(-x, -y));
                        break;
                }

                this.proj.view.update();
            }
        });

        this.canvas.addEventListener("pointerup", (e) => {
            POINTER_DOWN = false;
            this.export();
        });


        this.ctx = this.canvas.getContext("2d");
        this.elements = [];
    }

    export () {
        paper.project.view.viewSize.set(this.width, this.height);
        paper.project.view.translate(new Point(-20, -20));
        let output = paper.project.exportSVG({ asString: true });

        this.wick_node.reparse(output).then(n => this.wick_node = n);
        paper.project.view.translate(new Point(20, 20));
        paper.project.view.viewSize.set(this.width + 40, this.height + 40);
    }

    mount(ui, target_element, component, x, y) {

        while (target_element && target_element.tagName.toUpperCase() !== "SVG") 
            target_element = target_element.parentElement;
        
        if (!target_element) return;

        this.wick_node = target_element.wick_node;

        //parse svg elements and build objects from them. 
        let children = target_element.children;


        let rect = target_element.getBoundingClientRect();
        x = component.x + rect.x + 4 - 20;
        y = component.y + rect.y + 4 - 20;
        this.width = rect.width;
        this.height = rect.width;
        paper.project.view.viewSize.set(rect.width + 40, rect.height + 40);
        paper.project.view.translate(new Point(20, 20));
        paper.project.importSVG(target_element.outerHTML);

        this.canvas.style.left = `${x}px`;
        this.canvas.style.top = `${y}px`;

        ui.view_element.appendChild(this.canvas);
    }
}
