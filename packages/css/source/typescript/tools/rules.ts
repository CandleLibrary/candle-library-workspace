import { CSSNodeType } from "../types/node_type.js";
import { CSSNode, CSSRuleNode } from "../types/node";
import {
    DOMHelpers,
    getMatchedElements,
    getSelectorSpecificityValue,
    matchElement,
    SelectionHelpers
} from "./selectors.js";
import { selector, properties } from "../parser/parse.js";
import { renderCompressed } from '../render/render.js';
import { PrecedenceFlags } from '../types/precedence_flags.js';

const parent_types = new Set(
    [
        CSSNodeType.Stylesheet,
        CSSNodeType.Keyframes,
        CSSNodeType.Media,
    ]
);


export function attachParents(node: CSSNode): CSSNode {
    if (parent_types.has(node.type)) {
        for (const child_node of node.nodes) {
            child_node.parent = node;
            attachParents(child_node);
        }
    }

    return node;
}
export function removeRule(stylesheet: CSSNode, rule: CSSRuleNode) {

    for (let i = 0; i < stylesheet.nodes.length; i++) {

        const node = stylesheet.nodes[i];

        if (node.type == CSSNodeType.Rule) {
            if (rule == node) {
                stylesheet.nodes.splice(i, 1);
                return true;
            }
        }

        if (node.type == CSSNodeType.Media && removeRule(node, rule))
            return true;

        if (node.type == CSSNodeType.Keyframes && removeRule(node, rule))
            return true;
    }

    return false;
}
export function getNodeHash(node: CSSNode): string {
    switch (node.type) {
        case CSSNodeType.Keyframes:
            return "@k-" + hashString(renderCompressed(node.name)).toString(16);
        case CSSNodeType.Media:
            return "@m-" + hashString(renderCompressed(node.nodes[0])).toString(16);
        case CSSNodeType.Supports:
            return "@s-" + hashString(renderCompressed(node.nodes[0])).toString(16);
        case CSSNodeType.Rule:

            let hash = 0n;

            for (const sel of node.selectors)
                hash = getSelectorHash(sel, hash);

            return "#r-" + hash.toString(16);
    }
}

export function selectMatchingRule(rule_path: string, input_node: CSSNode): CSSNode {
    const segments = rule_path.split("/").map(s => {
        const segment_header = s.slice(0, 3);
        const type = segment_header[1];
        return [{
            "k": CSSNodeType.Keyframes,
            "m": CSSNodeType.Media,
            "s": CSSNodeType.Supports,
            "r": CSSNodeType.Rule,
        }[type], s];
    });

    let out_node = null;

    outer: for (const [type, hash] of segments) {

        for (const node of input_node.nodes) {
            if (node.type == type && getNodeHash(node) == hash) {
                out_node = node;
                continue outer;
            }
        }

        out_node = null;
        break;
    }

    return out_node;
}
/**
 * The path to a rule
 *
 * //@rule/.../rule_selector_hashes
 */

export function createRulePath(rule: CSSRuleNode) {

    const string = [];

    let node = rule;

    while (node) {
        if (node.type == CSSNodeType.Stylesheet) {
            break;
        } else {
            string.push(getNodeHash(node));
        }
        node = node.parent;
    }

    return string.reverse().join("/");
}

export function matchAll<Element>(selector_string, ele, helpers: SelectionHelpers<Element>): Element[] {
    const selector_node = selector(selector_string);
    return [...getMatchedElements<Element>(ele, selector_node, helpers)];
}
function hashString(string: string, hash: bigint = 0n): bigint {

    let i = string.length - 1;

    if (i < 0)
        return hash;

    do {
        const code = BigInt(string.charCodeAt(i));

        hash = (hash << 5n) - hash + code;

        hash &= 0xffffffffffffffn;

    } while (i--);

    return hash;
}

export function getAtHash(selector: CSSRuleNode, hash: bigint = 0n): bigint {
    return hashString(renderCompressed(selector), hash);
}

export function getSelectorHash(selector: CSSRuleNode, hash: bigint = 0n): bigint {
    return hashString(renderCompressed(selector), hash);
}

/**
 * Return the highest specificity of all the selectors
 * attached to this rule.
 */
export function getHighestSpecificity(rule: CSSRuleNode): number {
    return Math.max(0, ...rule.selectors.map(getSelectorSpecificityValue));
};


/**
 * Merges properties and selectors from an array of rules into a single,
 * monolithic rule. Property collisions are resolved in a first-come::only-set
 * basis, unless **!important** has been set on a following property.
 *
 * Assumes rule precedence greatest to least, or lowest to highest (if
 * described as within a CSS).
 *
 * @param rules
 */
export function mergeRulesIntoOne(...rules: CSSRuleNode[]): CSSRuleNode {

    const new_rule = <CSSRuleNode>{
        type: CSSNodeType.Rule,
        props: new Map(),
        selectors: []
    };

    const selectors_set = new Set();

    const prop_set = new Set();

    const props = rules.flatMap(r => [...r.props.values()])
        .reverse()
        .filter(prop => {
            if (prop_set.has(prop.name) && !prop.IMPORTANT) {
                return false;
            }
            prop_set.add(prop.name);
            return true;
        });
    const selectors = rules.flatMap(r => r.selectors);

    for (const prop of props.reverse())
        new_rule.props.set(prop.name, prop);

    for (const selector of selectors) {
        const hash = getSelectorHash(selector);
        if (!selectors_set.has(hash)) {
            selectors_set.add(hash);
            new_rule.selectors.push(selector);
        }
    }

    return new_rule;
}

export function addPropsToRule(rule: CSSRuleNode, prop_string: string): CSSRuleNode {

    const props = properties(prop_string);

    for (const prop of props.values())
        rule.props.set(prop.name, prop);

    return rule;
}
function renderProps(rule: CSSRuleNode) {
    return Array.from(rule.props.values()).join(";");
}
export const newRule = function (): CSSRuleNode {
    return <CSSRuleNode>{
        selectors: [],
        props: new Map,
        type: CSSNodeType.Rule,
        pos: null,
    };
};



/**
 * Yields all rules that match the ele argument. 
 * 
 * Performs cascade precedence calculations on all rules and 
 * applies the value to each rule's precedence property. This performed each time this function is
 * called; Repeated calls to the function may mutate the precedence value on nodes that have been returned
 * by previous calls. 
 * 
 * @param ele - An object that can be treated as an HTMLElement by the helper functions.
 * @param css - A CSSNode with the type **CSSNodeType.StyleSheet**.
 * @param helpers - Set of SelectionHelpers functions; defaults to DOMHelpers.
 * @param cascade_start - An offset that can be applied to the cascade precedence calculation.
 */
export function* getMatchedRulesGen(
    ele: any,
    css: CSSNode,
    helpers: SelectionHelpers<any> = DOMHelpers,
    cascade_start: number = 0
): Generator<CSSRuleNode> {
    let cascade_index = cascade_start;

    if (css.type == CSSNodeType.Stylesheet) {

        for (const rule of css.nodes.filter(r => r.type == CSSNodeType.Rule)) {

            for (const selector of rule.selectors) {

                if (matchElement(ele, selector, helpers)) {

                    rule.precedence = (cascade_index++) << PrecedenceFlags.RULE_ORDER_BIT_SHIFT;

                    yield rule;

                    break;
                }
            }
        }
    }
}

export function doesElementMatch(
    ele: any,
    rule: CSSRuleNode,
    helpers: SelectionHelpers<any> = DOMHelpers
) {
    return rule.selectors.some(s =>
        matchElement(ele, s, helpers)
    );
}


/**
 * Same as @function getMatchedRulesGen, except an array of matched rules is returned.
 */
export function getArrayOfMatchedRules(ele, css, helpers = DOMHelpers, cascade_start: number = 0): CSSRuleNode[] {
    return [...getMatchedRulesGen(ele, css, helpers, cascade_start)];
};
