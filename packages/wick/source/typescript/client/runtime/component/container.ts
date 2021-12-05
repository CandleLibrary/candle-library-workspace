import { Transition } from "@candlelib/glow";
import spark, { Sparky } from "@candlelib/spark";
import { WickRTComponent } from "./component.js";
import { ObservableModel, ObservableWatcher } from "../../../types/model";
import { hydrateComponentElements } from "./html.js";
import { rt } from "../global.js";

function getColumnRow(index: number, offset: number, set_size: number) {
    const adjusted_index = index - offset * set_size;
    const row = Math.floor(adjusted_index / set_size);
    const col = (index) % (set_size);
    return { row, col };
}

//Poly fill for transitions if glow is not included
function createTransition(val?: boolean): Transition {
    //@ts-ignore
    if (!globalThis["glow"]) {
        const trs = { add: () => null, addEventListener: (n: any, v: any) => v() };

        return <any>{
            in: trs, out: trs, play: () => null, addEventListener: (<any>((n: any, v: any) => { v(); }))
        };
    }//@ts-ignore
    else return globalThis["glow"].createTransition(val);
}

interface WindowData {
    limit: number;
    offset: number;
    active_window_start: number;
    output_length: number,
    upper_bound: number;
    direction: number,
    DESCENDING: boolean;
}

const enum TransitionType {
    OUT = 0,
    IN = 1,
    ARRANGE = 2
}


type ContainerComponent = WickRTComponent & { index: number; container_model: any; _TRANSITION_STATE_: boolean; container: WickContainer; };

const component_attributes_default: [string?, string?][][] = [[[]]];

/**
 * ScopeContainer provide the mechanisms for dealing with lists and sets of components. 
 *
 * @param      {Scope}  parent   The Scope parent object.
 * @param      {Object}  data     The data object hosting attribute properties from the HTML template. 
 * @param      {Object}  context  The global context object.
 * @param      {HTMLElement}  element  The element that the Scope will _bind_ to. 
 */
export class WickContainer implements Sparky, ObservableWatcher {

    /**
     * Scrub offset
     */

    /**
     * The index of the first active component when multiplied with shift_amount
     *  
     * The index of the first component in a window will be 
     * offset * shift
     */
    offset: number;
    /**
     * The number of component that will be skipped per unit of offset
     */
    columns: number;
    // Scrubbing only
    offset_diff: number;
    // Scrubbing only
    offset_fractional: number;
    // Scrubbing only
    scrub_velocity: number;
    drag: number;
    max: number;

    _SCHD_: number;

    /**
     * Number of components to display from full active set
     */
    limit: number;

    /**
     * HTML Element bound to the container. 
     */
    ele: HTMLElement;



    transition_list: { comp: ContainerComponent; TYPE: TransitionType, row: number, col: number, DESCENDING: boolean; }[];

    /**
     * Components that are currently mounted to the main DOM
     */
    mounted_comps: ContainerComponent[];

    /**
     * Components that meet the filtering requirements and can 
     * be mounted to DOM. 
     * 
     * The components in this array may differ from those in `mounted_comps` 
     * if `limit` property is used, which causes a subset of `active_comps` 
     * to be mounted and pushed to `mounted_comps`.
     */
    active_comps: ContainerComponent[];

    /**
     * One component per model is created and stored within this 
     * property. 
     */
    comps: ContainerComponent[];

    dom_dn: ContainerComponent[];
    dom_up: ContainerComponent[];

    components_pending_removal: ContainerComponent[];

    filters: any[];

    comp_constructors: typeof WickRTComponent[];
    comp_attributes: [string?, string?][][];

    evaluators: ((m: any) => boolean)[];

    /**
     * Glow transition for elements with low index values increasing to high index values.
     */
    trs_ascending: any;

    /**
     * Glow transition for elements with high index values decreasing to low index values.
     */
    trs_descending: any;

    /**
     * True if any sub-component ele has been mounted to the DOM.
     */
    NULL_ELEMENT_DISCONNECTED: boolean;
    UPDATE_FILTER: boolean;
    DOM_UP_APPENDED: boolean;
    DOM_DN_APPENDED: boolean;
    AUTO_SCRUB: boolean;
    LOADED: boolean;
    SCRUBBING: boolean;

    //Replaces the element with sub-component elements if true.
    USE_NULL_ELEMENT: boolean;

    parent: WickRTComponent;

    container_model: any | ObservableModel;

    filter: null | ((...args: any[]) => boolean);
    sort: null | ((...args: any[]) => number);

    /**
     * Used with element-less containers. The first component element mounted to the DOM.
     * null if no components are mounted
     */
    first_dom_element: null | HTMLElement;
    /**
     * Used with element-less containers. The last component element mounted to the DOM
     * null if no components are mounted
     */
    last_dom_element: null | HTMLElement;

    constructor(
        component_constructors: typeof WickRTComponent[],
        component_attributes: [string, string][][],
        element: HTMLElement,
        parent_comp: WickRTComponent,
        null_elements: HTMLElement[] = []
    ) {

        this.comp_constructors = component_constructors;
        this.comp_attributes = component_attributes || component_attributes_default;

        this.active_comps = [];
        this.mounted_comps = [];
        this.filters = [];
        this.comps = [];

        this.dom_dn = [];
        this.dom_up = [];
        this.evaluators = Array(component_constructors.length);
        this.transition_list = [];

        this._SCHD_ = 0;
        this.columns = 1;
        this.limit = Infinity;
        this.offset = 0;
        this.offset_diff = 0;
        this.offset_fractional = 0;
        this.scrub_velocity = 0;
        this.drag = 0.5;

        this.max = 0;
        this.trs_ascending = null;
        this.trs_descending = null;
        this.USE_NULL_ELEMENT = false;
        this.NULL_ELEMENT_DISCONNECTED = false;
        this.UPDATE_FILTER = false;
        this.DOM_UP_APPENDED = false;
        this.DOM_DN_APPENDED = false;
        this.AUTO_SCRUB = false;
        this.LOADED = false;
        this.SCRUBBING = false;

        this.container_model = null;

        this.parent = parent_comp;

        this.filter = null;//m1 => true;
        this.sort = null;//() => 0; 

        this.first_dom_element = null;
        this.last_dom_element = null;
        this.components_pending_removal = [];
        this.ele = element;

        if (null_elements.length > 0 || this.ele.tagName == "NULL") {

            this.USE_NULL_ELEMENT = true;

            if (null_elements.length > 0) {

                this.NULL_ELEMENT_DISCONNECTED = true;

                if (this.ele.parentElement)
                    this.ele.parentElement.removeChild(this.ele);

                this.first_dom_element = null_elements[0];
                this.last_dom_element = null_elements[null_elements.length - 1];

                for (const comp of hydrateComponentElements(null_elements)) {
                    //comp.par = parent_comp;
                    comp.connect();
                    this.active_comps.push(<ContainerComponent>comp);
                    this.comps.push(<ContainerComponent>comp);
                    this.mounted_comps.push(<ContainerComponent>comp);
                }
            }
        } else {

            if (this.ele.tagName == "TABLE") {
                // Some browsers automatically insert tbody in table elements
                // which will break hydration. This will map containers element
                // reference to that tbody, which swill contain the real containers
                // children
                if (this.ele.firstElementChild && this.ele.firstElementChild.tagName == "TBODY")
                    this.ele = <HTMLElement>this.ele.firstElementChild;
            }

            if (this.ele.childElementCount > 0) {
                for (const comp of hydrateComponentElements(Array.from(<HTMLElement[]><any>this.ele.children))) {
                    comp.par = parent_comp;
                    comp.connect();
                    this.active_comps.push(<ContainerComponent>comp);
                    this.comps.push(<ContainerComponent>comp);
                    this.mounted_comps.push(<ContainerComponent>comp);
                }
            }
        }
    }

    destructor() {

        this.filter_new_items();

        if (this.container_model && this.container_model.OBSERVABLE)
            this.container_model.unsubscribe(this);
    }


    /**
     * Called by component when container data should be set.
     * @param container 
     */
    sd(container: any[] | ObservableModel) {

        if (!container) return;

        //@ts-ignore
        if (container.OBSERVABLE) {

            const ctr: ObservableModel = <ObservableModel>container;

            ctr.subscribe(this);
        } else {
            if (Array.isArray(container))
                this.filter_new_items(container);
            else
                this.filter_new_items(container.data);
        }

        this.setLoadedFlag();
    }

    removeModel() { }

    onModelUpdate(container: ObservableModel) {
        this.filter_new_items(container.data);
    }

    setLoadedFlag() {
        if (!this.LOADED)
            this.LOADED = true;
    }

    forceMount() {
        const
            active_window_size = this.limit,
            offset = this.offset,
            min = Math.min(offset + this.offset_diff, offset) * this.columns,
            max = Math.max(offset + this.offset_diff, offset) * this.columns + active_window_size,
            output_length = this.active_comps.length;

        let i = min;

        this.ele.innerHTML = "";
        this.mounted_comps.length = 0;

        while (i < max && i < output_length) {
            const node = this.active_comps[i++];
            this.mounted_comps.push(node);
            this.append(node);
        }
    }

    /**
     * Scrub provides a mechanism to scroll through components of a container that have been limited through the limit filter.
     * @param  {Number} scrub_amount [description]
     */
    scrub(scrub_delta: number, SCRUBBING = true) {

        const w_data = this.getWindowData();

        if (w_data.limit == 0) {
            this.SCRUBBING = false;
            return;
        }

        // scrub_delta is the relative amount of change from the previous offset. 

        if (!this.SCRUBBING)
            this.arrangeScrub(w_data, this.active_comps);


        this.SCRUBBING = true;

        if (this.AUTO_SCRUB && !SCRUBBING && scrub_delta != Infinity) {
            this.scrub_velocity = 0;
            this.AUTO_SCRUB = false;
        }

        let delta_offset = scrub_delta + this.offset_fractional;

        if (scrub_delta !== Infinity) {

            if (Math.abs(delta_offset) > 1) {
                if (delta_offset > 0) {
                    delta_offset = delta_offset % 1;
                    this.offset_fractional = delta_offset;
                    this.scrub_velocity = scrub_delta;

                    if (this.offset < this.max)
                        this.trs_ascending.step(1);

                    this.offset++;
                    this.offset_diff = 1;

                    this.mutateDOM(this.getWindowData(), null, this.active_comps, true).step(1).issueStopped();
                    this.arrangeScrub(w_data, this.active_comps);
                } else {
                    delta_offset = delta_offset % 1;
                    this.offset_fractional = delta_offset;
                    this.scrub_velocity = scrub_delta;

                    if (this.offset >= 1)
                        this.trs_descending.step(1);
                    this.offset--;
                    this.offset_diff = -1;

                    this.mutateDOM(this.getWindowData(), null, this.active_comps, true).step(1).issueStopped();
                    this.arrangeScrub(w_data, this.active_comps);
                }

            }

            //Make Sure the the transition animation is completed before moving on to new animation sequences.

            if (delta_offset > 0) {

                if (this.offset + delta_offset >= this.max - 1) delta_offset = 0;

                if (!this.DOM_UP_APPENDED) {

                    for (let i = 0; i < this.dom_up.length; i++) {
                        this.append(this.dom_up[i]);
                        this.dom_up[i].index = -1;
                        this.mounted_comps.push(this.dom_up[i]);
                    }

                    this.DOM_UP_APPENDED = true;
                }

                this.trs_ascending.play(delta_offset);
            } else {

                if (this.offset < 1) delta_offset = 0;

                if (!this.DOM_DN_APPENDED) {

                    for (let i = 0; i < this.dom_dn.length; i++) {
                        this.append(this.dom_dn[i], this.mounted_comps[0].ele);
                        this.dom_dn[i].index = -1;
                    }

                    this.mounted_comps = this.dom_dn.concat(this.mounted_comps);

                    this.DOM_DN_APPENDED = true;
                }

                this.trs_descending.step(-delta_offset);
            }

            this.offset_fractional = delta_offset;
            this.scrub_velocity = scrub_delta;

            return true;
        } else {

            // Velocity Physics

            if (Math.abs(this.scrub_velocity) > 0.0001) {
                const sign = Math.sign(this.scrub_velocity);

                if (Math.abs(this.scrub_velocity) < 0.1) this.scrub_velocity = this.drag * 0.2 * sign;
                if (Math.abs(this.scrub_velocity) > 0.5) this.scrub_velocity = this.drag * sign;

                this.AUTO_SCRUB = true;

                //Determine the distance traveled with normal drag decay
                let dist = this.scrub_velocity * (1 / (-this.drag + 1));

                //get the distance to nearest page given the distance traveled
                let nearest = (this.offset + this.offset_fractional + dist);

                nearest = (this.scrub_velocity > 0) ? Math.min(this.max, Math.ceil(nearest)) : Math.max(0, Math.floor(nearest));

                //get the ratio of the distance from the current position and distance to the nearest 
                let nearest_dist = nearest - (this.offset + this.offset_fractional);
                let drag = Math.abs(1 - (1 / (nearest_dist / this.scrub_velocity)));

                this.drag = drag;
                this.scrub_velocity = this.scrub_velocity;
                this.SCRUBBING = true;
                spark.queueUpdate(this);
                return true;
            } else {
                this.offset += Math.round(this.offset_fractional);
                this.scrub_velocity = 0;
                this.offset_fractional = 0;
                this.mutateDOM(this.getWindowData(), null, this.active_comps, true).step(1).issueStopped();
                this.SCRUBBING = false;
                return false;
            }
        }
    }

    arrangeScrub(w_data: WindowData, output = this.active_comps) {

        let { limit, offset, output_length, active_window_start } = w_data,
            active_window_size = this.limit;

        if (active_window_size > 0) {

            this.columns = Math.max(1, Math.min(active_window_size, this.columns));

            let
                i = 0,
                oa = 0;

            const
                ein = [],
                shift_points = Math.ceil(output_length / this.columns);

            this.max = shift_points - 1;
            offset = Math.max(0, Math.min(shift_points - 1, offset));

            // Two transitions to support scrubbing from an offset in either direction
            this.trs_ascending = createTransition(false);
            this.trs_descending = createTransition(false);

            //
            this.dom_dn.length = 0;
            this.dom_up.length = 0;
            this.DOM_UP_APPENDED = false;
            this.DOM_DN_APPENDED = false;

            // Scopes proceeding the transition window
            while (i < active_window_start - this.columns) output[i++].index = -2;

            //Scopes entering the transition window ascending
            while (i < active_window_start) {
                this.dom_dn.push(output[i]);
                const { row, col } = getColumnRow(i, offset - 1, this.columns);

                output[i].transitionIn(row, col, true, this.trs_descending);
                output[i++].index = -2;
            }

            //Scopes in the transition window
            while (i < active_window_start + active_window_size && i < output_length) {
                //Scopes on the descending edge of the transition window
                if (oa < this.columns && ++oa) {
                    const { row, col } = getColumnRow(i, offset + 1, this.columns);
                    output[i].transitionOut(row, col, true, this.trs_descending);
                } else {
                    const { row, col } = getColumnRow(i, offset + 1, this.columns);
                    output[i].transitionIn(row, col, false, this.trs_ascending);
                }

                //Scopes on the ascending edge of the transition window
                if (i >= active_window_start + active_window_size - this.columns) {
                    const { row, col } = getColumnRow(i, offset - 1, this.columns);
                    output[i].transitionOut(row, col, true, this.trs_descending);
                }
                else {
                    const { row, col } = getColumnRow(i, offset - 1, this.columns);
                    output[i].arrange(row, col, this.trs_descending);
                }

                output[i].index = i;
                ein.push(output[i++]);
            }

            //Scopes entering the transition window while offset is descending
            while (i < active_window_start + active_window_size + this.columns && i < output_length) {
                this.dom_up.push(output[i]);
                const { row, col } = getColumnRow(i, offset + 1, this.columns);
                output[i].transitionIn(row, col, false, this.trs_ascending);
                output[i++].index = -3;
            }

            //Scopes following the transition window
            while (i < output_length) output[i++].index = -3;

            output = ein;
            output_length = ein.length;
        } else {
            this.max = 0;
            this.limit = 0;
        }
    }
    /**
     * Prepares a component to be transitioned in, out, or to a new position in the container. 
     * If the component is to be transitioned out, then the component will be added to the 
     * components_pending_removal list which will allow them to be removed completely from the 
     * main DOM when the transition is completed.  
     */
    prepareTransitioningComp(
        comp: ContainerComponent,
        TYPE: TransitionType,
        DESCENDING: boolean,
        row: number,
        col: number
    ) {

        if (TYPE == TransitionType.OUT) {
            comp.par = null;
            this.components_pending_removal.push(comp);
        } else comp.par = this.parent;

        this.transition_list.push({
            comp,
            TYPE,
            DESCENDING,
            row,
            col,
        });
    }


    private getWindowData(output = this.active_comps): WindowData {

        const
            limit = this.limit,
            offset = this.offset,
            output_length = output.length,
            active_window_start = Math.max(0, offset * this.columns),
            upper_bound = Math.min(active_window_start + limit, output_length),
            direction = Math.sign(this.offset_diff),
            DESCENDING = direction < 0;

        return {
            limit,
            offset,
            output_length,
            active_window_start,
            upper_bound,
            direction,
            DESCENDING
        };
    }


    arrange(w_data: WindowData, output = this.active_comps, transition = createTransition()) {

        const { limit, offset, output_length, active_window_start, upper_bound, DESCENDING } = w_data;

        //Arranges active scopes according to their arrange handler.

        let i = 0;

        while (i < active_window_start && i < output_length) {

            if (output[i].CONNECTED) {
                const { row, col } = getColumnRow(i, offset, this.columns);
                this.prepareTransitioningComp(output[i], TransitionType.OUT, DESCENDING, row, col);

            }

            i++;
        }

        while (i < upper_bound) {

            const { row, col } = getColumnRow(i, offset, this.columns);

            if (output[i].CONNECTED)
                this.prepareTransitioningComp(output[i], TransitionType.ARRANGE, DESCENDING, row, col);
            else
                this.prepareTransitioningComp(output[i], TransitionType.IN, DESCENDING, row, col);
            i++;
        }

        while (i < output_length) {

            if (output[i].CONNECTED) {
                const { row, col } = getColumnRow(i, offset, this.columns);
                this.prepareTransitioningComp(output[i], TransitionType.OUT, DESCENDING, row, col);
            }
            i++;
        }
    }

    private updateRefs(w_data: WindowData, output: ContainerComponent[]) {

        const { limit, offset, output_length, active_window_start, upper_bound, direction } = w_data;

        this.ele.style.position = this.ele.style.position;

        if (this.USE_NULL_ELEMENT && this.NULL_ELEMENT_DISCONNECTED && upper_bound - active_window_start == 0) {
            this.mounted_comps[0].ele.parentElement.insertBefore(this.ele, this.mounted_comps[0].ele);
            this.NULL_ELEMENT_DISCONNECTED = false;
        }

        this.mounted_comps.length = 0;

        for (let i = active_window_start; i < upper_bound; i++)
            this.mounted_comps.push(output[i]);

        if (this.USE_NULL_ELEMENT && this.mounted_comps.length > 0) {
            this.first_dom_element = this.mounted_comps[0].ele;
            this.last_dom_element = this.mounted_comps[this.mounted_comps.length - 1].ele;
        }
    }

    /**
     * Appends elements to the DOM
     */
    append(appending_comp: WickRTComponent, append_before_ele?: HTMLElement) {

        if (this.USE_NULL_ELEMENT) {
            if (!this.NULL_ELEMENT_DISCONNECTED) {

                appending_comp.appendToDOM(this.ele.parentElement, this.ele, false);

                this.ele.parentElement.removeChild(this.ele);

                this.first_dom_element = appending_comp.ele;
                this.last_dom_element = appending_comp.ele;

                this.NULL_ELEMENT_DISCONNECTED = true;
            } else {
                if (!append_before_ele) {

                    append_before_ele = this.last_dom_element;

                    this.last_dom_element = appending_comp.ele;

                    appending_comp.appendToDOM(this.parent.ele, append_before_ele, true);
                } else {
                    appending_comp.appendToDOM(this.parent.ele, append_before_ele);
                }
            }
        } else {
            appending_comp.appendToDOM(this.ele, append_before_ele);
        }
    }

    private appendToDOM(w_data: WindowData, output: ContainerComponent[]) {

        const { limit, offset, output_length, active_window_start } = w_data;

        let j = active_window_start;
        //Insert elements
        // Index the active items
        let upper_bound = Math.min(active_window_start + limit, output_length);

        let i = Math.min(active_window_start, output_length);

        while (i < upper_bound)
            output[i].index = i++;

        // Integrate new items with those already on the DOM

        for (let i = 0; i < this.mounted_comps.length && j < upper_bound; i++) {

            const as = this.mounted_comps[i];

            while (j < upper_bound && output[j].CONNECTED) j++;

            while (j < as.index && j < upper_bound) {
                const os = output[j];
                os.index = -1;
                this.append(os, as.ele);
                j++;
            }

        }

        // Append any remaining items to the DOM
        while (j < upper_bound) {
            this.append(output[j]);
            output[j].index = -1;
            j++;
        }

        return j;
    }

    private removeFromDOM() {
        for (const component of this.components_pending_removal) {
            component.par = null;
            component.removeFromDOM();
        }

        this.components_pending_removal.length = 0;
    }

    mutateDOM(w_data: WindowData, transition?: null | Transition, output = this.active_comps, NO_TRANSITION = false) {

        let
            OWN_TRANSITION = false;

        if (!transition) transition = createTransition(), OWN_TRANSITION = true;

        this.arrange(w_data, output, transition);

        this.appendToDOM(w_data, output);

        this.updateRefs(w_data, output);

        this.primeTransitions(transition);

        if (OWN_TRANSITION) {
            if (!rt.glow || NO_TRANSITION) {
                this.removeFromDOM();
            } else {
                transition.asyncPlay().then(this.removeFromDOM.bind(this));
            }
        }

        return transition;
    }

    primeTransitions(transition: Transition) {
        for (const { TYPE, row, col, DESCENDING, comp } of this.transition_list)
            switch (TYPE) {
                case TransitionType.IN:
                    comp.transitionIn(row, col, DESCENDING, transition);
                    break;
                case TransitionType.OUT:
                    comp.transitionOut(row, col, DESCENDING, transition);
                    break;
                case TransitionType.ARRANGE:
                    comp.arrange(row, col, transition);
                    break;
            }

        this.transition_list.length = 0;
    }

    limitExpressionUpdate(transition?: Transition) {

        //Preset the positions of initial components. 

        this.mutateDOM(this.getWindowData(), transition);

        this.offset_diff = 0;
    }

    filterExpressionUpdate(transition?: Transition) {
        // Filter the current components. 
        this.updateFilter();
        this.limitExpressionUpdate(transition);
    }

    /**
     * Filters stored Scopes with search terms and outputs an array of passing scopes.
     * 
     * @protected
     */
    updateFilter() {


        this.active_comps.length = 0;

        if (this.filter) {

            for (const comp of this.comps) {
                if (!this.filter(comp.container_model)) {
                    if (comp.CONNECTED) {
                        this.components_pending_removal.push(comp);
                    }
                } else {
                    this.active_comps.push(comp);
                }
            }

        } else {
            this.active_comps.push(...this.comps);
        }

        if (this.sort)
            this.active_comps.sort(this.sort);


        this.UPDATE_FILTER = false;

        return this.active_comps;
    }

    setFilter(value: (arg: WickRTComponent) => boolean) {
        if (typeof value == "function")
            this.filter = value;
    }

    setSort(value: (...arg: WickRTComponent[]) => number) {
        if (typeof value == "function")
            this.sort = value;
    }

    updateScrub(value: number) {
        if (typeof value == "number" && value != 0)
            this.scrub(value);
        else if (value === null && this.SCRUBBING) {
            this.AUTO_SCRUB = true;
            this.scheduledUpdate();
        }
    }

    updateLimit(value: number) {

        let numeric = parseInt(value.toString());

        if (numeric) {
            numeric = Math.max(0, numeric);
            if (this.limit != numeric) {
                this.limit = numeric;
                spark.queueUpdate(this);
            }
        } else {
            this.limit = Infinity;
            spark.queueUpdate(this);
        }
    }

    updateShift(value: number) {
        if (typeof value == "number" && this.columns != value) {
            this.columns = value;
            spark.queueUpdate(this);
        }
    }

    updateOffset(value: number) {
        if (typeof value == "number" && this.offset != value) {
            this.offset = value;
            spark.queueUpdate(this);
        }
    }

    /**
     * Called by Spark. 
     * 
     * @protected
     */
    scheduledUpdate() {
        if (this.SCRUBBING) {

            if (!this.AUTO_SCRUB) {
                this.SCRUBBING = false;
                return;
            }

            if (
                Math.abs(this.scrub_velocity) > 0.0001
            ) {

                if (this.scrub(this.scrub_velocity)) {

                    this.scrub_velocity *= (this.drag);

                    let pos = this.offset + this.scrub_velocity;

                    if (pos < 0 || pos > this.max)
                        this.scrub_velocity = 0;

                    spark.queueUpdate(this);
                }

            } else {
                this.scrub_velocity = 0;
                this.scrub(Infinity);
                this.SCRUBBING = false;
            }
        } else {

            this.filterExpressionUpdate();
        }
    }

    /**
     * Removes stored Scopes that do not match the ModelContainer contents. 
     *
     * @param      {Array}  new_items  Array of Models that are currently stored in the ModelContainer. 
     * 
     * @protected
     */
    filter_new_items(new_items: any[] = []) {

        const transition = createTransition();

        if (new_items.length == 0) {

            const sl = this.active_comps.length;

            if (this.USE_NULL_ELEMENT && this.NULL_ELEMENT_DISCONNECTED)
                this.first_dom_element.parentElement.insertBefore(this.first_dom_element, this.ele);

            for (let i = 0; i < sl; i++) {
                const { row, col } = getColumnRow(i, this.offset, this.columns);
                this.prepareTransitioningComp(this.active_comps[i], TransitionType.OUT, false, row, col);
            }

            this.comps.length = 0;

            this.active_comps.length = 0;

            this.primeTransitions(transition);

        } else {

            const
                exists = new Map(new_items.map(e => [e, true])),
                out: ContainerComponent[] = [];


            for (let i = 0, l = this.active_comps.length; i < l; i++)
                if (exists.has(this.active_comps[i].container_model))
                    exists.set(this.active_comps[i].container_model, false);

            for (let i = 0, l = this.comps.length; i < l; i++)
                if (!exists.has(this.comps[i].container_model)) {
                    this.prepareTransitioningComp(this.comps[0], TransitionType.OUT, false, -1, -1);
                    this.comps[i].index = -1;
                    this.comps.splice(i, 1);
                    l--;
                    i--;
                } else
                    exists.set(this.comps[i].container_model, false);

            exists.forEach((v, k) => { if (v) out.push(k); });

            if (out.length > 0) {
                // Wrap models into components
                this._add(out, transition);

            } else {
                for (let i = 0, j = 0, l = this.active_comps.length; i < l; i++, j++) {

                    if (this.active_comps[i]._TRANSITION_STATE_) {
                        if (j !== i) {
                            const { row, col } = getColumnRow(i, this.offset, this.columns);
                            this.active_comps[i].arrange(row, col, transition);
                        }
                    } else
                        this.active_comps.splice(i, 1), i--, l--;
                }
            }

            this.scheduledUpdate();


            if (!this.SCRUBBING) {
                transition.play();
            }
        }
    }
    addEvaluator(evaluator: (a: any) => boolean, index: number) { this.evaluators[index] = evaluator; }

    /**
     * Called by the ModelContainer when Models have been added to it.
     *
     * @param  {Array}  models   An array of new items now stored in the ModelContainer. 
     */
    _add(models: any[], transition?: Transition) {

        let OWN_TRANSITION = false, cstr_l = this.comp_constructors.length;

        if (!transition) OWN_TRANSITION = true;

        for (const model of models) {

            let component: null | ContainerComponent = null;

            if (model instanceof WickRTComponent) {

                component = <ContainerComponent>model;

            } else {

                for (let j = 0; j < cstr_l; j++) {

                    const evaluator = this.evaluators[j];

                    if (j == cstr_l - 1 || (evaluator && evaluator(model))) {

                        component = <ContainerComponent>new this.comp_constructors[j](null, null, [this.parent]);

                        component.container = this;

                        component.hydrate().initialize(model);

                        component.disconnect();

                        const attrib_list = this.comp_attributes[j];

                        if (attrib_list)
                            for (const [key, value] of attrib_list) {

                                if (!key) continue;

                                if (key == "class") {
                                    if (value)
                                        component.ele.classList.add(...value.split(" "));
                                } else
                                    component.ele.setAttribute(key, value ?? "");
                            }

                        component.container_model = model;

                        break;
                    }
                }
            }

            if (component) {

                component.par = <ContainerComponent>this.parent;

                this.comps.push(component);
            }
        }

        if (OWN_TRANSITION) this.filterExpressionUpdate(transition);
    }
    /**
     * Forcefully remove all components from container, ignoring 
     * transitions
     */
    purge() {

        let seen = new WeakSet();

        for (const comp of [
            ...this.comps,
            ...this.active_comps,
            ...this.mounted_comps,
            ...this.transition_list.map(t => t.comp)
        ]) {
            if (seen.has(comp))
                continue;
            seen.add(comp);
            comp.par = null;
            comp.removeFromDOM();
            comp.destructor();
        }

        this.comps.length = 0;
        this.active_comps.length = 0;
        this.mounted_comps.length = 0;
        this.transition_list.length = 0;
    }
}