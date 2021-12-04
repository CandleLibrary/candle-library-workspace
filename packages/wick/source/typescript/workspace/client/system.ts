
import { Logger } from '@candlelib/log';
import { EditorCommand } from "../../types/editor_types.js";
import { PatchType } from "../../types/patch";
import ActionQueueRunner from './action_initiators.js';
import { createSelection, getRuntimeComponentsFromName, updateActiveSelections } from './common_functions.js';
import { EditorModel } from "./editor_model.js";
import { Session } from '../common/session.js';
import { EditedComponent, FlameSystem } from "./types/flame_system.js";
import { WickLibrary } from '../../index.js';
import { WickRTComponent } from "../../client/runtime/component/component.js";

const patch_logger = Logger.get("flame").get("patcher").activate();
export function revealEventIntercept(sys: FlameSystem) {
    const { ui: { event_intercept_frame: event_intercept_ele } } = sys;
    event_intercept_ele.style.zIndex = "100000";
}

export function hideEventIntercept(sys: FlameSystem) {
    const { ui: { event_intercept_frame: event_intercept_ele } } = sys;
    event_intercept_ele.style.zIndex = "";
}
export var active_system: FlameSystem | null = null;
export function activeSys() { return active_system; }

export function CreateTimeStamp(): number { return window.performance.now(); }

export function GetElapsedTimeSinceStamp(stamp: number): number { return window.performance.now() - stamp; };

export function GetElapsedTimeSinceStampInSeconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) / 1000; };

export function GetElapsedTimeSinceStampInMilliseconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) / 1; };

export function GetElapsedTimeSinceStampInMicroSeconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) * 1000; };

export function GetElapsedTimeSinceStampInNanoSeconds(stamp: number): number { return GetElapsedTimeSinceStamp(stamp) * 1000000; };

export function initSystem(
    ws_uri: string,
    page_wick?: WickLibrary,
    editor_wick?: WickLibrary,
    edit_css?: any,
    editor_window?: Window,
    editor_frame?: HTMLElement
): FlameSystem {

    if (active_system) return active_system;

    active_system = <FlameSystem>{

        active_selection: null,

        session: new Session(ws_uri),

        metrics: {
            startup_time: 0,
            ui_components_error_count: 0,
            ui_components_load_time: 0
        },

        comp_name_counter: 0,

        edit_view: null,

        editor_model: editor_wick.objects.Observable<EditorModel>(new EditorModel(editor_wick)),
        text_info: "",
        file_dir: ".",
        comp_ext: ".wick",

        harness: null,

        //Move these to ui
        dx: 0,
        dy: 0,
        dz: 0,
        cx: 0,
        cy: 0,
        cz: 0,
        move_type: "relative",
        //End move

        action_runner: null,
        pending_history_state: null,
        scratch_stylesheet: null,
        editor_window: editor_window,
        editor_document: editor_window.document,
        editor_body: editor_window.document.body,
        editor_head: editor_window.document.head,
        editor_iframe: editor_frame,
        edited_components: editor_wick.objects.Observable({
            components: [<EditedComponent><unknown>{
                model: editor_wick.objects.ObservableScheme<EditedComponent>({
                    comp: "",
                    frame: null,
                    height: 0,
                    px: 0,
                    py: 0,
                    width: 0
                })
            }]
        }),
        page_wick,
        css: edit_css,
        flags: { CSS_SELECTOR_KEEP_UNIQUE: true },
        global: { default_pos_unit: "px" },
        ui: {
            event_intercept_frame: null,
            transform: new Proxy(
                new edit_css.CSS_Transform2D, {
                set: (obj, prop, val) => {
                    obj[prop] = val;
                    if (active_system.edit_view)
                        active_system.edit_view.style.transform = obj.toString();
                    return true;
                }
            })
        },
        edit_css,
        editor_wick
    };

    active_system.active_selection = createSelection(active_system);

    active_system.action_runner = new ActionQueueRunner(active_system);

    const scratch_sheet = document.createElement("style");

    scratch_sheet.id = "flame-scratch-sheet";

    document.body.appendChild(scratch_sheet);

    active_system.scratch_stylesheet = scratch_sheet.sheet;

    initializeDefualtSessionDispatchHandlers(active_system.session, page_wick, active_system);

    return active_system;
}

function initializeDefualtSessionDispatchHandlers(
    session: Session,
    page_wick: WickLibrary,
    system: FlameSystem
) {

    session.setHandler(EditorCommand.UPDATED_COMPONENT, (command, session) => {
        const { new_name, old_name, path } = command;


        // Identify all top_level components that need to be update. 
        const matches = getRuntimeComponentsFromName(old_name, page_wick);

        if (matches.length > 0)
            session.send_command({ command: EditorCommand.GET_COMPONENT_PATCH, to: new_name, from: old_name });
    });


    session.setHandler(EditorCommand.APPLY_COMPONENT_PATCH, (command, session) => {

        const patch = command.patch;

        if (patch == undefined)
            patch_logger.error(`Could not respond to PATCH command. Patch object is undefined`);
        else try {
            switch (patch.type) {

                case PatchType.CSS: {

                    const { to, from, style } = patch;

                    const matches = getRuntimeComponentsFromName(from, page_wick);

                    updateCSSReferences(page_wick.rt.context, from, to, matches, style);

                    patch_logger.debug(`Applying CSS patch: [ ${from} ]->[ ${to} ] to ${matches.length} component${matches.length == 1 ? "" : "s"}`);

                    if (to != from)
                        for (const match of matches) {
                            applyToPatchToRuntimeComp(match, to);
                        }

                } break;


                case PatchType.STUB: {

                    const { to, from } = patch;

                    const matches = getRuntimeComponentsFromName(from, page_wick);

                    patch_logger.debug(`Applying STUB patch: [ ${from} ]->[ ${to} ] to ${matches.length} component${matches.length == 1 ? "" : "s"}`);

                    if (to != from) {

                        //updateCSSReferences(page_wick.rt.context, from, to, matches);

                        for (const match of matches)
                            applyToPatchToRuntimeComp(match, to);
                    }

                } break;

                case PatchType.TEXT: {

                    const { to, from, patches } = patch;

                    const matches = getRuntimeComponentsFromName(from, page_wick);

                    updateCSSReferences(page_wick.rt.context, from, to, matches);

                    patch_logger.debug(`Applying TEXT patch: [ ${from} ]->[ ${to} ] to ${matches.length} component${matches.length == 1 ? "" : "s"}`);

                    for (const match of matches) {
                        if (to != from)
                            applyToPatchToRuntimeComp(match, to);

                        const ele = match.ele;

                        let eles = [ele];

                        for (const patch of patches) {

                            for (const ele of eles) {
                                if (ele instanceof Text) {
                                    if (ele.data.trim() == patch.from.trim()) {
                                        ele.data = patch.to;
                                        break;
                                    }
                                }

                                for (const child of Array.from(ele.childNodes)) {
                                    eles.push(<any>child);
                                }
                            }
                        }
                    }

                    updateActiveSelections(system);
                } break;

                case PatchType.REPLACE: {

                    const { to, from, patch_scripts } = patch;

                    //Install the patches
                    const classes: typeof WickRTComponent[] = patch_scripts.map(
                        patch => Function("wick", "logger", patch)(page_wick, patch_logger)
                    );

                    const class_ = classes[0];
                    const matches = getRuntimeComponentsFromName(from, page_wick);

                    patch_logger.debug(`Transitioning [ ${from} ] to [ ${to} ]. ${matches.length} component${matches.length == 1 ? "" : "s"} will be replaced.`);


                    for (const match of matches) {

                        // Do some patching magic to replace the old component 
                        // with the new one. 
                        const ele = match.ele;
                        const par_ele = ele.parentElement;
                        const par_comp = match.par;

                        const new_component = new class_(
                            null,
                            undefined,
                            [],
                            "",
                            page_wick.rt.context
                        );

                        if (par_ele)
                            par_ele.replaceChild(new_component.ele, ele);

                        if (par_comp) {

                            const index = par_comp.ch.indexOf(match);

                            if (index >= 0) {
                                par_comp.ch.splice(index, 1, new_component);
                                new_component.par = par_comp;
                            }

                            match.par = null;
                        }

                        new_component.initialize(match.model);

                        match.disconnect();
                        match.destructor();

                        if (removeRootComponent(match, page_wick))
                            addRootComponent(new_component, page_wick);
                    }
                }
            }
        } catch (e) {
            patch_logger.error(e);
        }
    });
}



function applyToPatchToRuntimeComp(match: WickRTComponent, to: string) {
    match.name = to;
    match.ele.dataset.wrtc = to;
}

function updateCSSReferences(
    context: Context,
    from: string,
    to: string,
    matches: WickRTComponent[],
    style: string = "",
) {
    if (matches) for (const match of matches)
        match.ele.classList.add(to);

    const old_css = context.css_cache.get(from);

    if (old_css) {
        if (style)
            old_css.css_ele.innerHTML = style;
        else
            old_css.css_ele.innerHTML = old_css.css_ele.innerHTML.replace(new RegExp(from, "g"), to);
        context.css_cache.delete(from);
        context.css_cache.set(to, old_css);
    } else if (style) {
        const css_ele = document.createElement("style");
        css_ele.innerHTML = style;
        document.head.appendChild(css_ele);
        context.css_cache.set(to, { css_ele, count: matches.length });
    }

    if (matches) for (const match of matches) {
        const class_name = Array.from(match.ele.classList);

        for (const css of class_name) {
            if (css != to && String_Is_Wick_Hash_ID(css))
                match.ele.classList.remove(css);
        }
    }
}

const comp_name_regex = /W[_\$a-zA-Z0-9]+/;
export function String_Is_Wick_Hash_ID(str): boolean {
    return !!str.match(comp_name_regex);
}

export function removeRootComponent(comp: WickRTComponent, wick: WickLibrary): boolean {

    const index = wick.rt.root_components.indexOf(comp);

    if (index >= 0)
        wick.rt.root_components.splice(index, 1);

    return index >= 0;

}

export function addRootComponent(comp: WickRTComponent, wick: WickLibrary) {

    wick.rt.root_components.push(comp);
}