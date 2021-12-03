import {
    pos_type,
    ACTION
} from "@model";

import { START_ACTION, sys } from "@api";

const div = "@div"[0];

switch (pos_type) {
    case "top-left":
        div.classList.add("top-left");
        break;
    case "top-right":
        div.classList.add("top-right");
        break;
    case "bottom-right":
        div.classList.add("bottom-right");
        break;
    case "bottom-left":
        div.classList.add("bottom-left");
        break;
    case "bottom":
        div.classList.add("bottom");
        break;
    case "top":
        div.classList.add("top");
        break;
    case "left":
        div.classList.add("left");
        break;
    case "right":
        div.classList.add("right");
        break;
    case "center":
        div.classList.add("center");
        break;
}

function onpointerdown(event) { START_ACTION(sys, ACTION); }

export default <div><div class="fill"></div></div>;


<style>
    root{
        position: absolute;
        pointer-events:auto;
    }


    .fill{
        border: 1px solid white;
        position: absolute;
        left:-2px;
        top:-2px;
        width: 4px;
        height: 4px;
        background-color: rgb(100,100,200);
        transition: width 2s, height 2s;
    }

    .fill:hover {
        color:white;
        background-color:rgb(180,180,250);
    }

    root.center{
        top:50%;
        left:50%;
        cursor:ns-resize
    }

    root.top{
        top:0;
        left:50%;
        cursor:ns-resize
    }

    root.bottom{
        bottom:0;
        left:50%;
        cursor:ns-resize
    }

    root.left {
        top:50%;
        left:0;
        cursor:ew-resize
    }

    root.right {
        top:50%;
        cursor:ew-resize;
        right:0;
    }

    root.bottom-right {
        bottom:0;
        right:0;
        cursor:nwse-resize;
    }

    root.bottom-left {
        bottom:0;
        left:0;
        cursor:nesw-resize;
    }

    root.top-right {
        top:0;
        right:0;
        cursor:nesw-resize;
    }

    root.top-left {
        top:0;
        left:0;
        cursor:nwse-resize;
    }
</style >;