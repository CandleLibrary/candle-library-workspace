import { rt } from "../../client/runtime/runtime.js";
import {
    HTMLContainerNode,
    HTMLElementNode,
    HTMLNode,
    htmlState,
    IndirectHook,
    STATIC_RESOLUTION_TYPE,
    TemplateHTMLNode,
    TemplatePackage,
    WickBindingNode,
    BINDING_VARIABLE_TYPE
} from "../../types/all.js";
import * as b_sys from "../build_system.js";
import { getBindingFromExternalName } from '../common/binding.js';
import { ComponentData } from '../common/component.js';
import { Context } from '../common/context.js';
import { getExpressionStaticResolutionType, getStaticValue, StaticDataPack } from "../data/static_resolution.js";
import {
    ContainerDataHook,
    ContainerFilterHook,
    ContainerLimitHook,
    ContainerOffsetHook,
    ContainerScrubHook,
    ContainerShiftHook,
    ContainerSortHook,
    ContainerUseIfHook
} from "../features/container_features.js";
import { processHookForHTML } from "./hooks.js";

enum HTMLAnnotationMode {
    /** 
     * Remove All Wick Attribute Annotations 
     *
     * Useful when the output is not expected
     * to be used with hydrated runtime components.
     */
    PURE,

    /**
     * Annotate Binding Elements Only
     * 
     * Only provide annotations for elements
     * that will be modified in some way by
     * a Wick runtime component.
     */

    MINIMAL,

    /**
     * Annotate Anything And Everything
     * 
     * Do not remove any annotation attribute.
     * Needed by Flame edit system to correctly
     * synchronize changes between browser and 
     * backend edit server.
     */
    VERBOSE,
}


export async function componentDataToCompiledHTML(
    comp: ComponentData,
    context: Context = rt.context,
    model = null,
): Promise<TemplatePackage> {

    const static_data_pack: StaticDataPack = {
        context,
        self: comp,
        model: model,
        root_element: comp.HTML,
        prev: null
    };

    let n: TemplateHTMLNode = {
        tagName: "",
        data: "",
        attributes: new Map(),
        children: [],
        strings: [],
    };

    const template_map = new Map;

    const { node } = await addComponent(
        comp.HTML,
        static_data_pack,
        comp.name,
        htmlState.IS_ROOT | htmlState.IS_COMPONENT,
        n,
        template_map,
    );

    return { html: [node], templates: template_map };
}


/**
 * Compile component HTML information (including child component and slot information), into a string containing the components html
 * tree and template html elements for components referenced in containers.
 *
 * @param comp
 * @param context
 * @param template_map
 * @param html
 * @param root
 */
export async function __componentDataToCompiledHTML__(
    html: HTMLNode,
    static_data_pack: StaticDataPack,
    template_map: TemplatePackage["templates"] = new Map,
    state: htmlState = htmlState.IS_ROOT | htmlState.IS_COMPONENT,
    extern_children: { USED: boolean; child: HTMLNode; id: number; }[] = [],
    comp_data = [static_data_pack.self.name]
): Promise<TemplatePackage> {

    const { context, } = static_data_pack;

    let node: TemplateHTMLNode = {
        tagName: "",
        data: "",
        attributes: new Map(),
        children: [],
        strings: [],
    };

    if (html) {
        //Convert html to string 
        const {
            tag: tag_name = "",
            nodes: c = [],
            component_name: component_name,
            slot_name: slot_name,
            name_space: namespace_id
        }: HTMLNode = html,
            children = c.map(i => ({ USED: false, child: i, id: comp_data.length - 1 }));

        if (namespace_id)
            node.namespace = namespace_id;

        if ("IS_CONTAINER" in html && html.IS_CONTAINER) {

            await addContainer(
                html,
                static_data_pack,
                state,
                template_map,
                node
            );

        } else if (component_name && context.components?.has(component_name)) {

            ({ node, state } =
                await addComponent(
                    html,
                    static_data_pack,
                    component_name,
                    state,
                    node,
                    template_map,
                    extern_children,
                    children,
                    comp_data,
                )
            );

        } else if (tag_name) {

            if (tag_name == "SLOT" && extern_children.length > 0 && slot_name) {

                let r_ = await processSlot(
                    html,
                    static_data_pack,
                    template_map,
                    slot_name,
                    extern_children,
                );

                if (r_.html.length > 0)
                    return r_;
            }

            await processElement(html, static_data_pack, node, tag_name, state, template_map);

        } else if ("IS_BINDING" in html) {

            node = await resolveHTMLBinding(html, static_data_pack, state, node, comp_data);

        } else if ("data" in html)

            processTextNode(node, html.data);

        const child_state = (((state) & (htmlState.IS_INTERLEAVED | htmlState.IS_COMPONENT))
            == (htmlState.IS_INTERLEAVED | htmlState.IS_COMPONENT))
            ? htmlState.IS_INTERLEAVED : 0;

        if (!(state & htmlState.IS_ROOT))
            addClaim(node, html, comp_data);

        for (const { child } of children.filter(n => !n.USED)) {

            const { html } = await __componentDataToCompiledHTML__(
                child,
                static_data_pack,
                template_map,
                child_state,
                extern_children,
                comp_data
            );
            if (!node.children)
                node.children = [];

            node.children.push(...html);
        }

    }

    node.data ||= "";

    return { html: [node], templates: template_map };
}


function processTextNode(node: TemplateHTMLNode, data: string) {
    node.data = data;
}

async function processElement(
    html: HTMLElementNode,
    static_data_pack: StaticDataPack,
    node: TemplateHTMLNode,
    tag_name: string,
    state: htmlState,
    template_map: TemplatePackage["templates"]
) {
    await processHooks(html, static_data_pack, node, template_map);

    const COMPONENT_IS_ROOT_ELEMENT = static_data_pack.self.HTML == html;

    node.tagName = tag_name.toLocaleLowerCase();

    setScopeAssignment(state, node, html);

    processAttributes(html.attributes, node);

    if (COMPONENT_IS_ROOT_ELEMENT)
        addAttribute(node, "class", "wk-c");

}

function addClaim(
    node: TemplateHTMLNode,
    html: HTMLElementNode,
    comp_data: string[],
) {

    if (!html.comp)
        throw new Error("Missing component name");

    const i = comp_data.indexOf(html.comp);

    if (i < 0)
        throw new Error("Invalid component claim information");

    addAttribute(node, "class", "wk-claim-" + i);

}

function setAttribute(node: TemplateHTMLNode, attrib_name: string, ...attrib_val: string[]) {

    if (!node.attributes)
        node.attributes = new Map;

    node.attributes.set(attrib_name, attrib_val);
}

function addAttribute(node: TemplateHTMLNode, attrib_name: string, ...attrib_val: string[]) {
    if (!node.attributes)
        node.attributes = new Map;

    if (!node.attributes.has(attrib_name))
        node.attributes.set(attrib_name, attrib_val);
    else
        node.attributes.get(attrib_name)?.push(...attrib_val);
}

function setScopeAssignment(state: htmlState, node: TemplateHTMLNode, html: HTMLElementNode) {

    if (!node.attributes)
        node.attributes = new Map;

    if (state & htmlState.IS_SLOT_REPLACEMENT)
        addAttribute(node, "class", "wk-r-" + ((html?.host_component_index ?? 0) * 50 + (html.id ?? 0)) + "");
}
/**
 * Process a slot element, merging the contents of an external element
 * with the slot if an element has a `slot=*` attribute that matches the
 * slot name.
 * 
 * @param static_data_pack 
 * @param template_map 
 * @param slot_name 
 * @param extern_children 
 * @returns 
 */
async function processSlot(
    slot: HTMLNode,
    static_data_pack: StaticDataPack,
    template_map: TemplatePackage["templates"],
    slot_name: string,
    extern_children: { USED: boolean; child: HTMLNode; id: number; }[],
): Promise<TemplatePackage> {
    let r_: TemplatePackage = { html: [], templates: template_map };

    if (slot_name != "") {

        for (let i = 0; i < extern_children.length; i++) {

            const pkg = extern_children[i];

            if (pkg.child.slot_name == slot_name && !pkg.USED) {

                pkg.USED = true;

                pkg.child.host_component_index = pkg.id;
                r_.html.push(...(await __componentDataToCompiledHTML__(
                    pkg.child,
                    static_data_pack,
                    template_map,
                    htmlState.IS_SLOT_REPLACEMENT
                )).html);
            }
        }

    } else {

        for (let i = 0; i < extern_children.length; i++) {

            const pkg = extern_children[i];

            if (!pkg.child.slot_name && !pkg.USED) {

                pkg.USED = true;

                pkg.child.host_component_index = pkg.id;

                r_.html.push(...(await __componentDataToCompiledHTML__(
                    pkg.child,
                    static_data_pack,
                    template_map,
                    htmlState.IS_SLOT_REPLACEMENT
                )).html);
            }
        }
    }

    return r_;
}


async function addComponent(
    html: HTMLElementNode,
    static_data_pack: StaticDataPack,
    component_name: string,
    state: htmlState,
    node: TemplateHTMLNode,
    template_map: TemplatePackage["templates"],
    extern_children: { USED: boolean; child: HTMLNode; id: number; }[] = [],
    children: { USED: boolean; child: HTMLNode; id: number; }[] = [],
    comp_data: string[] = [],
) {

    const { context, self: comp, model } = static_data_pack;

    const c_comp = context.components.get(component_name);

    if (!c_comp)
        throw new Error(`Component ${component_name} not found.`);

    const claims = c_comp.root_ele_claims;

    if (htmlState.IS_COMPONENT & state)
        state |= htmlState.IS_INTERLEAVED;

    const new_static_data_pack: StaticDataPack = {
        root_element: html || c_comp.HTML,
        self: c_comp,
        model: null,
        context: context,
        prev: comp == null ? null : static_data_pack
    };

    ({ html: [node] } = await __componentDataToCompiledHTML__(
        c_comp.HTML,
        new_static_data_pack,
        template_map,
        state | htmlState.IS_ROOT,
        extern_children.concat(children),
        [...comp_data, ...claims]
    ));


    addAttribute(node, "class", ...claims);

    //  comp_data.push(c_comp.name);

    //Merge node attribute data with host entry data, overwrite if necessary

    processAttributes(html.attributes, node,);

    await processHooks(html, static_data_pack, node, template_map, c_comp);

    return { state, node };
}

async function addContainer(
    html: HTMLContainerNode,
    static_data_pack: StaticDataPack,
    state: htmlState,
    template_map: TemplatePackage["templates"],
    node: TemplateHTMLNode,
) {
    const {
        self: component,
        context,
    } = static_data_pack;
    const {
        component_attributes: component_attribs,
        component_names
    } = html,
        w_ctr = component_names.join(" "),
        w_ctr_atr = component_attribs.map(s => s.map(a => a.join(("=").replace(/\"/g, ""))).join(";")).join(":");

    for (const name of component_names) {

        const comp = context.components.get(name);

        if (comp) {


            if (!template_map.has(comp.name) && comp.name != component.name) {

                await ensureComponentHasTemplates(comp, context);

                for (const name of comp.templates)
                    if (context.components.has(name))
                        template_map.set(name, context.components.get(name).template);

                template_map.set(comp.name, comp.template);

            }
        } else {
            throw new Error(`Component ${name} not found`);
        }
    }

    const name = html.tag?.toLowerCase() ?? "";

    if (name == "container")
        node.tagName = "div";
    else
        node.tagName = name;

    addAttribute(node, "class", "wk-ctr");

    addAttribute(node, "data-wkctr", ...component_names);

    addAttribute(node, "data-wkctra", w_ctr_atr);

    setScopeAssignment(state, node, html);

    //get data hook 
    await processHooks(html, static_data_pack, node, template_map);

    await processContainerHooks(html, static_data_pack, node, template_map);

    processAttributes(html.attributes, node);
}


export async function ensureComponentHasTemplates(
    comp: ComponentData,
    context: Context
): Promise<TemplateHTMLNode> {
    if (!comp.template) {

        comp.template = {
            tagName: "template",
            data: "",
            strings: [],
            attributes: new Map([["class", ["wk-c"]], ["id", [comp.name]]]),
            children: []
        };

        comp.templates = new Set();

        b_sys.enableBuildFeatures();

        const { html, templates } = await componentDataToCompiledHTML(comp, context);

        if (comp.template.children)
            comp.template.children.push(...html);

        comp.templates = new Set([comp.name, ...templates.keys()]);

        b_sys.disableBuildFeatures();
    }

    return comp.template;
}

async function processContainerHooks(
    html: HTMLContainerNode,
    static_data_pack: StaticDataPack,
    node: TemplateHTMLNode,
    template_map: TemplatePackage["templates"],
) {
    const
        hooks = getHookFromElement(html, static_data_pack.self),
        data_hook = hooks.find(t => t.type == ContainerDataHook),
        filter_hook = hooks.find(t => t.type == ContainerFilterHook),
        sort_hook = hooks.find(t => t.type == ContainerSortHook),
        limit_hook = hooks.find(t => t.type == ContainerLimitHook),
        offset_hook = hooks.find(t => t.type == ContainerOffsetHook),
        shift_hook = hooks.find(t => t.type == ContainerShiftHook),
        use_if_hooks = hooks.filter(t => t.type == ContainerUseIfHook);

    if (data_hook) {


        let result = await processHookForHTML(data_hook, static_data_pack);

        if (result) {

            let { value: data } = result;

            if (data && Array.isArray(data) && data.length > 0) {

                let limit = data.length, offset = 0, shift = 1;

                if (filter_hook) {
                    const arrow_filter = await processHookForHTML(filter_hook, static_data_pack);
                    if (arrow_filter && arrow_filter.value !== null)
                        data = data.filter(arrow_filter.value);
                }

                if (sort_hook) {
                    const sort_result = await processHookForHTML(sort_hook, static_data_pack);
                    if (sort_result && sort_result.value !== null)
                        data = data.sort(sort_result.value);
                }

                if (limit_hook) {
                    const pending_limit = await processHookForHTML(limit_hook, static_data_pack);
                    if (pending_limit && typeof pending_limit.value == "number")
                        limit = Math.max(0, Math.min(pending_limit.value, data.length));
                }

                if (shift_hook) {
                    const pending_shift = await processHookForHTML(shift_hook, static_data_pack);
                    if (pending_shift && typeof pending_shift.value == "number")
                        shift = Math.max(1, pending_shift.value);
                }

                if (offset_hook) {
                    const pending_offset = await processHookForHTML(offset_hook, static_data_pack);
                    if (pending_offset && typeof pending_offset.value == "number")
                        offset = Math.max(0, Math.min(pending_offset.value, data.length));
                }

                data = data.slice(offset * shift, offset * shift + limit);

                if (data.length > 0) {

                    const

                        comp_name = html.component_names[0],

                        child_comp = static_data_pack.context.components.get(comp_name);

                    //Don't forget use-if hooks which may be present in the above component types.
                    if (child_comp && node.children)
                        for (const model of data) {

                            const new_static_data_pack: StaticDataPack = {
                                self: child_comp,
                                root_element: child_comp.HTML,
                                context: static_data_pack.context,
                                model: model,
                                prev: static_data_pack
                            };

                            const result = await __componentDataToCompiledHTML__(child_comp.HTML, new_static_data_pack, template_map);

                            node.children.push(result.html[0]);
                        }
                }
            }
        }
    }
}

function processAttributes(
    attributes: HTMLElementNode["attributes"],
    node: TemplateHTMLNode,
) {

    if (!attributes)
        return false;

    if (!node.attributes)
        node.attributes = new Map;

    for (const { name: key, value: val } of attributes ?? [])
        setAttributes(node, key, <string>val);
}

function setAttributes(
    node: TemplateHTMLNode,
    key: string,
    val: string,
) {
    if (!node.attributes)
        node.attributes = new Map;

    if (key.toLocaleLowerCase() == "class")
        addAttribute(node, "class", ...val.split(" "));
    else
        setAttribute(node, key, val.toString());
}

async function processHooks(
    html: HTMLNode,
    static_data_pack: StaticDataPack,
    node: TemplateHTMLNode,
    template_map: TemplatePackage["templates"],
    /**
     * This is true if the hook has been defined
     * as an external attribute of the component, 
     * set by that component's parent component. 
     */
    child_comp: ComponentData | null = null
) {
    for (const hook of getHookFromElement(html, static_data_pack.self)
        .filter(
            h => (
                /**
                 * Container hooks are handled by processContainerHooks,
                 * which should be called on container elements only.
                 */
                h.type != ContainerDataHook &&
                h.type != ContainerFilterHook &&
                h.type != ContainerSortHook &&
                h.type != ContainerLimitHook &&
                h.type != ContainerOffsetHook &&
                h.type != ContainerScrubHook &&
                h.type != ContainerShiftHook
            )
        )
    ) {
        const { html, templates } = (await processHookForHTML(hook, static_data_pack) || {});

        if (html) {
            if (html.attributes)
                for (const [k, v] of html.attributes) {

                    // This checks to see if the child component has claimed
                    // the attribute through a "@props" synthetic import.
                    // if so, the attribute is not written out to HTML
                    if (child_comp) {

                        const binding = getBindingFromExternalName(k, child_comp);

                        if (binding && binding.type == BINDING_VARIABLE_TYPE.ATTRIBUTE_VARIABLE)
                            continue;
                    }

                    if (k.toLocaleLowerCase() == "class")
                        addAttribute(node, "class", ...v);
                    else
                        setAttribute(node, k, ...v);
                }

            if (html.children && node.children)
                node.children.push(...html.children);

            if (html.data)
                node.data += html.data;

        } if (templates) {

            for (const [key, val] of templates.entries())
                if (!template_map.has(key)) {
                    template_map.set(key, val);
                }
        }
    }
}


async function resolveHTMLBinding(
    html: WickBindingNode,
    static_data_pack: StaticDataPack,
    state: htmlState,
    node: TemplateHTMLNode,
    comp_data: string[],
): Promise<TemplateHTMLNode> {
    //*


    let value: any = null, child_html: any = null, type: any = null;
    const
        hook = getHookFromElement(html, static_data_pack.self)[0];

    if (hook) {

        type = getExpressionStaticResolutionType(hook.value[0], static_data_pack);

        ({ value, html: child_html } = hook
            ? await getStaticValue(<any>hook.value[0], static_data_pack)
            : { value: null, html: null });
    }

    node.tagName = "w-b";

    if (!node.children)
        node.children = [];

    if (child_html) {
        node.tagName = "w-e";

        const { html } = await __componentDataToCompiledHTML__(
            child_html,
            static_data_pack
        );
        node.children.push(html[0]);

    } else if (value != undefined) {
        if (type == STATIC_RESOLUTION_TYPE.CONSTANT_STATIC) {
            node = {
                data: value + "",
                children: [],
                strings: [],
                attributes: new Map,
                tagName: "",
            };
        } else {
            node.children.push({
                data: value + "",
                children: [],
                strings: [],
                attributes: new Map,
                tagName: "",
            });
        }
    } else if (html.data) {
        node.data = html.data || "";
    }

    return node;
}

function getHookFromElement(ele: HTMLNode, comp: ComponentData): IndirectHook<any>[] {
    let hooks = [];

    for (const hook of comp.indirect_hooks) {
        if (hook.ele_index == ele.id)
            hooks.push(hook);
    }

    return hooks;
}
