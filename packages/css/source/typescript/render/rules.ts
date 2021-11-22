import { CSSNodeType } from "../types/node_type.js";
import { CSSNode } from "../types/node";
import { buildRenderers, buildFormatRules, FormatRule as $ } from "@candlelib/conflagrate";
import { CSSNodeTypeLU } from "../types/node_type_lu.js";

export const format_rules = buildFormatRules([{
    type: CSSNodeType.Stylesheet,
    format_rule: $.INDENT | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT * 15
}]);
export const CSSNodeDefinitions = [
    {
        type: CSSNodeType.Stylesheet,
        template_pattern: "^1@...\n^0",
    },
    {
        type: CSSNodeType.Rule,
        template_pattern: "@_selectors...,{}",
    },
    {
        type: CSSNodeType.Import,
        template_pattern: "\@import @1 @2? @...",
    },
    {
        type: CSSNodeType.Keyframes,
        template_pattern: "\@keyframes @name {^1%@2%^0}",
    },
    {
        type: CSSNodeType.KeyframeBlock,
        template_pattern: "@1 ^1{^1@2;^0}^0",
    },
    {
        type: CSSNodeType.KeyframeSelectors,
        template_pattern: "@...,",
    },
    {
        type: CSSNodeType.KeyframeSelector,
        template_pattern: "@val",
    },
    {
        type: CSSNodeType.SupportConditions,
        template_pattern: "",
    },
    {
        type: CSSNodeType.Supports,
        template_pattern: "",
    },
    {
        type: CSSNodeType.Not,
        template_pattern: "not @1",
    },
    {
        type: CSSNodeType.And,
        template_pattern: "and @1",
    },
    {
        type: CSSNodeType.Or,
        template_pattern: "or @1",
    },
    {
        type: CSSNodeType.Parenthesis,
        template_pattern: "(@1)",
    },
    {
        type: CSSNodeType.Function,
        template_pattern: "",
    },
    {
        type: CSSNodeType.MediaQueries,
        template_pattern: "@...,",
    },
    {
        type: CSSNodeType.Media,
        template_pattern: "@media @1%{^1@...\n^0}",
    },
    {
        type: CSSNodeType.Query,
        template_pattern: "@... ",
    },
    {
        type: CSSNodeType.MediaFeature,
        template_pattern: "(@1)",
    },
    {
        type: CSSNodeType.MediaFunction,
        template_pattern: "",
    },
    {
        type: CSSNodeType.MediaValue,
        template_pattern: "@key:@val",
    },
    {
        type: CSSNodeType.MediaType,
        template_pattern: "@val",
    },
    {
        type: CSSNodeType.MediaEquality,
        template_pattern: "@left%@sym%@right",
    },
    {
        type: CSSNodeType.MediaRangeAscending,
        template_pattern: "",
    },
    {
        type: CSSNodeType.MediaRangeDescending,
        template_pattern: "@max @s",
    },
    {
        type: CSSNodeType.ComplexSelector,
        template_pattern: "@... ",
    },
    {
        type: CSSNodeType.CompoundSelector, template_pattern: {
            default: "@...%",
            combinator: "@@...%"
        }
    },
    {
        type: CSSNodeType.Combinator,
        template_pattern: "@val",
    },
    {
        type: CSSNodeType.PseudoSelector,
        template_pattern: "@1@...%",
    },
    {
        type: CSSNodeType.MetaSelector,
        template_pattern: "@1?\*",
    },
    {
        type: CSSNodeType.NamespacePrefix,
        template_pattern: "@vals|",
    },
    {
        type: CSSNodeType.QualifiedName,
        template_pattern: { ns: "@ns|@val", default: "@val" },
    },
    {
        type: CSSNodeType.IdSelector,
        template_pattern: "#@val",
    },
    {
        type: CSSNodeType.ClassSelector,
        template_pattern: ".@val",
    },
    {
        type: CSSNodeType.AttributeSelector,
        template_pattern: {
            default: "[%@1%]",
            mod: "[@1 @match_type @match_val @mod]",
            match_type: "[@1 @match_type @match_val]"
        }
    },
    {
        type: CSSNodeType.PseudoClassSelector,
        template_pattern: {
            val: ":@id(%@val%)",
            default: ":@id"
        },
    },
    {
        type: CSSNodeType.PseudoElementSelector,
        template_pattern: {
            val: "::@id(@val)",
            default: "::@id"
        }
    },
    {
        type: CSSNodeType.TypeSelector,
        template_pattern: "@1",
    },
];

export const renderers = buildRenderers<CSSNode>(CSSNodeDefinitions, CSSNodeTypeLU);
