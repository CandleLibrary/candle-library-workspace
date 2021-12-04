import { Context, UserPresets } from '../compiler/common/context.js';
import { WickRTComponent } from '../client/runtime/component/component.js';
import { rt } from "../client/runtime/global.js";
import {
    Element_Is_Wick_Component,
    Element_Is_Wick_Template, hydrateComponentElements
} from "../client/runtime/component/html.js";
import { loadModules } from "../client/runtime/load_modules.js";
import { Observable } from '../client/runtime/observable/observable.js';
import { ObservableArray } from '../client/runtime/observable/observable_array.js';
import { ObservableScheme__ } from '../client/runtime/observable/observable_prototyped.js';

let
    nop = (_: any) => !0,
    wick_root = function () {

        console.warn("Wick.rt is incapable of compiling components. Use the full Wick library instead." +
            " \n\t A placeholder component will be generated instead.");

        const d = {
            mount: nop,
            get pending() { return d; },
            class: function () {
                //@ts-ignore
                this.ele = document.createElement("div");
                //@ts-ignore
                this.ele.innerHTML = "Wick.rt is incapable of compiling components, a dummy component has been generated instead.";
            },
            createInstance: nop,
        };

        return d;
    };

const wick = Object.assign(wick_root, {

    rt: rt,

    setWrapper: nop,

    init_module_promise: <Promise<any> | null>null,

    objects: {
        WickRTComponent: WickRTComponent,
        Context: Context,
        Observable: Observable,
        ObservableArray: ObservableArray,
        ObservableScheme<T>(obj: T): ObservableScheme__<T> & T {
            return <any>new ObservableScheme__(obj);
        }
    },
    /**
     * Integrate the givin set of UserPresets with
     * the runtime context.
     * @param presets_options 
     * @returns 
     */
    async appendPresets(presets_options: UserPresets) {


        wick.rt.setPresets(presets_options);

        // Load API modules
        wick.init_module_promise = loadModules(presets_options, wick.rt.context);

        return wick.init_module_promise;
    },

    /**
     * Loads templates and hydrates page. Assumes hydratable component 
     * data has already been loaded.
     */
    async hydrate() {

        window.addEventListener("load", async () => {

            if (wick.init_module_promise)

                await wick.init_module_promise;

            // Assuming wick.rt.setPresets has been called already.

            /**
             * Looks through DOM and hydrates any element that has a 'w:c'
             * attribute. Such elements also require their first class 
             * name be a Wick component hash name.
             */

            const elements = gatherWickElements();

            for (const comp of hydrateComponentElements(elements)) {
                comp.initialize();
                comp.connect();
                rt.root_components.push(comp);
            }
        });
    },

    toString() {
        return;
        `
      __           _    _ _____ _____  _   __      _   
     / _|         | |  | |_   _/  __ \| | / /     | |  
  ___| |___      _| |  | | | | | /  \/| |/ / _ __| |_ 
 / __|  _\ \ /\ / / |/\| | | | | |    |    \| '__| __|
| (__| |  \ V  V /\  /\  /_| |_| \__/\| |\  \ |  | |_ 
 \___|_|   \_/\_(_)\/  \/ \___/ \____/\_| \_/_|   \__|
 `;
    }
});


/**
 * Returns an array of Wick Components identifier from a traversal 
 * 
 * 
 * @param dom 
 * @returns 
 */
export function gatherWickElements(dom: HTMLElement = window.document.body) {

    const
        pending_elements_queue: HTMLElement[] = [dom],

        pending_component_elements: HTMLElement[] = [];

    while (pending_elements_queue.length > 0)

        for (const element of (Array.from(pending_elements_queue.shift()?.children ?? [])))

            if (element.nodeType == Node.ELEMENT_NODE)

                if (Element_Is_Wick_Template(<any>element))
                    rt.templates.set(element.id, <any>element);
                else if (Element_Is_Wick_Component(<any>element))
                    pending_component_elements.push(<any>element);
                else
                    pending_elements_queue.push(<any>element);

    return pending_component_elements;
}

export default wick;

//Register wick as a global variable
//@ts-ignore
globalThis["wick"] = wick;