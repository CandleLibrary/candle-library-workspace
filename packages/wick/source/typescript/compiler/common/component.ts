import { Token } from '@candlelib/hydrocarbon';
import { default as URI, default as URL } from "@candlelib/uri";
import { WickRTComponent } from "../../runtime/component.js";
import { FunctionFrame, HTMLElementNode, HTMLNode, HTMLNodeType, IndirectHook, IntermediateHook } from "../../types/all.js";
import { ComponentStyle } from "../../types/component";
import { TemplateHTMLNode } from "../../types/html";
import { addBindingVariable } from './binding.js';
import { Context } from './context.js';
import { ComponentHash } from "./hash_name.js";

export function createErrorComponent(
    errors: Error[],
    src: string,
    location: URL,
    component: ComponentData = createComponentData(src, location)
) {

    const error_data = [...errors
        .map(
            e => (e.stack + "")
            //.split("\n")
        )
        //.map(s => s.replace(/\ /g, "\u00A0"))
    ]
        .map(e => <HTMLElementNode>{
            type: HTMLNodeType.HTML_P,
            pos: new Token("", "", 0, 0),
            tag: "p",
            nodes: [
                {
                    type: HTMLNodeType.HTMLText,
                    data: e.replace(/>/g, "&gt;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/\n/g, "<br/>")
                        .replace(/\s/g, "&#8199;")
                }
            ]
        });

    const pos = new Token(component.source, "", 0, 0);

    component.errors.push(...errors);

    component.HTML = <HTMLElementNode>{
        type: HTMLNodeType.HTML_Element,
        tag: "ERROR",
        id: 0,
        attributes: [
            { type: HTMLNodeType.HTMLAttribute, name: "style", value: "font-family:monospace" }
        ],
        nodes: [
            {
                tag: "div",
                nodes: [{
                    tag_name: "p",
                    nodes: [
                        {
                            tag_name: "",
                            data: `Error in ${location}:`,
                            //@ts-ignore
                            pos: {}
                        }
                    ]
                }, ...error_data],
                pos
            }
        ],
        pos
    };

    component.HAS_ERRORS = true;

    return component;
}
/**
 * A message emited from a compile process
 * indicating some problem that does not affect
 * the compilation of a component but may need
 * to be addressed by the component author.
 */
export interface CompileWarning {
    id: string,
    message: string,
    source?: URI,
    loc?: Token
}

/**
 * A message emited from a compile process
 * indicating some problem that does not affect
 * the compilation of a component but may need
 * to be addressed by the component author.
 */
export interface CompileError {
    id: string,
    message: string,
    error: Error,
    source?: URI,
    loc?: Token
}

/**
 * Primary store of data for a compiled component, including
 * method contexts, CSS source and compiled information, and 
 * HTML AST.
 */
export class ComponentData {

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

    /**
     * A list of errors encountered during the parse or
     * compile phases. No attempt to render the component
     * should be made if there are errors, as this output 
     * from such a component is undefined.
     */
    errors: Error[];

    /**
     * A list of warnings that have been encountered 
     * during the parse or compile phases.
     */
    warnings: CompileWarning[];

    /**
     * Count of number of container tags identified in HTML
     */
    container_count: number;

    /**
     * Child Components
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
     * modified by the binding variable, including HTML attributes and
     * CSS attributes.
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


    /**
     * A list of URI's to resources and nodes that defined the URI
     */
    URI: { type: "src" | "href" | "other", uri: string, node: Node }[]

    indirect_hooks: IndirectHook<any>[];

    element_counter: number;

    context: Context;

    text_hash: string;
    code_hash: string;
    ele_hash: string;
    css_hash: string;
    import_hash: string;
    source_hash: string;


    constructor(source_string: string, location: URL) {

        this.name = ComponentHash(source_string);

        this.container_count = 0;

        this.global_model_name = "";

        this.source = source_string;
        //Local names of imported components that are referenced in HTML expressions. 
        this.local_component_names = new Map;

        this.location = new URL(location);

        this.root_frame = null;

        this.HTML = null;

        this.HAS_ERRORS = false;

        this.TEMPLATE = false;

        this.RADIATE = false;

        this.names = [];

        this.frames = [];

        this.HTML_HEAD = [];

        this.CSS = [];

        this.INLINE_HTML = [];

        this.children = [];

        this.errors = [];

        this.root_ele_claims = [];

        this.indirect_hooks = [];

        this.URI = []

        this.template = null;

        this.context = null;

        this.element_counter = -1;

        this.ele_hash = "";

        this.text_hash = "";

        this.css_hash = "";

        this.code_hash = "";

        this.source_hash = "";
    }
    /**
     * Return a copy of this component with references
     * to unique objects. 
     */
    copy() {
        const new_comp = new ComponentData(this.source, new URI(this.location));

        new_comp.errors = this.errors.slice();
        new_comp.CSS = this.CSS.slice();
        new_comp.INLINE_HTML = this.INLINE_HTML.slice();
        new_comp.children = this.children.slice();
        new_comp.root_ele_claims = this.root_ele_claims.slice();
        new_comp.indirect_hooks = this.indirect_hooks.slice();
        new_comp.HTML = this.HTML;
        new_comp.HAS_ERRORS = this.HAS_ERRORS;
        new_comp.TEMPLATE = this.TEMPLATE;
        new_comp.RADIATE = this.RADIATE;



        new_comp.ele_hash = this.ele_hash;
        new_comp.text_hash = this.text_hash;
        new_comp.css_hash = this.css_hash;
        new_comp.code_hash = this.code_hash;
        new_comp.source_hash = this.source_hash;

        return new_comp;
    }

    get class(): typeof WickRTComponent {
        return this.context.component_class.get(this.name);
    }

    get class_with_integrated_css() {
        return this.context.component_class.get(this.name);
    }

    get class_string() {
        return this.context.component_class_string.get(this.name);
    }

    createInstance(model: any = null): WickRTComponent {
        return new this.class(model);
    }

    mount(model: any, ele: HTMLElement): WickRTComponent {
        const comp_inst = this.createInstance(model);
        comp_inst.appendToDOM(ele);
        return comp_inst;
    }
}

export function createComponentData(source_string: string, location: URL): ComponentData {
    return new ComponentData(source_string, location);
}

/**
 * Take the data from the source component and merge it into the destination component. Asserts
 * the source component has only CSS and Javascript data, and does not represent an HTML element.
 * @param destination_component 
 * @param source_component 
 */
export function mergeComponentData(destination_component: ComponentData, source_component: ComponentData) {

    if (source_component.CSS) destination_component.CSS.push(...source_component.CSS);

    if (!destination_component.HTML)
        destination_component.HTML = source_component.HTML;
    else
        throw new Error(`Cannot combine components. The source component ${source_component.location} contains a default HTML export that conflicts with the destination component ${destination_component.location}`);

    for (const [, { external_name, flags, internal_name, pos, type }] of source_component.root_frame.binding_variables.entries())
        addBindingVariable(destination_component.root_frame, internal_name, pos, type, external_name, flags);

    for (const name of source_component.names)
        destination_component.names.push(name);

    destination_component.frames.push(...source_component.frames);
}
