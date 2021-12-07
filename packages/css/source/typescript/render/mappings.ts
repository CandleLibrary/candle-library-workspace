import { experimentalConstructRenderers, NodeMappings } from "@candlelib/conflagrate";
import { CSSNode } from "../types/node";
import { CSSNodeType } from "../types/node_type.js";

export const css_mappings: NodeMappings<CSSNode, "type"> = <NodeMappings<CSSNode, "type">>{
    typename: "type",
    type_lookup: () => 0,
    mappings: [
        {
            type: CSSNodeType.Stylesheet,
            template: "i:s o:n @nodes...[o:n o:n] i:e",
        },
        {
            type: CSSNodeType.Rule,
            template: "@selectors...[ \\, o:n  ] \\{ i:s o:n @props...[\\; o:n] i:e o:n \\}",
            custom_render: (state, render_fn) => {
                const new_node = {
                    type: state.node.type,
                    selectors: state.node.selectors,
                    props: [...state.node.props].map(([name, val]) => val.toString())
                };

                return render_fn(state, new_node, true);
            }
        },
        {
            type: CSSNodeType.Import,
            template: "\\@import m:s @nodes...[m:s] \; ",
        },
        {
            type: CSSNodeType.Keyframes,
            template: "\\@keyframes @name \\{ i:s @nodes[1] i:e \\}",
        },
        {
            type: CSSNodeType.KeyframeBlock,
            template: "@nodes[0]  \\{ i:s @nodes[1]; i:e \\}",
        },
        {
            type: CSSNodeType.KeyframeSelectors,
            template: "@nodes...[\\, ]",
        },
        {
            type: CSSNodeType.KeyframeSelector,
            template: "@val",
        },
        {
            type: CSSNodeType.SupportConditions,
            template: "",
        },
        {
            type: CSSNodeType.Supports,
            template: "",
        },
        {
            type: CSSNodeType.Not,
            template: "\\not m:s @nodes[0]",
        },
        {
            type: CSSNodeType.And,
            template: "\\and m:s @nodes[0]",
        },
        {
            type: CSSNodeType.Or,
            template: "\\or m:s @nodes[0]",
        },
        {
            type: CSSNodeType.Parenthesis,
            template: "\\( @nodes[0] \\)",
        },
        {
            type: CSSNodeType.Function,
            template: "",
        },
        {
            type: CSSNodeType.MediaQueries,
            template: "@nodes...[ \\, ]",
        },
        {
            type: CSSNodeType.Media,
            template: "\\@media m:s @nodes[0] \\{ i:s o:n @nodes...[1, m:n] i:e o:n \\}",
        },
        {
            type: CSSNodeType.Query,
            template: "@nodes...[ m:s ]",
        },
        {
            type: CSSNodeType.MediaFeature,
            template: "\\( @nodes[0] \\)",
        },
        {
            type: CSSNodeType.MediaFunction,
            template: "",
        },
        {
            type: CSSNodeType.MediaValue,
            template: "@key \\: @val",
        },
        {
            type: CSSNodeType.MediaType,
            template: "@val",
        },
        {
            type: CSSNodeType.MediaEquality,
            template: "@left o:s @sym o:s @right",
        },
        {
            type: CSSNodeType.MediaRangeAscending,
            template: "",
        },
        {
            type: CSSNodeType.MediaRangeDescending,
            template: "@max @s",
        },
        {
            type: CSSNodeType.ComplexSelector,
            template: "@nodes...[m:s]",
        },
        {
            type: CSSNodeType.CompoundSelector,
            template: "@nodes..."
        },
        {
            type: CSSNodeType.Combinator,
            template: "@val",
        },
        {
            type: CSSNodeType.PseudoSelector,
            template: "@nodes...[m:s]",
        },
        {
            type: CSSNodeType.MetaSelector,
            template: "@nodes[0]? \\* ",
        },
        {
            type: CSSNodeType.NamespacePrefix,
            template: "\\ @vals \\|",
        },
        {
            type: CSSNodeType.QualifiedName,
            template: "{ ns: @ns | } @val",
        },
        {
            type: CSSNodeType.IdSelector,
            template: "\\# @val",
        },
        {
            type: CSSNodeType.ClassSelector,
            template: "\\. @val",
        },
        {
            type: CSSNodeType.AttributeSelector,
            template: "\\[ @nodes[0] @match_type? @match_val? @mod? \\]",
            custom_render: (state, render_fn) => {
                const new_node = Object.assign({}, state.node);

                if (new_node?.match_val?.includes(" "))
                    new_node.match_val = `"${new_node.match_val.replace(/"/g, "\\\"")
                        }"`;

                return render_fn(state, new_node, true);
            }
        },
        {
            type: CSSNodeType.PseudoClassSelector,
            template: "\\: @id {val : \\( @val \\) }",
        },
        {
            type: CSSNodeType.PseudoElementSelector,
            template: "\\:: @id {val : \\( @val \\) }",
        },
        {
            type: CSSNodeType.TypeSelector,
            template: "@nodes[0]",
        },
    ]
};

const lu_table = new Map(css_mappings.mappings.map((i, j) => [i.type, j]));

css_mappings.type_lookup = (node, name) => lu_table.get(node.type) || -1;

export const css_renderers = experimentalConstructRenderers(<NodeMappings<CSSNode, "type">>css_mappings);