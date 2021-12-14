import { traverse } from "@candlelib/conflagrate";
import { CSSNode, CSSNodeType } from "@candlelib/css";
import { CSSSelectorNode } from "@candlelib/css/build/types/types/node";
import { ComponentStyle, HTMLElementNode } from "../../types/all.js";
import { ComponentData } from '../common/component.js';
import { getElementAtIndex } from "../common/html.js";
import { parse_css_selector } from "../source-code-parse/parse.js";
import { renderNew, renderNewFormatted } from "../source-code-render/render.js";

export function UpdateSelector(
    node: CSSNode, name: string,
    class_selector: CSSSelectorNode,
    ADD_COMPONENT_SCOPE: boolean = true
) {
    if (node.selectors)
        node.selectors = node.selectors.map(s => {

            let HAS_ROOT = false;
            const ns = { ast: null };

            for (const { node, meta: { replace } } of traverse(s, "nodes")
                .makeReplaceable()
                .extract(ns)
            ) {

                switch (node.type) {
                    case CSSNodeType.TypeSelector:
                        const val = (<any>node).nodes[0].val;
                        if (val == "root") {
                            const obj = Object.assign({}, class_selector, { pos: node.pos });
                            replace(obj);
                            HAS_ROOT = true;
                        } else if (val == "body") {
                            HAS_ROOT = true;
                        }
                    default:
                        break;
                }
            }

            if (!HAS_ROOT && ADD_COMPONENT_SCOPE) {
                const ns = parse_css_selector(`.${name} ${renderWithFormatting(s)}`);
                ns.pos = s.pos;
                return ns;
            }

            return ns.ast;
        });

}

export function componentToMutatedCSS(
    css: ComponentStyle,
    component?: ComponentData,
    ADD_COMPONENT_SCOPE: boolean = true
): CSSNode {

    const r = { ast: null };

    const host_ele = getElementAtIndex<HTMLElementNode>(component, css.container_element_index);

    let class_selector = null;

    const name = component.name;

    if (host_ele?.component_name && host_ele != component.HTML) {

        const expat_node = host_ele.attributes.find(({ name }) => name == "expat");

        class_selector = parse_css_selector(`${host_ele.tag}[expat="${expat_node[1]}"]`);

    } else
        class_selector = parse_css_selector(`.${name}`);

    for (const { node, meta: { replace } } of traverse(css.data, "nodes")
        .filter("type", CSSNodeType.Rule)
        .makeReplaceable()
        .extract(r)
    ) {
        const copy = Object.assign({}, node);

        if (component)
            UpdateSelector(copy, name, class_selector, ADD_COMPONENT_SCOPE);

        replace(copy);
    }

    return <CSSNode>r.ast;
}

export function getCSSStringFromComponentStyle(
    css: ComponentStyle,
    component?: ComponentData,
    ADD_COMPONENT_SCOPE: boolean = true
) {
    if (css.data) {

        const css_data = ADD_COMPONENT_SCOPE
            ? componentToMutatedCSS(css, component)
            : css.data;

        return renderNewFormatted(css_data);
    }

    return "";
}

export function componentDataToCSS(component: ComponentData): string {

    // Get all css data from component and it's children,
    // Include pure CSS components (components that only have CSS data),
    // in the main components context.

    return component.CSS.map(c => getCSSStringFromComponentStyle(c, component))
        .join("\n");
}
