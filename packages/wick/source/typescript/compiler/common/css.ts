import { tools } from "@candlelib/css";
import { HTMLElementNode } from '../../types/wick_ast';
import { getAttributeValue, hasAttribute } from './html.js';
export const css_selector_helpers: tools.selectors.SelectionHelpers<HTMLElementNode> = {

    getIndexFigures: (ele, tag) => ({ ele_index: 0, tag_index: 0 }),

    WQmatch: (ele, wq_selector) => (<any>wq_selector).val,
    getChildren: (ele) => (ele.nodes && ele.nodes.slice().map(e => Object.assign({}, e)).map(e => ((e.parent = ele), e))) || [],

    getParent: (ele) => ele.parent,

    hasAttribute: (ele, namespace, name, value, sym, modifier) => "attributes" in ele && ele.attributes
        .filter(({ name: key }) => key == name)
        .filter(({ value: v }) => !value || v == value)

        .length > 0,

    hasClass: (ele, class_) => "attributes" in ele && ele.attributes
        .filter(({ name: key }) => key == "class")
        .filter(({ value: v }) => v.toString().split(" ").map(b => b.trim()).includes(class_))
        .length > 0,

    hasID: (ele, id) => "attributes" in ele && ele.attributes
        .filter(({ name: key }) => key == "id")
        .filter(({ value: v }) => v == id)
        .length > 0,

    hasPseudoClass: (ele, id, val) => false,

    hasPseudoElement: (ele, id, val) => false,

    hasType: (ele, namespace, type): boolean => {

        if (type == "root")
            return ele.id == 0;

        if (hasAttribute("comp-tag", ele)) {
            const tag = getAttributeValue("comp-tag", ele);
            if (typeof tag == "string") {
                if (tag.toUpperCase() == type.toUpperCase())
                    return true;
            }
        }

        return !!ele.tag && ele.tag.toUpperCase() == type.toUpperCase();
    }
};
