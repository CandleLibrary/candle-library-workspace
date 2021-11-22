
import { CSSNode, CSSNodeType, CSSNodeTypeLU } from "@candlelib/css";
import { JSNode, JSNodeTypeLU } from "@candlelib/js";
import URL from "@candlelib/uri";
import { createCompiledComponentClass } from "../compiler/ast-build/build.js";
import { componentDataToCSS } from "../compiler/ast-render/css.js";
import { componentDataToHTML } from "../compiler/ast-render/html.js";
import {
    componentDataToJS,
    componentDataToJSCached
} from "../compiler/ast-render/js.js";
import { Context } from '../compiler/common/context.js';
import { css_selector_helpers } from "../compiler/common/css.js";
import { ComponentHash } from "../compiler/common/hash_name.js";
import { createComponent } from '../compiler/create_component.js';
import { init_build_system } from '../compiler/init_build_system.js';
import { parse_component } from "../compiler/source-code-parse/parse.js";
import { renderWithFormatting } from "../compiler/source-code-render/render.js";
import { WickRTComponent } from "../runtime/component.js";
import { rt, WickRuntime } from "../runtime/global.js";
import { Observable } from "../runtime/observable/observable.js";
import { ObservableScheme, ObservableScheme__ } from "../runtime/observable/observable_prototyped.js";
import { WickTest as test } from "../test/wick.test.js";
import { BindingVariable, BINDING_VARIABLE_TYPE } from '../types/binding.js';
import { HTMLNode, HTMLNodeClass, HTMLNodeTypeLU } from '../types/wick_ast.js';

import wick_runtime from './wick-runtime.js';

export * from "../compiler/source-code-render/render.js";
export * from "../compiler/source-code-render/rules.js";
export {
    //Functions
    parse_component as parser,
    ComponentHash as createNameHash,
    componentDataToHTML,
    componentDataToCSS,
    componentDataToJS as componentDataToClass,
    createCompiledComponentClass as componentDataToClassString,

    //tools
    test,
};


await init_build_system();

/**
 * Exporting the wick compiler
 */
export interface WickCompiler {

    /**
     * Main runtime system. Accessible as a standalone module
     * wick_rt.
     */
    rt: WickRuntime,


    /**
     * Configure the global context object with the given
     * preset options.
     */

    utils: {

        /**
         * Wrapper is a special sudo element that allows interception,
         * injection, and modification of existing components by wrapping
         * it in another component that has full access to the original 
         * component. This can be used to create adhoc component editors.
         */
        setWrapper: (url: URL | string) => Promise<void>;

        /**
         * Converts component data to a class string that can
         * be parsed by a JavaScript parser as a RuntimeComponent
         * constructor function.
         */
        componentToClassString: typeof createCompiledComponentClass;
        createNameHash: typeof ComponentHash;
        componentToClass: typeof componentDataToJS;
        /**
         * Renders a CSS stylesheet from the CSS data from a ComponentData
         * object.
         */
        componentDataToCSS: typeof componentDataToCSS;
        componentDataToClass: typeof componentDataToJS;
        componentDataToClassString: typeof createCompiledComponentClass;

        parse: {
            parser: typeof parse_component;
            render: typeof renderWithFormatting;
        };
    };

    objects: {

        /**
         * Main store of parsing and runtime objects and 
         * options.
         */
        Context: typeof Context;

        /**
         * Class type for runtime components
         */
        WickRTComponent: typeof WickRTComponent;

        Observable: typeof Observable;

        ObservableScheme: typeof ObservableScheme;
    };

    types: {
        BindingVariable: BindingVariable,
        JSNode: JSNode,
        HTMLNode: HTMLNode,
        CSSNode: CSSNode,
        CSSNodeType: typeof CSSNodeType;
        JSNodeType: typeof JSNodeTypeLU;
        HTMLNodeType: typeof HTMLNodeTypeLU;
        HTMLNodeClass: typeof HTMLNodeClass;
        VARIABLE_REFERENCE_TYPE: BINDING_VARIABLE_TYPE;
        PresetOptions: Context;
    };
}


/**
 * Wick component parser and component library.
 */
export type WickLibrary = typeof createComponent & WickCompiler & typeof wick_runtime;

/** README:USAGE
 * 
 * #### HTML - Client Side Component Rendering
 * ```ts
 * import wick from "@candlelib/wick";
 *
 * // Calls to Wick return an object that can then be used to 
 * // render components. The pending attribute allows wick to 
 * // Operate asynchronously as it gathers the resources 
 * // necessary to compile the givin component.
 * 
 * const comp_constructor: ExtendedComponentData = await wick("./local_directory/my_component.wick").pending;
 * 
 * // Runtime components can be mounted to the DOM and
 * // can update DOM content reactively based on data submitted
 * // to the component.
 * const comp: RTComponent = new comp_constructor.class();
 * 
 * comp.appendToDOM(document.body)
 * ```
 */
const wick: WickLibrary = Object.assign(
    createComponent,
    wick_runtime,
    <WickCompiler>{

        css_selector_helpers,

        types: <WickCompiler["types"]><unknown>{
            CSSNodeType: CSSNodeTypeLU,
            JSNodeType: JSNodeTypeLU,
            HTMLNodeType: HTMLNodeTypeLU
        },

        rt: rt,

        root_components: [],

        get context() { return rt.context; },

        utils: {
            parse: {
                css_selector_helpers: css_selector_helpers,
                createNameHash: ComponentHash,
                parser: parse_component,
                render: renderWithFormatting,
            },

            server: async function (root_dir: string = "") {
                await URL.server(root_dir);
            },

            enableServer: async function (root_dir: string = "") {
                await URL.server(root_dir);
            },
            /**
             * Configure runtime components and component data objects 
             * with methods useful for testing behavior.
             */
            enableTest: init_build_system,

            setWrapper: async function (url) {
                //create new component

                if (!rt.context)
                    rt.context = new Context();

                rt.context.wrapper = await <any>wick(url);
            },

            componentToClass: componentDataToJS,

            componentToClassString: createCompiledComponentClass,

            componentDataToHTML,
            componentDataToCSS,
            componentDataToJSCached: componentDataToJSCached,
            componentDataToClass: componentDataToJS,
            componentDataToClassString: createCompiledComponentClass,
            createNameHash: ComponentHash
        },

        objects: {
            WickRTComponent,
            Context: Context,
            Observable,
            ObservableScheme<T>(obj: T): ObservableScheme__<T> & T {
                return <any>new ObservableScheme__(obj);
            }
        },

    });


export default wick;




