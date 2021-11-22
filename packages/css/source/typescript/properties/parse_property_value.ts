import wind from "@candlelib/wind";
import {
    property_definitions
} from "./property_and_type_definitions.js";
import { getPropertyParser } from "./construct_property_parser.js";
import { CSSProperty } from "./property.js";
import CSS_String from "../types/string.js";
/* 
    Parses a string value of a css property. Returns result of parse or null.

    Arg - Array - An array with values:
        0 :  string name of css rule that should be used to parse the value string.
        1 :  string value of the css rule.
        2 :  BOOL value for the presence of the "important" value in the original string. 

    Returns object containing:
        rule_name : the string name of the rule used to parse the value.
        body_string : the original string value
        prop : An array of CSS type instances that are the parsed values.
        important : boolean value indicating the presence of "important" value.
*/

export default function parsePropertyDefinitionFromHydrocarbon(env, sym: { 0: string, 2: string, 3: boolean; length: number; }, pos): CSSProperty {

    if (sym.length == 0)
        return null;

    let prop = null;

    const
        rule_name = sym[0],
        body_string = sym[2].trim(),
        important = sym[3] ? true : false,
        IS_VIRTUAL = { is: false };

    const parser = getPropertyParser(rule_name.replace(/\-/g, "_"), IS_VIRTUAL, property_definitions);

    if (parser && !IS_VIRTUAL.is) {
        //https://drafts.csswg.org/css-cascade/#valdef-all-unset
        //https://drafts.csswg.org/css-cascade/#valdef-all-inherit
        //https://drafts.csswg.org/css-cascade/#valdef-all-initial
        //https://drafts.csswg.org/css-cascade/#valdef-all-revert
        if (body_string == "unset" || body_string == "inherit" || body_string == "initial" || body_string == "revert")
            return new CSSProperty(rule_name, body_string, [new CSS_String(body_string)], important, pos);

        const lex = wind(body_string);
        lex.USE_EXTENDED_ID = true;
        lex.tl = 0;
        lex.next();
        prop = parser.parse(lex);
        return new CSSProperty(rule_name, body_string, prop, important, pos);
    } else {

        //Need to know what properties have not been defined
        console.warn(`Unable to get parser for CSS property ${rule_name}`);
        const prop = new CSSProperty(rule_name, body_string, null, important, pos);
        prop.VALID = false;
        return prop;

    }
}

export function parseProperty(name: string, value: string, important: boolean): CSSProperty {
    return parsePropertyDefinitionFromHydrocarbon(undefined, [name, , value, important], undefined);
}
