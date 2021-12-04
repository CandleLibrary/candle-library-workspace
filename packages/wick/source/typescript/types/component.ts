import { CSSNode } from "@candlelib/css";
import URI from "@candlelib/uri";
import { ComponentData } from '../compiler/common/component';
import { WickRTComponent } from "../client/runtime/component/component.js";
import { Comment } from "./comment.js";
import { WickComponentErrorStore } from "./errors.js";
import { FunctionFrame } from "./function_frame";
import { IndirectHook, IntermediateHook } from "./hook";
import { TemplateHTMLNode } from "./html.js";
import { HTMLNode, Node } from "./wick_ast.js";


export type ComponentClassStrings = { class_string: string; source_map: string; };

export interface ComponentStyle {
    data: CSSNode;

    /**
     * The source file location for this 
     * source code
     */
    location: URI;

    container_element_index: number;
}

export interface ComponentDataS {
    /**
     * The radiate client side router should be used if 
     * this true and the component is the root of the 
     * component tree. 
     */
    RADIATE: boolean;

    /**
     * If true, this component serves as the basis for 
     * a template. use `import {define_ids} from "@template"`
     * to create components from this template. 
     */
    TEMPLATE: boolean;

    /**
     * True if errors were encountered when processing
     * the component. Also, if true, this component will
     * generate an error report element if it is mounted
     * to the DOM.
     */
    HAS_ERRORS: boolean;

    errors: Error[];

    /**
     * Count of number of container tags identified in HTML
     */
    container_count: number;

    /**
     * Child id counter;
     */
    children: number[];

    /**
     * Name of a model defined in context that will be auto assigned to the
     * component instance when it is created.
     */
    global_model_name: string;

    /**
     * Functions blocks that identify the input and output variables that are consumed
     * and produced by the function.
     */
    frames: FunctionFrame[];

    /**
     * Globally unique string identifying this particular component.
     */
    name: string;

    /**
     * Global string identifiers for this particular component
     */
    names: string[];

    /**
     * A linkage between a binding variable and any element that is
     * modified by the binding variable, including HTML attributes,
     * CSS attributes, and other binding variables.
     */
    hooks: IntermediateHook[];

    /**
     * The virtual DOM as described within a component with a .html extension or with a
     */
    HTML: HTMLNode;

    /**
     * HTML elements that should be placed in the head of the document
     */
    HTML_HEAD: HTMLNode[];

    /**
     * HTML nodes that are defined within JS expressions and may
     * be integrated into the root HTML element through bindings.
     */
    INLINE_HTML: HTMLNode[];

    CSS: ComponentStyle[];

    /**
     * URL of source file for this component
     */
    location: URI;

    /**
     * Mapping between import names and hash names of components that are 
     * referenced in other components.
     */
    local_component_names: Map<string, string>;

    /**
     * Original source string.
     */
    source: string;

    /**
     * The root function frame
     */
    root_frame: FunctionFrame;

    /**
     * Array of Lexers fenced to comment sections
     */
    comments?: Comment[];

    /**
     * List of foreign component hash names that claim this component's 
     * root ele. The first element is the "owner" component that has full 
     * control of the element. Subsequent listed components are "borrowers" 
     * of the element.
     */
    root_ele_claims: string[];

    /**
     * A a template object for use with static pages
     */
    template: TemplateHTMLNode;

    /**
     * A list of component names that whose templates are needed to 
     * correctly render this component.
     */
    templates: Set<string>;

    indirect_hooks: IndirectHook<any>[];

    element_counter: number;

    element_index_remap: Map<number, number>;

}

/**
 * A compiled component that can be mounted to a DOM node.
 */

interface Extension {
    errors: WickComponentErrorStore;
    pending: Promise<Extension & ComponentData>;
    mount: (data?: object, ele?: HTMLElement) => Promise<WickRTComponent>;
    class: typeof WickRTComponent;
    class_with_integrated_css: typeof WickRTComponent;
    class_string: string;
}
/**
 * @type {ExtendedComponentData}
 */
export type ExtendedComponentData = (ComponentData & Extension);
