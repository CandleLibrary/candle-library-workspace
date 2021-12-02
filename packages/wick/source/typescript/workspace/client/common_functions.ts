import { traverse } from '@candlelib/conflagrate';
import {
    CSSNode,
    CSSNodeType, CSSRuleNode,

    PrecedenceFlags,
    tools
} from "@candlelib/css";
import { releaseCSSCache } from './cache/css_cache.js';
import { FlameSystem, StyleData } from "./types/flame_system";
import { EditorSelection } from "./types/selection";
import { TrackedCSSProp } from "./types/tracked_css_prop";


const {
    rules: {
        getArrayOfMatchedRules,

    },

    selectors: {
        getFirstMatchedSelector,
        getMatchedElements,
        getSelectorSpecificityValue,
    }
} = tools;

/*
 *  ██████ ███████ ███████ 
 * ██      ██      ██      
 * ██      ███████ ███████ 
 * ██           ██      ██ 
 *  ██████ ███████ ███████ 
 */


export function getMatchedRulesFromComponentData(
    sys: FlameSystem,
    ele: HTMLElement,
    styles_array: StyleData[]
): CSSRuleNode[] {
    const rules = [];

    for (const { stylesheet } of styles_array) {
        rules.push(...getArrayOfMatchedRules(
            ele, stylesheet
        ));
    }

    return rules;
};

export function getApplicableProps(
    sys: FlameSystem,
    ele: HTMLElement,
    styles_array: StyleData[]
): Map<string, TrackedCSSProp> {


    //Get applicable css files,

    //Then get applicable rules,

    //For each rule -> Identify 1 matching selector.

    //Extract selector, for each prop in rule create
    // sel,prop pairs. 

    //TODO, setup cache clone

    return getMatchedRulesFromComponentData(sys, ele, styles_array)
        .reverse()
        .reduce((m, r) => {

            const
                s = getFirstMatchedSelector(r, ele),
                rp = r.precedence,
                sp: PrecedenceFlags = getSelectorSpecificityValue(s);

            for (const [name, val] of r.props.entries())
                if (!m.has(name) || (m.get(name).prop.precedence) < (val.precedence | rp | sp))
                    m.set(name, { sel: "", prop: val.copy(rp | sp) });

            return m;
        }, <Map<string, TrackedCSSProp>>new Map);
};

export function isSelectorCapableOfBeingUnique(comp: WickRTComponent, selector: CSSNode, root_name: string = comp.name): boolean {
    let count = 0;

    for (const { node, meta: { parent } } of traverse(selector, "nodes")) {

        //Only certain selector types are allowed to serve as a unique selector. 
        switch (node.type) {
            case CSSNodeType.CompoundSelector:
            case CSSNodeType.ComplexSelector:
                break;
            case CSSNodeType.ClassSelector:
                if (node.value == root_name && parent)
                    break;
            case CSSNodeType.IdSelector:
                count++;
                break;
            default:
                count += 2;
        }
    }

    const matched_elements = [...getMatchedElements(comp.ele, selector)];

    if (matched_elements.length > 1)
        return false;

    return count == 1;
}

/*
 * ██████  ██    ██ ███    ██ ████████ ██ ███    ███ ███████                         
 * ██   ██ ██    ██ ████   ██    ██    ██ ████  ████ ██                              
 * ██████  ██    ██ ██ ██  ██    ██    ██ ██ ████ ██ █████                           
 * ██   ██ ██    ██ ██  ██ ██    ██    ██ ██  ██  ██ ██                              
 * ██   ██  ██████  ██   ████    ██    ██ ██      ██ ███████                         
 *                                                                                   
 *                                                                                   
 *  ██████  ██████  ███    ███ ██████   ██████  ███    ██ ███████ ███    ██ ████████ 
 * ██      ██    ██ ████  ████ ██   ██ ██    ██ ████   ██ ██      ████   ██    ██    
 * ██      ██    ██ ██ ████ ██ ██████  ██    ██ ██ ██  ██ █████   ██ ██  ██    ██    
 * ██      ██    ██ ██  ██  ██ ██      ██    ██ ██  ██ ██ ██      ██  ██ ██    ██    
 *  ██████  ██████  ██      ██ ██       ██████  ██   ████ ███████ ██   ████    ██    
 */

/**
 * Retrieve a list of elements that are contemporary 
 * between instances of the same component.
 */
export function getContemporaryElements(
    ele: HTMLElement, wick: WickLibrary
): HTMLElement[] {

    const comp_name = getComponentNameFromElement(ele);

    const element_id = ele.getAttribute("w:u");

    const runtime_components = getRuntimeComponentsFromName(comp_name, wick);

    const elements = [];

    for (const comp of runtime_components)
        elements.push(...getMatchingElementsFromCompID(comp, element_id));

    return elements;
}

export function getElementWIndex(ele: HTMLElement): number {
    if (ele.hasAttribute("w:u"))
        return parseInt(ele.getAttribute("w:u"));
    return -1;
}

function getMatchingElementsFromCompID(
    comp: WickRTComponent, element_id: string
): HTMLElement[] {
    let eles = [comp.ele];
    let out_elements = [];
    let root = true;

    for (const ele of eles) {

        if (ele.getAttribute("w:u") == element_id) {
            console.log(ele, { d: ele.getAttribute("w:u"), element_id });
            out_elements.push(ele);
        }

        if (root || !ele.hasAttribute("w:c")) {
            //@ts-ignore
            eles.push(...(Array.from(ele.children) || []));

        }

        root = false;
    }

    return out_elements;
}

export function setRTInstanceClass(sys: FlameSystem, comp_name: string, comp_class: typeof WickRTComponent) {
    sys.editor_wick.rt.context.component_class.set(comp_name, comp_class);
    sys.page_wick.rt.context.component_class.set(comp_name, comp_class);
}

export function getRuntimeComponentsFromName(name: string, wick: WickLibrary): WickRTComponent[] {

    //Traverse dom structure and identify all components


    const candidates = wick.rt.root_components.slice();

    const output = [];

    for (const candidate of candidates) {
        if (candidate.name == name)
            output.push(candidate);
        else
            candidates.push(...candidate.ch);
    }

    return output;
}

export function getListOfRTInstanceAndAncestors(comp: WickRTComponent): WickRTComponent[] {
    const list = [comp];
    //@ts-ignore
    while (comp.par) { if (comp.par) list.push(comp.par); comp = comp.par; }
    return list.reverse();
}

export function getRootComponentName(ele: HTMLElement) {

    while (ele) {

        if (ele.hasAttribute("wrt:c")) {

            return ele.getAttribute("wrt:c");
        }

        ele = ele.parentElement;
    }

    return "";
}
export function getComponentNameFromElement(ele: HTMLElement): string {
    return getRootComponentName(ele);
}



/*
 * ██   ██ ████████ ███    ███ ██          ███    ██  ██████  ██████  ███████ 
 * ██   ██    ██    ████  ████ ██          ████   ██ ██    ██ ██   ██ ██      
 * ███████    ██    ██ ████ ██ ██          ██ ██  ██ ██    ██ ██   ██ █████   
 * ██   ██    ██    ██  ██  ██ ██          ██  ██ ██ ██    ██ ██   ██ ██      
 * ██   ██    ██    ██      ██ ███████     ██   ████  ██████  ██████  ███████                                                                           
 */

export function getValidSelectionsCount(sys: FlameSystem) {

    let count = 0;

    const selections = sys.editor_model.selections;

    for (const sel of selections) {

        if (sel.VALID) count++;


    }

    return count;
}

export function getActiveSelectionsCount(sys: FlameSystem) {

    let count = 0;

    const selections = sys.editor_model.selections;

    for (const sel of selections) {

        if (sel.VALID && sel.ACTIVE) count++;


    }

    return count;
}

export function* getActiveSelections(sys: FlameSystem): Generator<EditorSelection> {

    const selections = sys.editor_model.selections;

    for (const sel of selections) {
        if (sel.ACTIVE && sel.VALID)
            yield sel;
    }
};

export function invalidateSelection(sel: EditorSelection, sys: FlameSystem) {
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

export function invalidateInactiveSelections(sys: FlameSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections)
        if (!sel.ACTIVE && sel.VALID)
            invalidateSelection(sel, sys);


}

export function invalidateAllSelections(sys: FlameSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections)
        invalidateSelection(sel, sys);
}

export function updateSelections(sys: FlameSystem) {
    const selections = sys.editor_model.selections;

    for (const sel of selections)
        //@ts-ignore
        updateSelectionCoords(sel, sys).scheduledUpdate();

    //@ts-ignore
    selections.scheduleUpdate();
}

export function updateActiveSelections(
    sys: FlameSystem
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
    sys: FlameSystem,
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
export function createSelection(sys: FlameSystem): EditorSelection {
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

export function updateSelectionCoords(sel: EditorSelection, sys: FlameSystem): EditorSelection {

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


function getElementInHTMLNamespace(ele: HTMLElement) {
    if (ele.parentNode) {
        const par = ele.parentNode;

        if (par.namespaceURI.includes("html"))
            return ele;

        return getElementInHTMLNamespace(par);
    }

    return null;
}

export function getSelectionFromPoint(x: number, y: number, sys: FlameSystem): EditorSelection {

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


export function getElementFromEvent(event: PointerEvent, sys: FlameSystem): EditorSelection {
    return getSelectionFromPoint(event.x, event.y, sys);
}

export function getIndexOfElementInRTInstance(comp: WickRTComponent, ele: HTMLElement, sys: FlameSystem): number {
    if (comp == sys.harness) {
        for (let i = 0; i < sys.edited_components.components.length; i++)
            if (ele == sys.edited_components.components[i].frame)
                return i;
    } else {
        //@ts-ignore
        return comp.elu.indexOf(ele);
    }
    return -1;
}

export function getElementAtIndexInRTInstance(comp: WickRTComponent, index: number): HTMLElement {
    //@ts-ignore
    return comp.elu[index];
}
export function insertElementAtIndexInRTInstance(comp: WickRTComponent, index: number, ele: HTMLElement, APPEND_TO_ELEMENT: boolean = false) {

    const
        elu = comp.elu,
        target_ele = elu[index],
        parent = target_ele.parentElement;

    if (APPEND_TO_ELEMENT) {
        target_ele.insertBefore(ele, target_ele.firstChild);
        elu.splice(index + 1, 0, ele);
    } else if (index > elu.length) {
        elu.push(ele);
        comp.ele.appendChild(ele);
    } else if (index == 0) {
        elu.unshift(ele);
        comp.ele.insertBefore(ele, comp.ele.firstChild);
    } else {
        elu.splice(index, 0, ele);
        parent.insertBefore(ele, target_ele);
    }
}

export function removeElementAtIndexInRTInstance(comp: WickRTComponent, index: number) {

    const
        elu = comp.elu,
        target_ele = elu[index];

    target_ele.parentElement.removeChild(target_ele);

    elu.splice(index, 1);
}


