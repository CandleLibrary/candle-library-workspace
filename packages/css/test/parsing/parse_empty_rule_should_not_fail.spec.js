/**[API]:testing
 *  
 * Parsing an empty rule should not fail. 
 */


import { rule, CSSNodeTypeLU } from "@candlelib/css";

const parsed_rule = rule(`
    #empty-prop-name {}
`);

assert(parsed_rule.selectors[0].type == CSSNodeTypeLU.IdSelector);
assert(parsed_rule.props.size == 0);