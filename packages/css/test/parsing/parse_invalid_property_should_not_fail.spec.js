/**[API]:testing
 *  
 * Parsing an invalid property should not fail.
 */


import { rule, CSSNodeTypeLU } from "@candlelib/css";

const parsed_rule = rule(`
    .invalid-prop-name {
        position:relative;
        position:block;
        invalid:name 22;
        --new-property: id-di 22px;
    }
`);
assert_group(".invalid-prop-name {position:relative; position:block;invalid:name 22;--new-property: id-di 22px;}", () => {
    assert(parsed_rule.selectors[0].type == CSSNodeTypeLU.ClassSelector);
    assert(parsed_rule.props.size == 3);
});