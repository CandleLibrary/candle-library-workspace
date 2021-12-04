import { CSSProperty, CSSRuleNode } from "@candlelib/css";


export interface TrackedCSSProp {
    prop: CSSProperty;
    sel: string;
    unique?: boolean;
}
