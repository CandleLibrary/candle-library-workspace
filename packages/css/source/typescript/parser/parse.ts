import { CSSProperty } from "../properties/property.js";
import { renderWithFormatting } from "../render/render.js";
import { CSSNode } from "../types/node";
import env from "./env.js";
//import loader from "./parser.js";
import framework from "./parser_new.js";

//@ts-ignore
const { parse: css_parser, entry_points } = await framework;
export const parse = function (string_data: string): CSSNode {

    const { result, err } = css_parser(string_data, env, entry_points.css);

    if (err) throw err;

    const ast = result[0];

    ast.toString = () => renderWithFormatting(ast);

    return ast;
    //*/
};

export const properties = function (props: string): Map<string, CSSProperty> {

    const { result, err } = css_parser(props, env, entry_points.properties);

    if (err) throw err;

    return result[0];
};

export const property = function (prop: string): CSSProperty {

    const { result, err } = css_parser(prop, env, entry_points.property);

    if (err) throw err;

    return result[0];
};

export const selector = function (selector: string): CSSNode {

    const { result, err } = css_parser(selector, env, entry_points.selector);

    if (err) throw err;

    return result[0];
};

export const rule = function (rule: string = "*{display:block}"): CSSNode {

    const { result, err } = css_parser(rule, env, entry_points.rule);

    if (err) throw err;

    return result[0];
};
