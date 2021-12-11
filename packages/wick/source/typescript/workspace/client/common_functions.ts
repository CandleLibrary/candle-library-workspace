import { ContainerComponent, getRegisteredComponents, WickRTComponent } from '../../client/index.js';
import { WickLibrary } from '../../index.js';
import { releaseCSSCache } from './cache/css_cache.js';
import { EditorSelection } from "./types/selection";
import { WorkspaceSystem } from "./types/workspace_system";



export function getElementWIndex(ele: HTMLElement): number {
    if (ele.hasAttribute("w:u"))
        return parseInt(ele.getAttribute("w:u") || "");
    return -1;
}
export function getRuntimeComponentsFromName(name: string, wick: WickLibrary): (WickRTComponent | ContainerComponent)[] {

    //Traverse dom structure and identify all components
    return getRegisteredComponents(name);
}
export function getRootComponentName(ele: HTMLElement) {

    while (ele) {

        if (ele.dataset.wrtc) {

            return ele.dataset.wrtc;
        }

        ele = ele.parentElement;
    }

    return "";
}
export function getComponentNameFromElement(ele: HTMLElement): string {
    return getRootComponentName(ele);
}




export function invalidateSelection(sel: EditorSelection, sys: WorkspaceSystem) {
    const
        selections = sys.editor_model.selections,
        i = selections.indexOf(sel);

    if (i >= 0) {
        if (sel.ele)
            sel.ele.style.textDecoration = "";

        if (sel.css)
            releaseCSSCache(sel.css);

        sel.VALID = false;
        sel.ACTIVE = false;
        sel.ele = null;
        sel.css = null;

    } else {
        throw ReferenceError("This selection is out of scope!");
    }
}

export function invalidateInactiveSelections(sys: WorkspaceSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections)
        if (!sel.ACTIVE && sel.VALID)
            invalidateSelection(sel, sys);


}

export function invalidateAllSelections(sys: WorkspaceSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections)
        invalidateSelection(sel, sys);
}

export function updateSelections(sys: WorkspaceSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections)
        //@ts-ignore
        updateSelectionCoords(sel, sys).scheduledUpdate();

    //@ts-ignore
    selections.scheduleUpdate();
}

export function updateActiveSelections(
    sys: WorkspaceSystem
) {
    const selections = sys.editor_model.selections;

    for (const sel of selections.filter(s => s.ACTIVE)) {

        sel.component = getComponentNameFromElement(sel.ele);

        updateSelectionCoords(sel, sys).scheduledUpdate();
    }
    //@ts-ignore
    selections.scheduleUpdate();
}

export function getSelection(
    sys: WorkspaceSystem,
    ele: HTMLElement
): EditorSelection {

    const selections = sys.editor_model.selections;
    let selection_candidate: EditorSelection = null;

    for (const sel of selections) {
        if (!sel.VALID)
            selection_candidate = sel;

        if (sel.ele == ele)
            return sel;
    }

    if (selection_candidate) {

        selection_candidate.VALID = true;
        selection_candidate.ele = ele;

        return selection_candidate;
    }


    const sel = createSelection(sys);

    selections.push(<EditorSelection><any>sel);

    return getSelection(sys, ele);
}
export function createSelection(sys: WorkspaceSystem): EditorSelection {
    return sys.editor_wick.objects.ObservableScheme<EditorSelection>({
        component: "",
        ACTIVE: false,
        VALID: false,
        ele: null,
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        actual_left: 0,
        actual_width: 0,
        actual_top: 0,
        actual_height: 0,
        px: 0,
        py: 0,
        pz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 0,
        sy: 0,
        sz: 0,
        max_x: 0,
        max_y: 0,
        min_x: 0,
        min_y: 0,
        css: null,
    });
}

export function updateSelectionCoords(sel: EditorSelection, sys: WorkspaceSystem): EditorSelection {

    if (!sel.VALID) return sel;

    const { ui: { transform: { px, py, scale } } } = sys,
        { ele } = sel,
        bb = ele.getBoundingClientRect();

    let min_x = bb.left, min_y = bb.top, max_x = min_x + bb.width, max_y = min_y + bb.height;

    sel.px = min_x;
    sel.py = min_y;
    sel.left = min_x;
    sel.top = min_y;
    sel.width = max_x - min_x;
    sel.height = max_y - min_y;
    sel.actual_left = bb.left;
    sel.actual_top = bb.top;
    sel.actual_width = bb.width;
    sel.actual_height = bb.height;

    return sel;
}


export function getSelectionFromPoint(x: number, y: number, sys: WorkspaceSystem): EditorSelection {

    sys.ui.event_intercept_frame.style.pointerEvents = "none";

    let ele: HTMLElement = <any>window.document.elementFromPoint(x, y);

    if (ele?.tagName != "IFRAME") // is edited component 
    {

        const
            style = window.getComputedStyle(ele),
            top = parseFloat(style.top) || 0,
            left = parseFloat(style.left) || 0,
            { ui: { transform: { px, py, scale } } } = sys;

        let IS_FRAME_SELECTED = false;

        //Convert screen coords to component coords
        x = (x - px) / scale - left;
        y = (y - py) / scale - top;


        sys.ui.event_intercept_frame.style.pointerEvents = "all";

        return updateSelectionCoords(getSelection(sys, ele), sys);
    }

    sys.ui.event_intercept_frame.style.pointerEvents = "all";


    return null;
}




