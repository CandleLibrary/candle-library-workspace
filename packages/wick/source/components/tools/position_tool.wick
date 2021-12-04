import { comp, selected_ele as ele, sc } from "@model:flame-editor";

var type = "default", w = 0, h = 0;

function elementUpdate() {
    type = ele.tagName;
    const bb = ele.getBoundingClientRect();
    w = bb.width;
    h = bb.height;
};
watch(elementUpdate, sc);

export default <div class="tool">
    <h4>position</h4>

    <p>type ${type}</p>
    <p>top</p>
    <p>left </p>
    <p>right </p>
    <p>bottom </p>
    <p>width ${w}px</p>
    <p>height${h}px</p>
</div>;

