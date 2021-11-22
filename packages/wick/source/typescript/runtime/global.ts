
import GlowAnimation from '@candlelib/glow';
import { Context, UserPresets } from "../compiler/common/context.js";

import { WickRTComponent } from "./component.js";

export const global_object = (typeof global !== "undefined") ? global : window;

export interface WickRuntime {

    loadGlow(): Promise<typeof GlowAnimation>,

    glow: typeof GlowAnimation,

    /**
     * Runtime Component Class Constructor
     */
    C: typeof WickRTComponent;
    /**
     * All top level components 
     * (components that have been initiated
     * through hydrateComponentElements )
     * 
     */
    root_components: WickRTComponent[];

    /**
     * Utilized by radiate system
     */
    router: any;

    /**
     * Register component class
     * @param arg1 
     */
    rC(arg1: typeof WickRTComponent): void;

    /**
     * Retrieve component class
     * @param name 
     */
    gC(name: string): typeof WickRTComponent,
    context: Context;
    /**
     * Replace the current context with a new set.
     * > Warning:  This will cause a lose of all currently
     * > compiled components.
     */
    setPresets: (preset_options?: UserPresets) => Context,
    /**
     * Template elements mapped to component names
     */
    templates: Map<string, HTMLElement>;

    OVERRIDABLE_onComponentCreate(component_instance: WickRTComponent): void;

    OVERRIDABLE_onComponentMetaChange(component_meta: any): void;

    init: () => Promise<void>;
}

const rt: WickRuntime = (() => {

    let glow = null;

    return <WickRuntime>{

        async loadGlow(glow_url: string = "@candlelib/glow") {
            //Import glow module if it is not present
            glow = (await import(glow_url)).default;

            return glow;
        },

        root_components: [],

        get glow(): typeof GlowAnimation { return glow; },

        get p() { return rt.context; },

        get C() { return WickRTComponent; },

        router: null,

        context: null,
        /**
         * Registers component
         * @param component - A WickTt
         * @returns 
         */
        rC: component => (rt.context.component_class.set(component.name, component), component),

        gC: component_name => rt.context.component_class.get(component_name),

        templates: new Map,

        OVERRIDABLE_onComponentCreate(component_instance) { },

        OVERRIDABLE_onComponentMetaChange() { },


        setPresets: (preset_options: UserPresets) => {

            if (rt.context) {

                if (preset_options)
                    //@ts-ignore
                    rt.context.integrate_new_options(preset_options);

            } else {

                //create new component
                const context = new Context(preset_options);

                //if (!rt.context)
                rt.context = <Context><any>context;
            }

            return <Context>rt.context;
        },

        init: null,

        addAPI(obj) {

            for (const name in obj)
                rt.context.api[name] = { default: obj[name] };
        }
    };
})();


export { rt };
