import { buildRenderers } from "@candlelib/conflagrate";
import { JSNodeDefinitions, JSNodeType } from "@candlelib/js";
import { buildFormatRules, FormatRule as $ } from "@candlelib/conflagrate";
import { CSSNodeDefinitions } from "@candlelib/css";

import { HTMLNodeType } from "../../types/all.js";
import { NodeTypes } from "../source-code-parse/env.js";

export const format_rules = buildFormatRules([{
    type: JSNodeType.LexicalDeclaration,
    format_rule: $.INDENT | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT * 15
}, {
    type: JSNodeType.FromClause,
    format_rule: $.OPTIONAL_SPACE
}, {
    type: JSNodeType.AssignmentExpression,
    format_rule: $.OPTIONAL_SPACE
}, {
    type: JSNodeType.BindingExpression,
    format_rule: $.OPTIONAL_SPACE
}, {
    type: JSNodeType.IfStatement,
    format_rule: $.OPTIONAL_SPACE
}, {
    type: JSNodeType.Class,
    format_rule: $.INDENT | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT
}, {
    type: JSNodeType.Script,
    format_rule: $.INDENT | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT
}, {
    type: JSNodeType.BlockStatement,
    format_rule: $.INDENT | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT * 5
}, {
    type: JSNodeType.FunctionBody,
    format_rule: $.INDENT | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT * 5
}, {
    type: JSNodeType.ObjectLiteral,
    format_rule: $.INDENT | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT * 5
}, {
    type: JSNodeType.Arguments,
    format_rule: $.INDENT | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT * 5
}, {
    type: JSNodeType.FormalParameters,
    format_rule: $.INDENT | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT * 5
}, {
    type: JSNodeType.ExpressionList,
    format_rule: $.INDENT | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT * 14
}, {
    type: HTMLNodeType.HTML_DIV,
    format_rule: $.INDENT | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT * 14
}, {
    type: HTMLNodeType.HTML_P,
    format_rule: $.INDENT * 2 | $.OPTIONAL_SPACE | $.LIST_SPLIT * 2 | $.MIN_LIST_ELE_LIMIT * 14
}]);

const definitions = [ /**/ /**/ ...JSNodeDefinitions /**/,/**/...CSSNodeDefinitions, ...[
    {
        type: HTMLNodeType.HTML_DIV,
        template_pattern: "<div @_attributes...%>^1@...%^0</div>",
        format_rule: 0
    },
    {
        type: HTMLNodeType.HTML_TT,
        template_pattern: "<tt @_attributes...%>^1@...%^0</tt>"
    },
    {
        type: HTMLNodeType.HTML_I,
        template_pattern: "<i @_attributes...%>^1@...%^0</i>"
    },
    {
        type: HTMLNodeType.HTML_B,
        template_pattern: "<b @_attributes...%>^1@...%^0</b>"
    },
    {
        type: HTMLNodeType.HTML_BIG,
        template_pattern: "<big @_attributes...%>^1@...%^0</big>"
    },
    {
        type: HTMLNodeType.HTML_SMALL,
        template_pattern: "<small @_attributes...%>^1@...%^0</small>"
    },
    {
        type: HTMLNodeType.HTML_EM,
        template_pattern: "<em @_attributes...%>^1@...%^0</em>"
    },
    {
        type: HTMLNodeType.HTML_STRONG,
        template_pattern: "<strong @_attributes...%>^1@...%^0</strong>"
    },
    {
        type: HTMLNodeType.HTML_DFN,
        template_pattern: "<dfn @_attributes...%>^1@...%^0</dfn>"
    },
    {
        type: HTMLNodeType.HTML_CODE,
        template_pattern: "<code @_attributes...%>^1@...%^0</code>"
    },
    {
        type: HTMLNodeType.HTML_SAMP,
        template_pattern: "<samp @_attributes...%>^1@...%^0</samp>"
    },
    {
        type: HTMLNodeType.HTML_KBD,
        template_pattern: "<kbd @_attributes...%>^1@...%^0</kbd>"
    },
    {
        type: HTMLNodeType.HTML_VAR,
        template_pattern: "<var @_attributes...%>^1@...%^0</var>"
    },
    {
        type: HTMLNodeType.HTML_CITE,
        template_pattern: "<cite @_attributes...%>^1@...%^0</cite>"
    },
    {
        type: HTMLNodeType.HTML_ABBR,
        template_pattern: "<abbr @_attributes...%>^1@...%^0</abbr>"
    },
    {
        type: HTMLNodeType.HTML_ACRONYM,
        template_pattern: "<acronym @_attributes...%>^1@...%^0</acronym>"
    },
    {
        type: HTMLNodeType.HTML_SUP,
        template_pattern: "<sup @_attributes...%>^1@...%^0</sup>"
    },
    {
        type: HTMLNodeType.HTML_SPAN,
        template_pattern: "<span @_attributes...%>^1@...%^0</span>"
    },
    {
        type: HTMLNodeType.HTML_BDO,
        template_pattern: "<bdo @_attributes...%>^1@...%^0</bdo>"
    },
    {
        type: HTMLNodeType.HTML_BR,
        template_pattern: "<br @_attributes...%>^1@...%^0</br>"
    },
    {
        type: HTMLNodeType.HTML_BODY,
        template_pattern: "<body @_attributes...%>^1@...%^0</body>"
    },
    {
        type: HTMLNodeType.HTML_ADDRESS,
        template_pattern: "<address @_attributes...%>^1@...%^0</address>"
    },
    {
        type: HTMLNodeType.HTML_A,
        template_pattern: "<a @_attributes...%>^1@...%^0</a>"
    },
    {
        type: HTMLNodeType.HTML_MAP,
        template_pattern: "<map @_attributes...%>^1@...%^0</map>"
    },
    {
        type: HTMLNodeType.HTML_AREA,
        template_pattern: "<area @_attributes...%>^1@...%^0</area>"
    },
    {
        type: HTMLNodeType.HTML_LINK,
        template_pattern: "<link @_attributes...%>^1@...%^0</link>"
    },
    {
        type: HTMLNodeType.HTML_IMG,
        template_pattern: "<img @_attributes...%>^1@...%^0</img>"
    },
    {
        type: HTMLNodeType.HTML_OBJECT,
        template_pattern: "<object @_attributes...%>^1@...%^0</object>"
    },
    {
        type: HTMLNodeType.HTML_PARAM,
        template_pattern: "<param @_attributes...%>^1@...%^0</param>"
    },
    {
        type: HTMLNodeType.HTML_HR,
        template_pattern: "<hr @_attributes...%>^1@...%^0</hr>"
    },
    {
        type: HTMLNodeType.HTML_P,
        template_pattern: "<p @_attributes...%>^1@...%^0</p>"
    },
    {
        type: HTMLNodeType.HTML_H1,
        template_pattern: "<h1 @_attributes...%>^1@...%^0</h1>"
    },
    {
        type: HTMLNodeType.HTML_H2,
        template_pattern: "<h2 @_attributes...%>^1@...%^0</h2>"
    },
    {
        type: HTMLNodeType.HTML_H3,
        template_pattern: "<h3 @_attributes...%>^1@...%^0</h3>"
    },
    {
        type: HTMLNodeType.HTML_H4,
        template_pattern: "<h4 @_attributes...%>^1@...%^0</h4>"
    },
    {
        type: HTMLNodeType.HTML_H5,
        template_pattern: "<h5 @_attributes...%>^1@...%^0</h5>"
    },
    {
        type: HTMLNodeType.HTML_H6,
        template_pattern: "<h6 @_attributes...%>^1@...%^0</h6>"
    },
    {
        type: HTMLNodeType.HTML_PRE,
        template_pattern: "<pre @_attributes...%>^1@...%^0</pre>"
    },
    {
        type: HTMLNodeType.HTML_Q,
        template_pattern: "<q @_attributes...%>^1@...%^0</q>"
    },
    {
        type: HTMLNodeType.HTML_BLOCKQUOTE,
        template_pattern: "<blockquote @_attributes...%>^1@...%^0</blockquote>"
    },
    {
        type: HTMLNodeType.HTML_INS,
        template_pattern: "<ins @_attributes...%>^1@...%^0</ins>"
    },
    {
        type: HTMLNodeType.HTML_DEL,
        template_pattern: "<del @_attributes...%>^1@...%^0</del>"
    },
    {
        type: HTMLNodeType.HTML_DL,
        template_pattern: "<dl @_attributes...%>^1@...%^0</dl>"
    },
    {
        type: HTMLNodeType.HTML_DT,
        template_pattern: "<dt @_attributes...%>^1@...%^0</dt>"
    },
    {
        type: HTMLNodeType.HTML_DD,
        template_pattern: "<dd @_attributes...%>^1@...%^0</dd>"
    },
    {
        type: HTMLNodeType.HTML_OL,
        template_pattern: "<ol @_attributes...%>^1@...%^0</ol>"
    },
    {
        type: HTMLNodeType.HTML_UL,
        template_pattern: "<ul @_attributes...%>^1@...%^0</ul>"
    },
    {
        type: HTMLNodeType.HTML_LI,
        template_pattern: "<li @_attributes...%>^1@...%^0</li>"
    },
    {
        type: HTMLNodeType.HTML_FORM,
        template_pattern: "<form @_attributes...%>^1@...%^0</form>"
    },
    {
        type: HTMLNodeType.HTML_LABEL,
        template_pattern: "<label @_attributes...%>^1@...%^0</label>"
    },
    {
        type: HTMLNodeType.HTML_INPUT,
        template_pattern: "<input @_attributes...%>^1@...%^0</input>"
    },
    {
        type: HTMLNodeType.HTML_SELECT,
        template_pattern: "<select @_attributes...%>^1@...%^0</select>"
    },
    {
        type: HTMLNodeType.HTML_OPTGROUP,
        template_pattern: "<optgroup @_attributes...%>^1@...%^0</optgroup>"
    },
    {
        type: HTMLNodeType.HTML_OPTION,
        template_pattern: "<option @_attributes...%>^1@...%^0</option>"
    },
    {
        type: HTMLNodeType.HTML_TEXTAREA,
        template_pattern: "<textarea @_attributes...%>^1@...%^0</textarea>"
    },
    {
        type: HTMLNodeType.HTML_FIELDSET,
        template_pattern: "<fieldset @_attributes...%>^1@...%^0</fieldset>"
    },
    {
        type: HTMLNodeType.HTML_LEGEND,
        template_pattern: "<legend @_attributes...%>^1@...%^0</legend>"
    },
    {
        type: HTMLNodeType.HTML_BUTTON,
        template_pattern: "<button @_attributes...%>^1@...%^0</button>"
    },
    {
        type: HTMLNodeType.HTML_TABLE,
        template_pattern: "<table @_attributes...%>^1@...%^0</table>"
    },
    {
        type: HTMLNodeType.HTML_CAPTION,
        template_pattern: "<caption @_attributes...%>^1@...%^0</caption>"
    },
    {
        type: HTMLNodeType.HTML_THEAD,
        template_pattern: "<thead @_attributes...%>^1@...%^0</thead>"
    },
    {
        type: HTMLNodeType.HTML_TFOOT,
        template_pattern: "<tfoot @_attributes...%>^1@...%^0</tfoot>"
    },
    {
        type: HTMLNodeType.HTML_TBODY,
        template_pattern: "<tbody @_attributes...%>^1@...%^0</tbody>"
    },
    {
        type: HTMLNodeType.HTML_COLGROUP,
        template_pattern: "<colgroup @_attributes...%>^1@...%^0</colgroup>"
    },
    {
        type: HTMLNodeType.HTML_COL,
        template_pattern: "<col @_attributes...%>^1@...%^0</col>"
    },
    {
        type: HTMLNodeType.HTML_TR,
        template_pattern: "<tr @_attributes...%>^1@...%^0</tr>"
    },
    {
        type: HTMLNodeType.HTML_TH,
        template_pattern: "<th @_attributes...%>^1@...%^0</th>"
    },
    {
        type: HTMLNodeType.HTML_TD,
        template_pattern: "<td @_attributes...%>^1@...%^0</td>"
    },
    {
        type: HTMLNodeType.HTML_HEAD,
        template_pattern: "<head @_attributes...%>^1@...%^0</head>"
    },
    {
        type: HTMLNodeType.HTML_TITLE,
        template_pattern: "<title%@_attributes...%>^1@...%^0</title>"
    },
    {
        type: HTMLNodeType.HTML_BASE,
        template_pattern: "<base @_attributes...%>^1@...%^0</base>"
    },
    {
        type: HTMLNodeType.HTML_META,
        template_pattern: "<meta @_attributes...%>^1@...%^0</meta>"
    },
    {
        type: HTMLNodeType.HTML_STYLE,
        template_pattern: "<style @_attributes...%>^1@...%^0</style>"
    },
    {
        type: HTMLNodeType.HTML_SCRIPT,
        template_pattern: "<script @_attributes...%></script>"
    },
    {
        type: HTMLNodeType.HTML_NOSCRIPT,
        template_pattern: "<noscript @_attributes...%>^1@...%^0</noscript>"
    },
    {
        type: HTMLNodeType.HTML_HTML,
        template_pattern: "<html @_attributes...%>^1@...%^0</html>"
    },
    {
        type: HTMLNodeType.HTML_SVG,
        template_pattern: "<svg @_attributes...%>^1@...%^0</svg>"
    },
    {
        type: HTMLNodeType.HTML_BINDING_ELEMENT,
        template_pattern: "<svg @_attributes...%>^1@...%^0</svg>"
    },
    {
        type: HTMLNodeType.HTMLAttribute,
        template_pattern: { default: "@name=\"@value\"", not_value: "@name" },
    },
    {
        type: HTMLNodeType.HTML_Element,
        template_pattern: "<@tagname @_attributes...%>^1@...%^0</@tagname>",
    },
    {
        type: HTMLNodeType.WickBinding,
        template_pattern: "(( @_primary_ast ))",
    },
    {
        type: HTMLNodeType.HTMLText,
        template_pattern: "@data",
    },
]];

export const renderers = buildRenderers(definitions, NodeTypes);

