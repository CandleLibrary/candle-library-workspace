import { setState } from "./actions/update.js";
import { WorkspaceSystem } from "./types/workspace_system.js";
import { HistoryState } from "./types/history_state";

export default (function HISTORY() {

    const stack: HistoryState[] = [];
    let pointer = -1;


    return {

        ADD_HISTORY_STATE(): HistoryState {
            const state = <HistoryState>{ actions: [] };

            stack[++pointer] = state;

            return state;
        },

        /**
         * UPDATE the ui state to reflect the 
         * changes made by the active action(s).
         */
        PUSH_EDIT_STATE(action, env) {

        },
        /**
         * Create a change list for the current
         * UI state and apply, pushing the change
         * list to the history stack.
         */
        FREEZE_EDIT_STATE() {

        },
        /**
         * Decrement the history stack pointer 
         * and apply the rollback
         * changes of the change list the pointer is 
         * now at.
         */
        ROLLBACK_EDIT_STATE(system: WorkspaceSystem) {
            if (pointer > -1) {
                const state = stack[pointer];
                setState(false, state, system);
                pointer--;
            }
        },
        /**
         * Increment the history stack pointer
         * and apply the roll-forward
         * changes of the change list the pointer is 
         * now at.
         */
        ROLLFORWARD_EDIT_STATE(system: WorkspaceSystem) {
            if (pointer < stack.length - 1) {
                pointer++;
                const state = stack[pointer];
                setState(true, state, system);
            }

        },

        WriteBack(system: WorkspaceSystem) {
            return;
        }
    };
})();


