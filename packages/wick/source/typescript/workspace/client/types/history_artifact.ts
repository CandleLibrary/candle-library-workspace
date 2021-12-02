import { ActionType } from "./action_type";

export interface HistoryArtifact {
    type: ActionType;

    /**
     * If set to true, do not call the history progress function
     * of the ActionType after sealing.
     */
    DO_NOT_CALL_AFTER_UPDATE?: boolean;
    progress?: {
        comp_data_name: string;
        ele_index: number,
        valueA?: string | number;
        valueB?: string | number;
        valueC?: string | number;
        valueD?: string | number;
        pos?: any;
    };
    regress?: {
        comp_data_name: string;
        ele_index: number,
        valueA?: string | number;
        valueB?: string | number;
        valueC?: string | number;
        valueD?: string | number;
        pos?: any;
    };
}
