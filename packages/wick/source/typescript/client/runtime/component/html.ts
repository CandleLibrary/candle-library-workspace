import { WickRTComponent } from "./component.js";
import { WickContainer } from "./container.js";
import { rt } from "../global.js";
import { Logger, LogLevel } from '@candlelib/log';

//
// https://www.w3.org/TR/2011/WD-html5-20110525/namespaces.html
//
const namespaces: string[] = [
    "www.w3.org/1999/xhtml",            // Default HTML - 0
    "http://www.w3.org/2000/svg",              // SVG - 1
    "www.w3.org/1998/Math/MathML",      // MATHML - 2
    "www.w3.org/1999/xlink",            // XLINK - 3
    "www.w3.org/XML/1998/namespace",    // XML - 4
    "www.w3.org/2000/xmlns/",           // XMLNS - 5
];



function createText(data: string) {
    return document.createTextNode(data);
}

function createElement(tag_name: string) {
    return document.createElement(tag_name);
}

export function getNameSpace(name_space_lookup: number) {
    return namespaces[name_space_lookup] || "";
}

/**
 * Used for SVG, MATHML.
 * @param tag_name 
 * @param name_space 
 * 
 */
export function createNamespacedElement(
    tag_name: string,
    name_space: string,
    data = ""
): HTMLElement | Text {

    let ele: any = null;

    if (!tag_name) /*TextNode*/ return createText(data);

    if (tag_name == "binding") /*BindingTextNode*/ ele = createText("");

    else if (!name_space) ele = createElement(tag_name);

    else ele = document.createElementNS(name_space, tag_name);

    return ele;
}

export function* getComponentNames(ele: HTMLElement): Generator<string, void, void> {


    const len = ele.classList.length;

    for (let i = 0; i < len; i++)
        if (String_Is_Wick_Hash_ID(ele.classList[i]))
            yield ele.classList[i];
}

const comp_name_regex = /W[_\$a-zA-Z0-9]+/;
export function String_Is_Wick_Hash_ID(str: string): boolean {
    return !!str.match(comp_name_regex);
}

export function Element_Is_Wick_Component(ele: HTMLElement) {
    return (
        ele
        &&
        ele.classList.contains("wk-c")
        &&
        [...getComponentNames(ele)].length > 0
    );
}

export function Element_Is_Wick_Template(ele: HTMLElement) {
    return (
        ele
        &&
        ele.tagName == "TEMPLATE"
        &&
        ele.classList.contains("wk-c")
        &&
        String_Is_Wick_Hash_ID(ele.id + "")
    );
}


export function hydrateComponentElements(pending_component_elements: HTMLElement[]): WickRTComponent[] {
    const components = [];

    for (const hydrate_candidate of pending_component_elements) {

        /**
         * Some components are interleaved, forcing the use of the w:own attribute
         * to untangle interleaved elements. Whether a component is interleaved or not 
         * can be determined by the number of Wick class names present within the 
         * elements class list. If there is more than one matching class name, then 
         * there are interleaved components.
         */
        components.push(hydrateComponentElement(hydrate_candidate));
    }
    //@ts-ignore
    return components.filter(i => i !== null);
}


export function hydrateComponentElement(
    hydrate_candidate: HTMLElement,
    parent_chain: WickRTComponent[] = [],
    existing_comp?: WickRTComponent
) {

    let names = getComponentNames(hydrate_candidate), affinity = 0;

    const parent = parent_chain[parent_chain.length - 1];

    const u = undefined;

    let last_comp: WickRTComponent | null = null;

    for (const component_name of names) {

        const comp_class = rt.gC(component_name);

        if (comp_class) {

            if (!last_comp && existing_comp) {
                last_comp = existing_comp;
                //parent_chain = parent_chain.concat(last_comp);
            } else {

                let comp: WickRTComponent = new (comp_class)(<any>hydrate_candidate, last_comp, parent_chain, u, u);

                comp.hydrate();

                parent_chain = parent_chain.concat(comp);

                last_comp = comp;
            }
        } else
            Logger.get("wick").activate(LogLevel.WARN).warn(`WickRT :: Could not find component data for ${component_name}`);
    }

    if (parent && last_comp && last_comp != parent)
        parent.addChild(last_comp);

    return last_comp;
}

export function hydrateContainerElement(
    ele: HTMLElement,
    parent: WickRTComponent,
    null_elements: HTMLElement[] = []
) {
    const
        comp_constructors = (<string>ele.dataset["wkctr"])
            .split(" ")
            .map(name => parent.context.component_class.get(name)),

        comp_attributes = (ele.dataset["wkctra"] ?? "")
            .split(":")
            .map(e => e.split(";").map(e => <[string, string]>e.split("=")));

    if (comp_constructors.length < 1)
        throw new Error(`Could not find component class for ${name} in component ${parent.name}`);

    const ctr = new WickContainer(comp_constructors, comp_attributes, ele, parent, null_elements);

    parent.ctr.push(ctr);
}

