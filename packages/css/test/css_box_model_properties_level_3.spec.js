/*** 

    Tests for parsing of CSS level 3 box model properties https://drafts.csswg.org/css-box-3/

***/

import {
    textSpread,
    inherit
} from "./test_tools.js";

assert(textSpread("margin-top", ...inherit));
assert(textSpread("margin-right", ...inherit));
assert(textSpread("margin-bottom", ...inherit));
assert(textSpread("margin-left", ...inherit));
assert(textSpread("margin-trim", "none", "in-flow", "all", ...inherit));
assert(textSpread("padding-top", ...inherit));
assert(textSpread("padding-right", ...inherit));
assert(textSpread("padding-bottom", ...inherit));
assert(textSpread("padding-left", ...inherit));


