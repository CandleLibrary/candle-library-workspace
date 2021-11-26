import { tools } from "@candlelib/css";
import { HTMLNode } from '../../types/wick_ast';
export const css_selector_helpers: tools.selectors.SelectionHelpers<HTMLNode> = {

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
        .filter(({ value: v }) => v == class_)
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

        return ele.tag &&
            ele.tag.toUpperCase() == type.toUpperCase();
    }
};
