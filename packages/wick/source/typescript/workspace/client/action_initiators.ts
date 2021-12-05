import spark, { Sparky } from "@candlelib/spark";
import {
    applyAction
} from "./actions/update.js";
import { getCSSCache } from "./cache/css_cache.js";
import { getActiveSelections, getActiveSelectionsCount, getComponentNameFromElement } from "./common_functions.js";
import { activeSys, active_system as system, revealEventIntercept } from "./system.js";
import { Action } from "./types/action.js";
import { WorkspaceSystem } from "./types/workspace_system.js";
import { ObjectCrate } from "./types/object_crate.js";

/**
 * Collection of functions that can be called by
 * ui-components and event handlers to apply
 * actions to selected elements and components.
 */

let ACTIVE_ACTIONS: Action[] = [], crates: ObjectCrate[];

const action_queue: ActionRef[] = [];

export const enum ActionRefType {
    INIT,

    INIT_UPDATE,
    UPDATE,
    APPLY,
    END,
    START,

}

interface Deltas {
    dx: number;
    dy: number;
    scale: number;
}

interface ActionRef {

    deltas?: Deltas;
    type: ActionRefType;
    actions?: Action[];
    data?: ObjectCrate["data"];
}


export default class ActionQueueRunner implements Sparky {

    sys: WorkspaceSystem;
    queue: ActionRef[];
    _SCHD_: number;
    PENDING: number;

    constructor(sys: WorkspaceSystem) {
        this.sys = sys;
        this._SCHD_ = 0;
        this.queue = [];
        this.PENDING = 0;
    }

    promise_handler() {
        this.PENDING--;
    }

    scheduledUpdate() {
        return this.update();
    }

    update(ref?: ActionRef) {


        if (!ref && this.PENDING > 0)
            return spark.queueUpdate(this);

        ref = ref ?? this.queue.pop();

        if (ref) {

            switch (ref.type) {
                case ActionRefType.INIT:

                    this.PENDING++;

                    INIT_CRATES(this.sys, ref)
                        .finally(this.promise_handler.bind(this));

                    break;
                case ActionRefType.START:

                    __START_ACTION__(this.sys, ref);

                    break;
                case ActionRefType.INIT_UPDATE:

                    UPDATE_ACTION(this.sys, ref, true);

                    break;
                case ActionRefType.UPDATE:

                    UPDATE_ACTION(this.sys, ref, false);

                    break;
                case ActionRefType.APPLY:

                    __APPLY_ACTION__(this.sys, ref);

                    break;
                case ActionRefType.END:

                    this.PENDING++;

                    END_ACTION(this.sys, ref)
                        .finally(this.promise_handler.bind(this));

                    break;
            }

            if (this.PENDING)
                spark.queueUpdate(this);
            else if (this.queue.length > 0)
                return this.scheduledUpdate();
        }

    }

    addAction(
        type: ActionRefType,
        actions?: Action[],
        data?: ObjectCrate["data"]
    ) {

        const ref = {
            type,
            data,
            actions,
            deltas: {
                dx: this.sys.dx,
                dy: this.sys.dy,
                scale: this.sys.ui.transform.scale
            }
        };
        if (
            type == ActionRefType.START
            ||
            type == ActionRefType.APPLY
            ||
            (this.queue.length == 0 && this.PENDING < 1)
        ) {
            this.update(ref);
        } else {
            this.queue.unshift(ref);
            spark.queueUpdate(this);
        }
    }
};


/**
 * Calls actions and seals it in one step. Use when elements values need to updated
 * without continuous user input (such as with a click-&-drag action).
 * @param actions 
 * @param data 
 */
export function APPLY_ACTION(sys: WorkspaceSystem, actions: Action[], data: ObjectCrate["data"]) {
    sys.action_runner.addAction(ActionRefType.APPLY, actions, data);
}
export function __APPLY_ACTION__(
    sys: WorkspaceSystem,
    ref: ActionRef,
) {

    const { actions, data } = ref;

    const { editor_model } = sys;

    editor_model.POINTER_DN = true;

    //Make sure all actions in slug are actions.
    //arrange the actions based on their ordering precedence

    const sabot = actions
        .filter(a => typeof a == "object"
            && typeof a.type == "number"
            && typeof a.priority == "number")
        .sort((a, b) => a.priority > b.priority ? -1 : 1);

    if (sabot.length !== actions.length) {
        ACTIVE_ACTIONS = [];
    } else {
        ACTIVE_ACTIONS = sabot;
    }

    sys.action_runner.addAction(
        ActionRefType.INIT_UPDATE,
        undefined,
        data
    );

    sys.action_runner.addAction(
        ActionRefType.END
    );
}

export function START_ACTION(
    sys,
    actions?: Action[],
    data?: ObjectCrate["data"]
) {
    sys.action_runner.addAction(
        ActionRefType.START,
        actions,
        data
    );
}

export function __START_ACTION__(
    sys: WorkspaceSystem,
    ref: ActionRef,
) {

    const {
        actions,
        data
    } = ref;

    //Enable event intercept object.
    revealEventIntercept(sys);

    //Make sure all actions in slug are actions.
    //arrange the actions based on their ordering precedence

    const sabot = actions
        .filter(a => typeof a == "object"
            && typeof a.type == "number"
            && typeof a.priority == "number")
        .sort((a, b) => a.priority > b.priority ? -1 : 1);

    if (sabot.length !== actions.length) {
        ACTIVE_ACTIONS.length = 0;
    } else {

        ACTIVE_ACTIONS.length = sabot.length;

        let i = 0;

        for (const action of sabot)
            ACTIVE_ACTIONS[i++] = action;
    }

    action_queue.push({
        type: ActionRefType.INIT,
        data,
    }, {
        type: ActionRefType.INIT_UPDATE,
        data
    });

    sys.action_runner.addAction(
        ActionRefType.INIT,
        undefined,
        data
    );

    sys.action_runner.addAction(
        ActionRefType.INIT_UPDATE,
        undefined,
        data
    );
}

async function INIT_CRATES(
    sys: WorkspaceSystem,
    ref: ActionRef
) {
    const { data } = ref;

    if (!crates) { //TODO Setup crate information for each selected object.

        crates = [];

        if (getActiveSelectionsCount(sys) == 0) {
            const crate: ObjectCrate = {
                comp: "",
                sel: null,
                css_cache: null,
                html_cache: null,
                limits: {
                    min_x: -Infinity,
                    max_x: Infinity,
                    min_y: -Infinity,
                    max_y: Infinity,
                },
                data: Object.assign({
                    abs_x: 0,
                    abs_y: 0,
                    curr_comp: "",
                    data: "",
                }, data || {}),
                action_list: ACTIVE_ACTIONS.slice(),
                ratio_list: []
            };

            crates.push(crate);
        } else {

            for (const sel of getActiveSelections(sys)) {

                const { ele } = sel,

                    comp = getComponentNameFromElement(ele),

                    crate: ObjectCrate = {
                        sel,
                        comp,
                        css_cache: null,
                        html_cache: null,
                        limits: {
                            min_x: -Infinity,
                            max_x: Infinity,
                            min_y: -Infinity,
                            max_y: Infinity,
                        },
                        data: Object.assign({
                            abs_x: 0,
                            abs_y: 0,
                            curr_comp: comp,
                            data: "",
                        }, data || {}),
                        action_list: ACTIVE_ACTIONS.slice(),
                        ratio_list: []
                    };

                crate.css_cache = getCSSCache(system, ele);

                await crate.css_cache.load;

                crate.html_cache = null;

                crates.push(crate);
            }
        }
    }
}
export function areActionsRunning() { return (ACTIVE_ACTIONS.length > 0); }

export function UPDATE_ACTION(
    sys: WorkspaceSystem,
    ref: ActionRef,
    INITIAL_PASS = false
): boolean {

    if (!areActionsRunning()) return false;

    const scale = 1;

    const { dx, dy } = ref.deltas;

    let adx = dx / scale, ady = dy / scale;

    for (const crate of crates) {
        crate.data.dx = adx;
        crate.data.dy = ady;
    }

    applyAction(system, crates, INITIAL_PASS);

    for (const crate of crates) {
        crate.data.dx = 0;
        crate.data.dy = 0;
    }

    return true;
}

export async function END_ACTION(
    sys: WorkspaceSystem,
    ref: ActionRef,
    INITIAL_PASS = false
) {

    if (!areActionsRunning()) return false;

    const { editor_model } = activeSys();

    editor_model.POINTER_DN = false;

    ACTIVE_ACTIONS.length = 0;

    crates = null;

    return true;
}

