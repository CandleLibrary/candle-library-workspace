import { Observable, WickRTComponent } from '../../client/index.js';
import { ObservableScheme } from '../../client/runtime/observable/observable_prototyped.js';
import { WickLibrary } from '../../index.js';
import { EditorSelection } from "./types/selection.js";

export interface DrawObject {
    type: "horizontal_line" | "vertical_line" | "infinite_line" | "box" | "none",
    px1: number;
    px2: number;
    py1: number;
    py2: number;
}


export class PluginFrame {
    name: string;
    src: string;
    private constructor(
        name: string,
        src: string
    ) {
        this.name = name;
        this.src = src;
    }
    static create(
        name: string,
        src: string
    ) {
        return Observable(new PluginFrame(
            name,
            src
        ));
    }
};

export class EditorModel {
    data: any;
    selection_box: any;
    comp: WickRTComponent | null;
    ele: any;
    sc: number;
    selected_comp: WickRTComponent | null;
    //selected_ele: HTMLElement;
    selected_element: HTMLElement | null;
    ACTIONS: any;
    POINTER_DN: boolean;
    selections: EditorSelection[];
    active_plugins: Observable<PluginFrame>[];
    draw_objects: DrawObject[];
    constructor(editor_wick: WickLibrary) {
        this.comp = null;
        this.ele = null;
        this.sc = 0;
        this.selected_comp = null;
        this.selected_element = null;
        this.selection_box = null;
        this.active_plugins = [];
        this.selections = [<EditorSelection><unknown>{
            model: ObservableScheme<EditorSelection>({
                ACTIVE: false,
                VALID: true,
                actual_height: 0,
                actual_left: 0,
                actual_top: 0,
                actual_width: 0,
                component: "",
                ele: null,
                css: null,
                width: 0,
                height: 0,
                left: 0,
                top: 0,
                max_x: 0,
                max_y: 0,
                min_x: 0,
                min_y: 0,
                px: 0,
                py: 0,
                pz: 0,
                rx: 0,
                ry: 0,
                rz: 0,
                sx: 0,
                sy: 0,
                sz: 0,
            })
        }];
        this.POINTER_DN = false;
        this.draw_objects = [<DrawObject><unknown>{
            model: ObservableScheme<DrawObject>({
                px1: 0,
                py1: 0,
                px2: 0,
                py2: 0,
                type: "none"
            })
        }];
    }
};
