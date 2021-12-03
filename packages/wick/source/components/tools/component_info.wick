import { selected_comp, selected_ele, sc } from "@model:flame-editor";
import { getComponentDataFromRTInstance, sys } from "@api";

var name = "default", loc = "";

function elementUpdate() {
    if (selected_comp) {
        name = selected_comp.name;
        loc = getComponentDataFromRTInstance(sys, selected_comp).location + "";
    }
};
watch(elementUpdate, sc);

export default <div>
    <h4>component</h4>
    <p>name: ${name}</p>
    <p>location: ${loc}</p>
</div>;

