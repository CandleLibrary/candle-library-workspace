import { CSSNodeType, CSSNodeFlags } from "../types/node_type.js";
import { CSSNode, CSSRuleNode, CSSSelectorNode } from "../types/node.js";
import { PrecedenceFlags } from '../types/precedence_flags.js';

import { traverse } from "@candlelib/conflagrate";

export interface SelectionHelpers<Element> {
    hasAttribute: (ele: Element, namespace: string, name: string, value: string, sym: string, modifier: string) => boolean;
    hasType: (ele: Element, namespace: string, type: string) => boolean;
    hasClass: (ele: Element, class_: string) => boolean;
    hasID: (ele: Element, id: string) => boolean;
    hasPseudoClass: (ele: Element, id: string, val: string) => boolean;
    hasPseudoElement: (ele: Element, id: string, val: string) => boolean;
    WQmatch: (ele: Element, wq_selector: CSSNode) => string;
    getParent: (ele: Element) => Element;
    getChildren: (ele: Element) => Element[];
    getIndexFigures: (ele, tag_name) => { tag_index: number, ele_index: number; };
}

export const DOMHelpers: SelectionHelpers<HTMLElement> = {

    hasAttribute: (ele, namespace, name, value, sym, modifier) => {
        const attrib = ele.getAttribute(name);
        if (attrib)
            if (value) return value == attrib;
            else return true;
        return false;
    },

    hasType: (ele, namespace, name) => {
        if (!namespace)
            return ele.tagName == name.toUpperCase();
    },

    hasClass: (ele, class_) => {
        return ele.classList.contains(class_);
    },

    hasID: (ele, id) => {
        return ele.id == id;
    },

    hasPseudoClass: (ele, id, val) => {
        // TODO: Implement handlers for the list 
        // at https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
        return true;
    },

    hasPseudoElement: (ele, id, val) => {
        // TODO: Implement handlers for the list 
        // at https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
        return true;
    },

    WQmatch: (ele, wq_selector: CSSSelectorNode) => wq_selector.val,

    getParent(ele) {
        return ele.parentElement;
    },

    getIndexFigures(ele, tag_name): { tag_index: number, ele_index: number; } {
        const par = this.get(parent);

        let tag_index = 0;
        let ele_index = 0;

        for (const child of par.children) {
            if (child == ele) break;
            if (child.tagName == tag_name.toUpperCase) tag_index++;
            ele_index++;
        }

        return {
            tag_index,
            ele_index
        };
    },

    getChildren(ele) {
        return <HTMLElement[]>Array.from(ele.children);
    }
};

export function matchElement<Element>(ele, selector: CSSSelectorNode, helpers: SelectionHelpers<Element>, meta?: any): boolean {

    switch (selector.type) {

        case CSSNodeType.ComplexSelector: //Complex
            {
                const selectors = selector.nodes.slice().reverse();
                for (let i = 0; i < selectors.length;) {
                    const sel = selectors[i];

                    if (!matchElement(ele, sel, helpers)) {
                        if (!helpers.getParent(ele) || i == 0)
                            return false;
                    } else
                        i++;

                    ele = helpers.getParent(ele);

                    if (!ele) return false;

                }
            }
            break;

        case CSSNodeType.CompoundSelector:
            for (const sel of selector.nodes)
                if (!matchElement(ele, sel, helpers)) return false;
            break;

        case CSSNodeType.TypeSelector: {
            const { ns, val } = <CSSSelectorNode>selector.nodes[0];
            return helpers.hasType(ele, ns, val);
        }

        case CSSNodeType.MetaSelector:
            return true;

        case CSSNodeType.AttributeSelector: {
            const { ns, val } = <CSSSelectorNode>selector.nodes[0];
            return helpers.hasAttribute(ele, ns, val, selector.match_type, selector.match_val, selector.mod);
        }

        case CSSNodeType.ClassSelector:
            return helpers.hasClass(ele, selector.val);

        case CSSNodeType.IdSelector:
            return helpers.hasID(ele, selector.val);

        case CSSNodeType.PseudoClassSelector:
            return helpers.hasPseudoClass(ele, selector.id, selector.val);

        case CSSNodeType.PseudoElementSelector:
            return helpers.hasPseudoElement(ele, selector.id, selector.val);
    }

    return true;
}

/**
 * Return a number representing the precedence value for the selector
 */
export function getSelectorSpecificityValue(selector: CSSNode): PrecedenceFlags {

    let val = 0;

    for (const { node: sel } of traverse(<CSSSelectorNode>selector, "nodes")
        .bitFilter("type", CSSNodeFlags.SELECTOR)
    ) val += sel.precedence || 0;

    return val;
}

export function isSelectorEqual(a: CSSSelectorNode, b: CSSSelectorNode) {
    if (b.type == a.type) {
        switch (b.type) {

            case CSSNodeType.ComplexSelector:
            case CSSNodeType.CompoundSelector:
                {

                    if (a.nodes.length == b.nodes.length) {
                        const selectorsA = a.nodes;
                        const selectorsB = b.nodes;

                        for (let i = 0; i < selectorsA.length; i++) {
                            const a_sub = selectorsA[i],
                                b_sub = selectorsB[i];
                            if (!isSelectorEqual(a_sub, b_sub)) return false;
                        }

                        return true;
                    }
                }
                break;

            case CSSNodeType.TypeSelector:
                return a.ns == b.ns && b.val == a.val;

            case CSSNodeType.AttributeSelector:
                return a.ns == b.ns && b.val == a.val && a.match_type == b.match_type && b.match_val == a.match_val && b.mod == a.mod;

            case CSSNodeType.ClassSelector:
            case CSSNodeType.IdSelector:
                return b.val == a.val;

            case CSSNodeType.PseudoClassSelector:
            case CSSNodeType.PseudoElementSelector:
                return a.id == b.id && b.val == a.val;
        }
    }


    return false;
}

export function matchAnySelector<Element>(ele: Element, helpers: SelectionHelpers<any> = DOMHelpers, ...selectors: CSSNode[]): boolean {
    for (const selector of selectors)
        if (matchElement<Element>(ele, selector, helpers))
            return true;
    return false;
}

export function* getMatchedElements<Element = HTMLElement>(
    ele: Element,
    node: CSSNode,
    helpers: SelectionHelpers<any> = DOMHelpers
): Generator<Element, Element> {

    let selectors = null;

    if (node.type == CSSNodeType.Rule) {
        selectors = node.selectors;
    } else if (node.type == CSSNodeType.Stylesheet) {
        selectors = node.nodes
            .filter(n => n.type == CSSNodeType.Rule)
            .flatMap(r => r.selectors);
    } else selectors = [node];

    if (matchAnySelector<Element>(ele, helpers, ...selectors)) yield ele;

    for (const c_ele of helpers.getChildren(ele))
        yield* getMatchedElements<Element>(c_ele, node, helpers);

    return;
};

export function getMatchedSelectors<Element>(rule: CSSRuleNode, ele: Element, helpers: SelectionHelpers<any> = DOMHelpers): CSSNode[] {

    const matches = [];

    if (!rule.type || rule.type !== CSSNodeType.Rule)
        throw new Error("rule argument is not a CSSNodeType.Rule");

    for (const match_selector of rule.selectors) {
        if (matchElement<Element>(ele, match_selector, helpers)) matches.push(match_selector);
    }

    return matches;
}

export function getFirstMatchedSelector<Element>(rule: CSSRuleNode, ele: Element, helpers: SelectionHelpers<any> = DOMHelpers) {
    return getMatchedSelectors(rule, ele, helpers)[0];
}

export function doesRuleHaveMatchingSelector(rule: CSSRuleNode, selector: CSSNode): boolean {

    if (!rule.type || rule.type !== CSSNodeType.Rule)
        throw new Error("rule argument is not a CSSNodeType.Rule");

    for (const match_selector of rule.selectors) {
        if (isSelectorEqual(selector, match_selector)) return true;
    }
    return false;
}

export function getLastRuleWithMatchingSelector(
    stylesheet: CSSNode,
    selector: CSSNode,
    helpers: SelectionHelpers<any> = DOMHelpers
): CSSRuleNode {
    if (stylesheet.type != CSSNodeType.Stylesheet) return null;

    for (const node of stylesheet.nodes.reverse()) {
        if (node.type == CSSNodeType.Rule) {
            if (doesRuleHaveMatchingSelector(node, selector)) return node;
        } else if (node.type == CSSNodeType.Media) {

        }
    }

    return null;
}

export const getMatchedHTMLElements = (ele: HTMLElement, selector) => getMatchedElements<HTMLElement>(ele, selector, DOMHelpers);

