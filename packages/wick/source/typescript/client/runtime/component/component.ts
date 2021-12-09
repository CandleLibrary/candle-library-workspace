import { Transition } from '@candlelib/glow';
import spark, { Sparky } from "@candlelib/spark";
import { Environment, envIs } from '../../../common/env.js';
import { Context } from '../../../compiler/common/context.js';
import { BINDING_FLAG, ObservableModel, ObservableWatcher } from "../../../types/all";
import { rt } from "../global.js";
import { Status } from './component_status.js';
import { WickContainer } from "./container.js";
import {
    hydrateComponentElement, hydrateContainerElement
} from "./html.js";


type BindingUpdateFunction = (...rest: any[]) => void;

export type ComponentElement = HTMLElement & { wick_component: WickRTComponent; };

const enum DATA_DIRECTION {
    DOWN = 1,
    UP = 2
}

const registry = new Map;

let new_component_type_hook = (_: any) => _;

export function registerComponent(comp: WickRTComponent) {

    if (!envIs(Environment.WORKSPACE))
        return;

    if (!registry.has(comp.name)) {
        registry.set(comp.name, new Set);
        new_component_type_hook(comp.name);
    }

    registry.get(comp.name).add(comp);
}

export function unregisterComponent(comp: WickRTComponent) {

    if (!envIs(Environment.WORKSPACE))
        return;

    if (!registry.has(comp.name))
        return;

    const set = registry.get(comp.name);

    set.delete(comp);

    if (set.size == 0)
        registry.delete(comp.name);
}

export function setRegisterHook(fn: (arg: any) => any) {
    new_component_type_hook = fn;
}

export class WickRTComponent implements Sparky, ObservableWatcher {

    ele: HTMLElement;

    elu: (HTMLElement | Text)[][];

    status: Status;

    context: Context;

    //@ts-ignore
    nlu: { [key: string]: number; };

    //@ts-ignore
    lookup_function_table: BindingUpdateFunction[];

    /**
     * Child component array
     */
    ch: WickRTComponent[];

    /**
     * Parent component
     */
    //@ts-ignore
    par: WickRTComponent | null;

    ctr: WickContainer[];
    /**
     * Identifier of interval watcher for non-dynamic models.
     */
    polling_id: number;

    model: any;

    /**
     * Methods that will be called during the update period
     * of the component. 
     */
    call_set: Map<number, Array<any>>;

    binding_call_set: Array<any>;

    name: string;

    originator: WickRTComponent | null;

    host: WickRTComponent | null;

    active_flags: number;
    update_state: number;

    call_depth: number;

    out_trs: any;

    pui: any[];
    nui: any[];

    ci: number;
    //me: typeof makeElement;

    updated_attributes: Set<number>;

    _SCHD_: number;

    static edit_name: string | undefined;

    is(flag: Status) {
        return (this.status & flag) == flag;
    }

    setStatus(...flags: Status[]) {
        this.status |= flags.reduce((r, t) => r | t, 0);
    }

    removeStatus(...flags: Status[]) {
        this.status ^= (this.status & flags.reduce((r, t) => r | t, 0));
    }

    constructor(
        existing_element = null,
        originator: WickRTComponent | null = null,
        parent_chain: WickRTComponent[] = [],
        default_model_name = "",
        context: Context = rt.context
    ) {
        this.name = this.constructor.name;
        this.ch = [];
        this.elu = [];
        this.ctr = [];
        this.pui = [];
        this.nui = [];
        this.binding_call_set = [];
        this.call_set = new Map();
        this.updated_attributes = new Set();

        this.model = null;
        this.originator = null;
        this.host = null;

        this.update_state = 0;
        this.active_flags = 0;
        this.call_depth = 0;
        this.status = 0;
        this.ci = 0;

        //@ts-ignore
        this.up = this.updateParent;
        //@ts-ignore
        this.spm = this.syncParentMethod;
        //@ts-ignore
        this.pup = this.updateFromChild;
        //@ts-ignore
        this.ufp = this.updateFromParent;

        this._SCHD_ = 0;
        this.polling_id = -1;
        this.context = context;

        //Create or assign global model whose name matches the default_model_name;
        if (default_model_name) {

            if (!context.models[default_model_name])
                context.models[default_model_name] = {};

            this.model = context.models[default_model_name];
        }

        if (originator) {
            this.originator = originator;
            originator.host = this;
        }

        if (existing_element) {
            this.ele = existing_element;
            this.integrateElement(existing_element, true, parent_chain.concat(this));
        } else
            this.ele = this.createElement(context, [this]);


        this.ele.dataset.wrtc = this.name;

        this.init_interfaces(this);

        registerComponent(this);
    }

    init_interfaces(c: any) { }

    initialize(model: any = this.model) {

        if (this.is(Status.INITIALIZED))
            return this;

        this.connect();

        this.setStatus(Status.INITIALIZED);

        this.model = model;

        this.init(this);

        for (const child of this.ch)
            child.initialize();

        this.async_init();

        this.setModel(model);

        this.disconnect();

        return this;
    }

    hydrate() {

        try {
            this.c();
        } catch (e) {
            console.error(e);
        }

        rt.OVERRIDABLE_onComponentCreate(this);

        for (const child of this.ch)
            child.hydrate();

        return this;
    }

    destructor() {
        if (this.model)
            this.setModel(null);

        if (this.originator) {
            this.originator.host = null;
            this.originator.destructor();
        }

        if (this.host) {
            this.host.originator = null;
            this.host.destructor();
        }

        if (this.par)
            this.par.removeChild(this);

        unregisterComponent(this);

        this.removeCSS();
    }

    removeChild(cp: WickRTComponent) {
        if (cp.par == this) {
            const index = this.ch.indexOf(cp);

            if (index >= 0) {
                this.ch.splice(index, 1);
            }
            cp.par = null;
        }
    }


    addChild(cp: WickRTComponent) {

        if (cp == this)
            throw new Error("Invalid parent child connection");

        for (const ch of this.ch)
            if (ch == cp) continue;

        cp.par = this;

        this.ch.push(cp);
    }

    connect() {
        this.setStatus(Status.CONNECTED, Status.ALLOW_UPDATE);

        for (const child of this.ch)
            child.connect();

        if (this.originator)
            this.originator.connect();

        this.onModelUpdate();
    }

    disconnect() {
        for (const child of this.ch)
            child.disconnect();

        if (this.originator)
            this.originator.disconnect();

        this.removeStatus(Status.CONNECTED, Status.ALLOW_UPDATE);
    }


    ce(): HTMLElement {

        if (rt.templates.has(this.name)) {

            const template: HTMLTemplateElement = <HTMLTemplateElement>
                rt.templates.get(this.name);

            if (template) {

                const
                    doc = <HTMLElement>template.content.cloneNode(true),
                    ele = <HTMLElement>doc.firstElementChild;

                this.integrateElement(ele);

                return ele;
            }
        }
        throw new Error(`WickRT :: NO template element for component: ${this.name}. Was this component defined without a default HTML element export?`);
    }

    removeCSS() {
        if (this.context.css_cache) {

            const cache = this.context.css_cache.get(this.name);

            if (cache && cache.css_ele.parentElement) {
                cache.count--;
                if (cache.count <= 0) {
                    cache.css_ele.parentElement.removeChild(cache.css_ele);
                    this.context.css_cache.delete(this.name);
                }
            }
        }
    }

    setCSS(style_string = this.getCSS()) {

        if (style_string && this.context.css_cache) {

            if (!this.context.css_cache.has(this.name)) {

                const { window, css_cache } = this.context;
                if (window) {
                    const { document } = window,

                        css_ele = document.createElement("style");

                    css_ele.innerHTML = style_string;

                    document.head.appendChild(css_ele);

                    css_cache.set(this.name, { css_ele, count: 1 });
                }
            } else {
                if (this.context.css_cache.has(this.name))
                    //@ts-ignore
                    this.context.css_cache.get(this.name).count++;
            }

            this.ele.classList.add(this.name);
        }
    }

    appendToDOM(parent_element: HTMLElement, other_element: HTMLElement | null = null, INSERT_AFTER = false) {

        //Lifecycle Events: Connecting <======================================================================
        this.connecting();

        this.connect();

        if (this.ele) {

            if (other_element) {
                if (!INSERT_AFTER)
                    other_element.parentElement?.insertBefore(this.ele, other_element);
                else {
                    if (other_element.nextElementSibling)
                        other_element.parentElement?.insertBefore(this.ele, other_element.nextElementSibling);
                    else
                        other_element.parentElement?.appendChild(this.ele);
                }
            } else {
                parent_element.appendChild(this.ele);
            }

        }
        //Lifecycle Events: Connected <======================================================================
        this.connected();
    }


    removeFromDOM() {
        //Prevent erroneous removal of scope.
        if (!this.is(Status.CONNECTED)) return;

        //Lifecycle Events: Disconnecting <======================================================================
        this.disconnecting();

        /**
         * Only disconnect from DOM if the component is 
         * the root (has no parent) of a Component tree.
         */
        if (this.ele && this.ele.parentElement && !this.par)
            this.ele.parentElement.removeChild(this.ele);


        //Lifecycle Events: Disconnected <======================================================================
        this.disconnect();

        this.disconnected();
    }
    oTIC() { }

    oTI(row: number, col: number, DESCENDING: boolean, trs: Transition) { }
    oTO(row: number, col: number, DESCENDING: boolean, trs: Transition) { }
    aRR(row: number, col: number, trs: Transition) { }


    onTransitionOutEnd() {

        if (!this.is(Status.TRANSITIONED_IN)) {
            this.setStatus(Status.TRANSITIONED_OUT);

            //this.removeFromDOM();

            if (this.is(Status.DESTROY_AFTER_TRANSITION))
                this.destructor();

            this.removeStatus(Status.DESTROY_AFTER_TRANSITION);
        }

        this.out_trs = null;

        return false;
    }

    /**
     * Call when the component is about to be removed from the DOM. 
     * 
     * Called by RuntimeContainer
     * @param transition 
     * @param DESTROY_AFTER_TRANSITION 
     * @param transition_name 
     */
    transitionOut(
        row: number,
        col: number,
        DESCENDING: boolean,
        transition: Transition | null = null,
        DESTROY_AFTER_TRANSITION: boolean = false
    ) {
        for (const ch of this.ch)
            ch.transitionOut(row, col, DESCENDING, transition, false);

        if (DESTROY_AFTER_TRANSITION)
            this.setStatus(Status.DESTROY_AFTER_TRANSITION);

        this.removeStatus(Status.TRANSITIONED_IN);

        let transition_time = 0;

        if (transition) {
            const len = transition.out_seq.length;

            this.oTO(row, col, DESCENDING, transition.out);

            if (len != transition.out_seq.length) {


                transition.addEventListener(
                    <any>"stopped",
                    this.onTransitionOutEnd.bind(this)
                );

                try {
                    transition_time = transition.out_duration;
                } catch (e) {
                    console.log(e);
                }
            } else this.onTransitionOutEnd();

        } else if (!this.out_trs)
            this.onTransitionOutEnd();

        transition_time = Math.max(transition_time, 0);

        return transition_time;
    }

    se(index: number, ele: HTMLElement | Text) {

        this.elu.push([ele]);

        //if (!this.elu[index])
        //this.elu[index] = [];
        //
        //this.elu[index].push(ele);
    }

    re(index: number, ele: HTMLElement | Text) {

        if (!this.elu[index])
            return;

        this.elu[index] = this.elu[index].filter(e => e != ele);
    }

    /**
     * Call when the ordering of the component changes the component 
     * should be repositioned according to the new ordering. 
     * @param row The new row number in which the component lies
     * @param col The new column number in which the component lies
     * @param trs A transition object that can be used to animate the position change
     */
    arrange(row: number, col: number, trs: Transition) { this.aRR(row, col, trs.in); }

    /**
     * Call when the object should transition from an out of view state to 
     * an in view state. 
     * @param row The new row number in which the component lies
     * @param col The new column number in which the component lies
     * @param DESCENDING If true the transition occurs from a high positional index to 
     * a lower positional index
     * @param trs A transition object that can be used to animate the position change
     */
    transitionIn(row: number, col: number, DESCENDING: boolean, trs: Transition) {

        for (const ch of this.ch)
            if (!ch.is(Status.CONTAINER_COMPONENT))
                ch.transitionIn(row, col, DESCENDING, trs);

        try {
            this.oTI(row, col, DESCENDING, trs.in);
            this.setStatus(Status.TRANSITIONED_IN);
        } catch (e) {
            console.log(e);
        }
    }

    transitionInEnd() {
        for (const ch of this.ch)
            ch.transitionInEnd();

        this.oTIC();
    }

    setModel(model: ObservableModel | any) {

        if (this.model && model != this.model) {
            if (this.polling_id >= 0) {
                clearInterval(this.polling_id);
                this.polling_id = -1;
            }

            if (this.model.unsubscribe)
                this.model.unsubscribe(this);

            this.model = null;
        }

        if (model) {

            this.model = model;

            if (typeof model.subscribe == "function") {

                model.subscribe(this);

            } else {

                //Create a polling monitor
                //if (this.ALLOW_POLLING)
                if (this.polling_id < 0)
                    this.polling_id = <number><unknown>
                        setInterval(this.onModelUpdate.bind(this), 1000 / 15);

                this.onModelUpdate(model);
            }
        }
    }

    removeModel() {
        //If model is set then should unsubscribe from its model
        this.setModel(null);
    }

    /**
     * @param model - The data model that has been updated 
     * @param changed_names - An iterable list of property names on the model that have been modified 
     */

    onModelUpdate(
        model: any = this.model,
        flags = BINDING_FLAG.ALLOW_UPDATE_FROM_MODEL | BINDING_FLAG.DEFAULT_BINDING_STATE
    ) {
        // Go through the model's props and test whether they are different then the 
        // currently cached variables

        if (!this.is(Status.ALLOW_UPDATE)) return;

        if (model) {

            this.update(model, flags);

            this.updateChildrenWithModel(model);
        }
    }

    private updateChildrenWithModel(model: any) {
        for (const child of this.ch)
            child.onModelUpdate(model,
                BINDING_FLAG.ALLOW_UPDATE_FROM_MODEL
                | BINDING_FLAG.FROM_PARENT
                | BINDING_FLAG.DEFAULT_BINDING_STATE
            );
    }

    update(data: any, flags: number = 1, IMMEDIATE: boolean = false) {

        if (!this.is(Status.ALLOW_UPDATE)) return;

        for (const name in data) {

            const val = data[name];

            if (val !== undefined && this.nlu) {

                const index = this.nlu[name];

                if (flags && ((index >>> 24) & flags) == flags) {

                    this.ua(index & 0xFFFFFF, val);
                }
            }
        }

        for (const [call_id, args] of this.clearActiveCalls())
            this.lookup_function_table[call_id].call(this, ...args);

        if (IMMEDIATE)
            this.scheduledUpdate(0, 0);
    }
    /**
     * Use in compiled functions to update attributes and schedule an
     * immediate update followup pass to call methods that may be effected
     * by the attribute that has been modified
     * @param attribute_value 
     * @param attribute_index 
     * @param RETURN_PREVIOUS_VAL 
     * @returns 
     */
    ua(attribute_index: number, attribute_value: any, RETURN_PREVIOUS_VAL = false) {

        const comp: { [key: string]: any; } = <any>this;

        const prev_val = comp[attribute_index];

        if (attribute_value !== prev_val) {

            comp[attribute_index] = attribute_value;

            if (
                !this.call_set.has(attribute_index)
                &&
                this.lookup_function_table[attribute_index]
            ) {
                /*
                this.call_set.set(attribute_index, [this.active_flags, this.call_depth]);

                
                //Forcefully update 
                spark.queueUpdate(this, 0, 0, true); 
            */
                this.lookup_function_table[attribute_index].call(this, this.call_depth);
            }
        }

        return RETURN_PREVIOUS_VAL ? prev_val : comp[attribute_index];
    }

    fua(attribute_index: number, attribute_value: any, RETURN_PREVIOUS_VAL = false) {

        const comp: { [key: string]: any; } = <any>this;

        const prev_val = comp[attribute_index];

        if (
            !this.call_set.has(attribute_index)
            &&
            this.lookup_function_table[attribute_index]
        )
            this.call_set.set(attribute_index, [this.active_flags, this.call_depth]);

        comp[attribute_index] = attribute_value;

        //Forcefully update 
        spark.queueUpdate(this, 0, 0, true);


        return RETURN_PREVIOUS_VAL ? prev_val : comp[attribute_index];
    }
    u(flags: DATA_DIRECTION, call_depth: number = this.call_depth) {

        const pending_function_indices = this.updated_attributes.values();

        this.updated_attributes.clear();

        for (const index of pending_function_indices) {
            if (this.lookup_function_table[index])
                this.call_set.set(index, [flags, call_depth]);
        }

        spark.queueUpdate(this);
    }

    /**
     * Check to see of the index locations are defined
     * @param ids 
     */
    check(...ids: string[]) {

        const comp: { [key: string]: any; } = <any>this;

        for (const id of ids)
            if (comp[id] === undefined)
                return false;

        return true;
    }

    syncParentMethod(this_index: number, parent_method_index: number, child_index: number) {

        this.ci = child_index;

        //@ts-ignore
        this.pui[this_index] = this.par["u" + parent_method_index];
    }

    updateFromParent(local_index: number, attribute_value: any, flags: number) {

        if (flags >> 24 == this.ci + 1)
            return;

        this.active_flags |= BINDING_FLAG.FROM_PARENT;

        this.ua(local_index, attribute_value);
    }

    updateParent(data: any) {
        if (this.par)
            this.updateFromChild.call(this.par, data);
    }


    updateFromChild(data: any) {

        for (const key in data) {

            const val = data[key];

            if (val !== undefined && this.nlu) {

                const index = this.nlu[key];

                if (((index >>> 24) & BINDING_FLAG.ALLOW_UPDATE_FROM_CHILD)) {
                    let cd = this.call_depth;
                    this.call_depth = 0;
                    this.ua(index & 0xFFFFFF, val);
                    this.call_depth = cd;
                }
            }
        }
    };

    scheduledUpdate(step_ratio: number, diff: number) {

        this.call_depth = 1;

        for (const [calls_id, depth] of this.clearActiveBindingCalls()) {

            this.lookup_function_table[calls_id].call(this, depth);

            this.call_depth = 0;

            this.active_flags = 0;
        }

        for (const [call_id, args] of this.clearActiveCalls()) {

            this.lookup_function_table[call_id].call(this, ...args);

            this.call_depth = 0;

            this.active_flags = 0;
        }
    }

    clearActiveBindingCalls() {

        if (this.binding_call_set.length == 0) return [];

        const data = this.binding_call_set.slice();

        this.binding_call_set.length = 0;

        return data;
    }

    clearActiveCalls() {

        if (this.call_set.size == 0) return [];

        const data = [...this.call_set.entries()];

        this.call_set.clear();

        return data;
    }

    runActiveCalls() {

    }

    call(pending_function_index: number, call_depth: number = 0) {

        for (const [index] of this.binding_call_set)
            if (index == pending_function_index)
                return;

        this.lookup_function_table[pending_function_index].call(this, call_depth);

        //this.binding_call_set.push([pending_function_index, call_depth]);
        //
        //spark.queueUpdate(this);
    }

    /**************** Abstract Functions *********************/
    // Replaced by inheriting class.
    //=========================================================
    //=========================================================
    //=========================================================
    //=========================================================
    c() { }
    init(c: any) { }
    async_init() { }
    onMounted() { }
    getCSS() { return ""; }
    //=========================================================
    //=========================================================
    //=========================================================
    //=========================================================

    /**
     * Integrates an Element tree with the component. 
     * 
     * This function primary purposes is to make sure 
     * internal JS hooks are able to target elements that
     * should be associated with this component. It also deals
     * with untangling nested and slotted elements
     * to ensure each element is associated with the component
     * the author has intended.
     * 
     * @param root 
     * @param component_chain 
     */
    integrateElement(
        /**
         * The current target element. 
         */
        ele: HTMLElement,
        root: boolean = true,
        component_chain: WickRTComponent[] = [this]
    ): number {

        let sk = 0, PROCESS_CHILDREN = true, affinity = component_chain.length - 1;

        let scope_component: WickRTComponent = this;

        let class_members = Object.fromEntries(
            (ele.classList.toString().split(" ").filter(s => s.slice(0, 2) == "wk").map(v => {
                const [, key, val] = v.split("-").slice();
                return [key, val ?? "true"];
            })));

        if (root) {

            ele.classList.add(this.name);

            this.ele = ele;
            //@ts-ignore
            ele.wick_component = this;

            if (class_members["ctr"])
                ({ sk, PROCESS_CHILDREN } = process_container(ele, scope_component, sk, PROCESS_CHILDREN));

            this.se(0, ele);

            if (class_members["claim"]) {
                if (+(parseInt(class_members["claim"])) != affinity)
                    this.setStatus(Status.FOREIGN_HOST);
            }

        } else {


            if (class_members["claim"]) {
                if (+(parseInt(class_members["claim"])) != affinity) {
                    this.setStatus(Status.FOREIGN_HOST);
                    return 0;
                }
            }

            // Binding Text Node
            if (ele.tagName == "W-E") {

                const child = <any>ele.children[0];

                this.integrateElement(child, false, component_chain);

                ele.replaceWith(child);

                this.se(this.elu.length, child);


                return 0;


            } else if (ele.tagName == "W-B") {

                const text = document.createTextNode(ele.innerHTML);

                ele.replaceWith(text);

                this.se(this.elu.length, text);

                return 0;

            } else {

                if (ele.tagName == "A")
                    rt.context.processLink(ele);

                // Attribute that affect scope assignment

                if (class_members["o"]) {

                    // Element outside the scope of the current component
                    if (this.par)
                        this.par.se(+class_members["o"], ele);

                    //@ts-ignore
                    iterateElementChildren(ele, this.par, component_chain);

                    return 0;

                } else if (class_members["r"]) {

                    const
                        index = +(class_members["r"]),
                        lu_index = index % 50,
                        comp_index = (index / 50) | 0;

                    scope_component = component_chain[comp_index];

                    scope_component.se(lu_index, ele);
                }


                //Special Wick Elements

                if (class_members["ctr"])

                    ({ sk, PROCESS_CHILDREN } = process_container(ele, scope_component, sk, PROCESS_CHILDREN));

                else if (class_members["c"] && this.ele !== ele) {

                    hydrateComponentElement(ele, component_chain);
                }

            }

            this.se(this.elu.length, ele);

        }


        iterateElementChildren(ele, scope_component, component_chain);

        return sk;
    }


    /**
     * Updates an element with new data. If the data is an HTMLElement
     * the existing element is replaced with the new element
     */
    ue(element_index: number, data: any) {

        for (let ele of this.elu[element_index] ?? []) {

            if (data instanceof HTMLElement) {

                this.re(element_index, ele);
                this.se(element_index, data);

                if (ele.parentElement)
                    ele.parentElement.replaceChild(data, ele);

                continue;
            } else if (!(ele instanceof Text)) {

                let node = new Text();

                this.re(element_index, ele);
                this.se(element_index, node);

                if (ele.parentElement)
                    ele.parentElement.replaceChild(node, ele);

                ele = node;
            };

            ele.data = data + "";
        }
    }

    sa(
        ele_index: number,
        attribute_name: string,
        attribute_value: string,
    ) {

        for (const ele of this.elu[ele_index] ?? []) {
            if (attribute_name == "value")
                (<HTMLInputElement>ele).value = attribute_value;
            else if (attribute_name == "class")
                (<HTMLElement>ele).classList.add(...attribute_value.split(" "));
            else
                (<HTMLElement>ele).setAttribute(attribute_name, attribute_value);
        }
    }

    set_class(
        ele_index: number,
        bool_expression: boolean,
        classes: any
    ) {

        const bool = !!bool_expression;

        let class_strings = [];

        if (Array.isArray(classes))
            class_strings = classes.flatMap(c => c.toString().split(" "));
        else
            class_strings = classes.toString().split(" ");


        for (const ele of this.elu[ele_index] ?? []) {
            if (ele instanceof HTMLElement) {
                if (bool)
                    ele.classList.add(...class_strings);
                else
                    ele.classList.remove(...class_strings);
            }
        }
    }


    al(
        ele_index: number,
        event_specifier: string,
        listener_function: (...args: any[]) => any,
        REQUIRES_THIS_BINDING: boolean = false
    ) {

        for (const ele of this.elu[ele_index] ?? []) {
            const fn = REQUIRES_THIS_BINDING ? listener_function.bind(this) : listener_function;

            ele.addEventListener(event_specifier, fn);

        }
        //const ele = this.elu[ele_index];
        // this.listeners.push([ele_index, event_specifier, fn])
    }

    /**
    * Make DOM Element tree from JS object
    * literals. Return list of object ID's and the
    * root element tree.
    * 
    * v0.14.0
    */
    makeElement(ele_obj: /*DOMLiteral*/ string, name_space = ""): HTMLElement {

        const temp_ele = document.createElement("div");

        temp_ele.innerHTML = ele_obj;

        return <HTMLElement>temp_ele.firstElementChild;
    }

    createElement(context: Context, parent_chain: WickRTComponent[]) {

        const ele = this.ce();

        hydrateComponentElement(ele, parent_chain, this);

        this.integrateElement(ele, true, parent_chain);

        return ele;
    }

    connecting() { }
    connected() { }

    disconnecting() { }
    disconnected() { }
}


//If null=n attribute exists then the container will 
//be hydrated by the next n elements, which do not 
//belong to the scope of the current container. 
function process_container(
    ele: HTMLElement,
    scope_component: WickRTComponent,
    sk: number,
    PROCESS_CHILDREN: boolean
) {

    const
        null_count = parseInt((ele.getAttribute("null") || "0")) || 0,
        null_elements: HTMLElement[] = [];

    if (null_count > 0) {

        let prev: HTMLElement | null = ele;

        for (let i = 0; i < null_count; i++) {
            null_elements.push(prev.nextElementSibling as HTMLElement);
            prev = null_elements[i];
        }
    }

    hydrateContainerElement(ele, scope_component, null_elements);

    sk = null_count;

    PROCESS_CHILDREN = false;
    return { sk, PROCESS_CHILDREN };
}

function iterateElementChildren(
    ele: HTMLElement,
    scope_component: WickRTComponent,
    component_chain: WickRTComponent[]
) {

    let skip_count = 0;

    for (const child of (Array.from(ele.children) || [])) {

        if (skip_count-- > 0) continue;

        skip_count = scope_component
            .integrateElement(<HTMLElement>child, false, component_chain);
    }
}
