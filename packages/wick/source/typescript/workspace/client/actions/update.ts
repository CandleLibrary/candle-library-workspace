import history from "../history.js";
import { Action } from "../types/action.js";
import { ActionType } from "../types/action_type.js";
import { FlameSystem } from "../types/flame_system.js";
import { HistoryState } from "../types/history_state";
import { ObjectCrate } from "../types/object_crate.js";
import { clearRatioMeasure, markRatioMeasure, startRatioMeasure } from "./ratio.js";


export function setState(FORWARD = true, history_state: HistoryState, sys: FlameSystem, POST_UPDATE: boolean = false) {

    const update_components: Set<string> = new Set;

    for (const state of history_state.actions) {

        if (POST_UPDATE && state.DO_NOT_CALL_AFTER_UPDATE)
            continue;

        const handler = action_seal_cache.get(state.type);

        let comp = null;

        if (FORWARD)
            comp = handler.progress(sys, state, FORWARD);
        else
            comp = handler.regress(sys, state, FORWARD);

        for (const name of comp || [])
            update_components.add(name);
    }

    //** APPLY CSS CHANGES

    for (const comp_name of update_components.values()) {

        const LU = new Set();

        const css_string = "";
        //const
        //    comp = getComponentDataFromName(sys, comp_name),
        //    css_string = sys.editor_wick.utils.componentDataToCSS(comp);


        /* 
                for (const rt_comp of
                    (
                        sys.harness.name == comp_name
                            ? [sys.harness]
                            : getRTInstances(sys, comp_name)
                    )
                ) {
        
        
                    const {
                        css_cache: { [comp_name]: { css_ele: ele } },
                        window: { document }
                    } = rt_comp.context;
        
                    if (!ele) {
        
                        const ele = document.createElement("style");
        
                        rt_comp.context.css_cache[comp_name] = ele;
        
                        ele.innerHTML = css_string;
        
                        rt_comp.context.window.document.head.appendChild(ele);
        
                        LU.add(ele);
        
                    } else if (!LU.has(ele)) {
        
                        ele.innerHTML = css_string;
        
                        LU.add(ele);
                    }
                } */
    }

    //*/
}

const action_seal_cache: Map<ActionType, { progress: Action["historyProgress"], regress: Action["historyRegress"]; }> = new Map();

let change_nonce = 0;
export function applyAction(sys: FlameSystem, crates: ObjectCrate[], INITIAL_PASS: boolean = false) {

    if (INITIAL_PASS) {

        sys.pending_history_state = history.ADD_HISTORY_STATE();

        for (const crate of crates) {

            let i = 0;

            for (const action of crate.action_list.sort((a, b) => a < b ? -1 : 1)) {

                if (!action_seal_cache.has(action.type))
                    action_seal_cache.set(action.type, {
                        progress: action.historyProgress,
                        regress: action.historyRegress
                    });

                if (action.setLimits) {
                    const { max_x, max_y, min_x, min_y } = action.setLimits(sys, crate);
                    if (typeof max_x == "number") crate.limits.max_x = Math.min(max_x, crate.limits.max_x);
                    if (typeof min_x == "number") crate.limits.min_x = Math.max(min_x, crate.limits.min_x);
                    if (typeof max_y == "number") crate.limits.max_y = Math.min(max_y, crate.limits.max_y);
                    if (typeof min_y == "number") crate.limits.min_y = Math.max(min_y, crate.limits.min_y);
                }

                const history_artifact = action.initFN(sys, crate);

                if (history_artifact) {
                    if (Array.isArray(history_artifact))
                        sys.pending_history_state.actions.push(...history_artifact);
                }
                i++;
            }
        }
    } else for (const crate of crates) {

        const { max_x, max_y, min_x, min_y } = crate.limits;

        let { dx, dy, abs_x: ax, abs_y: ay } = crate.data;

        let new_val_x = dx + ax;
        let new_val_y = dy + ay;

        if (new_val_x > max_x)
            dx = Math.max(0, max_x - ax);
        else if (ax > max_x)
            dx = Math.min(0, new_val_x - max_x);

        if (new_val_x < min_x)
            dx = Math.min(0, min_x - ax);
        else if (ax < min_x)
            dx = Math.max(0, new_val_x - min_x);

        if (new_val_y > max_y)
            dy = Math.max(0, max_y - ay);
        else if (ay > max_y)
            dy = Math.min(0, new_val_y - max_y);

        if (new_val_y < min_y)
            dy = Math.min(0, min_y - ay);
        else if (ay < min_y)
            dy = Math.max(0, new_val_y - min_y);

        crate.data.dx = dx;
        crate.data.dy = dy;
        crate.data.abs_x = new_val_x;
        crate.data.abs_y = new_val_y;

        for (const action of crate.action_list.sort((a, b) => a < b ? -1 : 1)) {
            let ratio = null;

            if (action.setRatio) {
                const
                    { delta, type, max_level } = action.setRatio(sys, crate);
                ratio = startRatioMeasure(sys, crate, delta, type, max_level);
            }

            let t = 0;

            if (ratio) {
                while (ratio.adjusted_delta !== 0 && t++ < ratio.max_level) {
                    action.updateFN(sys, crate, ratio);
                    crate.css_cache.applyScratchRule(sys, 0);
                    markRatioMeasure(sys, crate, ratio);
                }
            } else action.updateFN(sys, crate, ratio);

            clearRatioMeasure(ratio);
        }
    }

    for (const { css_cache } of crates)
        if (css_cache) css_cache.applyScratchRule(sys, change_nonce);

    change_nonce++;
}

export async function sealAction(sys: FlameSystem, crates: ObjectCrate[]) {

    for (const crate of crates) {

        /* for (const action of crate.action_list.sort((a, b) => a < b ? -1 : 1)) {
            const history_artifact = await action.sealFN(sys, crate);

            if (history_artifact) {
                if (Array.isArray(history_artifact))
                    sys.pending_history_state.actions.push(...history_artifact);
            }
        } */

        /*  if (crate.css_cache) { crate.css_cache.clearChanges(sys); }; */
    }

/*  setState(true, sys.pending_history_state, sys, true); */

/* sys.pending_history_state = null;
} */

/**
 *- nth-child()
 *  Direct attribute
 *
 */