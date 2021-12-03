/**
 * Add a new element to the containing element as either
 * a previous sibling, following sibling, or as the first
 * child of the element.
 */
import { selections, draw_objects, selection_box, sc } from "@model:flame-editor";

import { APPLY_ACTION, ACTIONS, sys, getValidSelectionsCount } from "@api";

var a = 0, b = 0, c = 0, d = 0;

function createComponent() { APPLY_ACTION([ACTIONS.CREATE_COMPONENT]); }


function $createComponentFromBox() {
    if (selection_box)
        APPLY_ACTION(sys, [ACTIONS.CREATE_ROOT_COMPONENT], selection_box);
}

function showBox() {
    if (false) {



        const div = "@#main", bb = ele.getBoundingClientRect();

        div.style.opacity = 1;

        a = bb.width;
        b = bb.height;
        c = bb.left;
        d = bb.top;

        div.style.width = a + "px";
        div.style.height = b + "px";
        div.style.left = c + "px";
        div.style.top = d + "px";

    } else ("@#main").style.opacity = 0;
};

watch(showBox, sc);

<style>
    root {
        position:fixed;
        width:150px;
        height:150px;
        color:white;
        z-index:10000;
        border:1px solid rgb(128,128,255);
    }

    .select-tab {
        cursor: pointer;
        font-size:1.2em;
        text-align:center;
        font-weight:900;
        width: 20px;
        height: 20px;
        background-color:rgb(200,100,100);
        position:absolute;
        border-radius: 2px;
        border: 1px solid rgb(120,100,100);
    }

    .select-tab.center {
        top:50%;
        right:50%;
        justify-content:center;
        align-content:center;
    }

</style>;

export default <div id="main" class="main">
    <div onclick="${createComponent}" class="select-tab center">+</div>
</div>;