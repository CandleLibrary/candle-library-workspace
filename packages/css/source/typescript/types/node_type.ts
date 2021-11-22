import { PrecedenceFlags } from "./precedence_flags";

export enum CSSNodeFlags {
    SELECTOR = 256
}
export enum CSSNodeType {
    Stylesheet = (257 << 23),
    Rule = (258 << 23),
    Import = (259 << 23),
    Keyframes = (260 << 23),
    KeyframeBlock = (261 << 23),
    KeyframeSelector = (262 << 23),
    KeyframeSelectors = (294 << 23),
    SupportConditions = (263 << 23),
    Supports = (264 << 23),
    Not = (265 << 23),
    And = (266 << 23),
    Or = (267 << 23),
    Parenthesis = (268 << 23),
    Function = (269 << 23),
    MediaQueries = (270 << 23),
    Media = (271 << 23),
    Query = (272 << 23),
    MediaFeature = (274 << 23),
    MediaFunction = (275 << 23),
    MediaValue = (276 << 23),
    MediaType = (293 << 23),
    MediaEquality = (277 << 23),
    MediaRangeAscending = (278 << 23),
    MediaRangeDescending = (279 << 23),
    ComboSelector = (280 << 23) | CSSNodeFlags.SELECTOR,
    ComplexSelector = (281 << 23) | CSSNodeFlags.SELECTOR,
    PseudoSelector = (282 << 23) | CSSNodeFlags.SELECTOR,
    CompoundSelector = (283 << 23) | CSSNodeFlags.SELECTOR,
    TypeSelector = (284 << 23) | CSSNodeFlags.SELECTOR,
    MetaSelector = (285 << 23) | CSSNodeFlags.SELECTOR,
    NamespacePrefix = (286 << 23),
    QualifiedName = (287 << 23),
    IdSelector = (288 << 23) | CSSNodeFlags.SELECTOR,
    ClassSelector = (289 << 23) | CSSNodeFlags.SELECTOR,
    AttributeSelector = (290 << 23) | CSSNodeFlags.SELECTOR,
    PseudoClassSelector = (291 << 23) | CSSNodeFlags.SELECTOR,
    PseudoElementSelector = (292 << 23) | CSSNodeFlags.SELECTOR,
    Combinator = (295 << 23),

    /**
     * Precedence offset bit for an A specificity (style attribute) prop
     */
    A_SPECIFIER = 1 << PrecedenceFlags.A_BIT_SHIFT,

    /**
     * Precedence offset bit for an B specificity (id attribute) selector
     */
    B_SPECIFIER = 1 << PrecedenceFlags.B_BIT_SHIFT,

    /**
     * Precedence offset bit for an C specificity (other attributes and class and pseudo-class) selector
     */
    C_SPECIFIER = 1 << PrecedenceFlags.C_BIT_SHIFT,

    /**
    * Precedence offset bit for an D specificity (type/tag and pseudo-element) selector
    */
    D_SPECIFIER = 1 << PrecedenceFlags.D_BIT_SHIFT
}

