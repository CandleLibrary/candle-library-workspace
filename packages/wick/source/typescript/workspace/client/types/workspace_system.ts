import { CSSNode, CSS_Transform2D } from "@candlelib/css";
import URI from '@candlelib/uri';
import { Session } from '../../common/session.js';
import ActionQueueRunner from '../action_initiators';
import { EditorModel } from "../editor_model";
import { HistoryState } from "./history_state";
import { EditorSelection } from './selection';

export interface StyleData {

    /**
     * The hash name of the component
     * this stylesheet belongs to 
     */
    comp_name: string;

    /**
     * The path to the source file containing
     * the CSS data
     */
    location: URI;

    /**
     * The style AST
     */
    stylesheet: CSSNode;

    /**
     * The index of the stylesheet within the
     * ComponentData~CSS array
     */
    index: number;
}

export interface EditedComponent {
    /**
     * Hash name of the component
     */
    comp: string;
    /**
     * IFrame element the component mounts to
     */
    frame?: HTMLElement;
    /**
     * Optional starting position x
     * 
     * Must be present with all other starting dimensions to have 
     * an effect
     */
    px?: number;
    /**
     * Optional starting position y
     * 
     * Must be present with all other starting dimensions to have 
     * an effect
     */
    py?: number;
    /**
     * Optional starting width
     * 
     * Must be present with all other starting dimensions to have 
     * an effect
     */
    width?: number;
    /**
     * Optional starting height
     * 
     * Must be present with all other starting dimensions to have 
     * an effect
     */
    height?: number;
}

/**
 * Stores state information about the current Flame editing 
 * context. 
 */
export interface WorkspaceSystem {

    /**
     * The websocket connection to the editor server
     */
    session: Session;

    metrics: {
        /**
         * Amount of time taken during the entire call to
         * initFlame;
         */
        startup_time: number,

        /**
         * Amount of time taken during the loading
         * of the wick ui components, including 
         * the harness component. 
         */
        ui_components_load_time: number,

        /**
         * Number of error generated when loading
         * ui components. 
         */
        ui_components_error_count: number;


    },

    /**
     * A Model containing a list of all components actively 
     * edited within the editor context. 
     * 
     * Observable
     */
    edited_components: {
        components: EditedComponent[];
    };

    /**
     * Unique counter to assign component
     * names from. Increment once for each
     * new component created.
     */
    comp_name_counter: number;

    /**
     * Server side root directory to place new 
     * component files in.
     */
    file_dir: string,

    /**
     * Primary model storing information used 
     * by all UI runtime components. 
     * 
     * Observable
     */
    editor_model: EditorModel;

    /*Default extension name to give new components */
    comp_ext: string;

    /**
     * Root component handling all other components edited within 
     * flame */
    harness: WickRTComponent;

    /**
     * Root element containing the actively edited
     * components.
     */
    edit_view: HTMLElement;

    active_selection: EditorSelection;

    pending_history_state: HistoryState;
    text_info: string,
    dx: number,
    dy: number,
    dz: number,
    cx: number,
    cy: number,
    cz: number,
    move_type: string,
    css: any,
    scratch_stylesheet: CSSStyleSheet,
    editor_window: Window,
    editor_document: Document,
    editor_body: HTMLElement,
    editor_head: HTMLElement,
    editor_iframe: HTMLElement;
    flags: {
        CSS_SELECTOR_KEEP_UNIQUE?: boolean;
        DUBUG_DISPLAY_STARTUP_METRICS?: boolean;
    },
    global: {
        default_pos_unit: string;
    },
    ui: {
        event_intercept_frame: HTMLDivElement;
        transform: CSS_Transform2D;
    },
    edit_css: any,
    /**
     * The wick module instance for the Editor interface
     */
    editor_wick: WickLibrary;
    /**
     * The wick module instance for the edited page
     */
    page_wick: WickLibrary,

    action_runner: ActionQueueRunner;
}
