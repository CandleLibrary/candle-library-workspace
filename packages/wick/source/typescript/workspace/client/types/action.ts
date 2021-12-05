import { noop } from "../actions/common.js";
import { RatioMarker } from "../actions/ratio.js";
import { ActionType } from "./action_type";
import { WorkspaceSystem } from "./workspace_system.js";
import { HistoryArtifact } from "./history_artifact";
import { ObjectCrate } from "./object_crate.js";
export interface Action {
    type: ActionType,

    /**
     * Order in which to call Actions, with actions
     * with lower priority values being called first.
     */
    priority?: number;

    setLimits?: (sys: WorkspaceSystem, crate: ObjectCrate) => {
        min_x?: number,
        max_x?: number,
        min_y?: number,
        max_y?: number,
    };
    /**
     * Assign value to the ratio marker
     */
    setRatio?: ((sys: WorkspaceSystem, crate: ObjectCrate) => {
        delta?: number, type?: string, max_level?: 1 | 2 | 3 | 4;
    }) | null;

    /**
     * Called when an action set is first registered
     */
    initFN: ((sys: WorkspaceSystem, crate: ObjectCrate) => HistoryArtifact[] | void) | typeof noop;
    updateFN: ((sys: WorkspaceSystem, crate: ObjectCrate, adjust_marker: RatioMarker, val?: number | boolean) => any) | typeof noop;
    sealFN: ((sys: WorkspaceSystem, crate: ObjectCrate) => Promise<HistoryArtifact[] | void>) | typeof noop;
    //historyProgress(sys: FlameSystem, history: HistoryArtifact, FORWARD: boolean): string[] | void;
    //historyRegress(sys: FlameSystem, history: HistoryArtifact, FORWARD: boolean): string[] | void;

}
