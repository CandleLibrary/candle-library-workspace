import { Token } from '@candlelib/hydrocarbon';
import { CSSProperty } from "../properties/property.js";
import { CSSNodeType } from "./node_type.js";
import { PrecedenceFlags } from "./precedence_flags.js";

export interface CSSNode {
    type: CSSNodeType;
    nodes?: CSSNode[];
    selectors?: CSSNode[];
    pos?: Token;

    /**
     * The calculated precedence of the node.
     */
    precedence?: PrecedenceFlags;

    parent?: CSSNode;
};

export interface CSSRuleNode extends CSSNode {

    //@ts-ignore
    type: CSSNodeType.Rule;
    selectors?: CSSNode[];
    props?: Map<string, CSSProperty>;
}

export interface CSSRuleAtRuleNode extends CSSNode {
    selectors?: CSSNode[];
    props?: Map<string, CSSProperty>;
}


export interface CSSSelectorNode extends CSSNode {
    val?: string,
    id?: string,

    ns?: string;

    match_type?: string;

    match_val?: string;

    mod?: string;
}
