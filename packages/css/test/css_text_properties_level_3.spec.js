/*** 

    Tests for parsing of CSS level 3 text properties https://www.w3.org/TR/2018/WD-css-text-3-20181212/

***/

import {
    textSpread,
    checkPercentage,
    test,
    px,
    inherit
} from "./test_tools.js";

assert_group("CSS Level 3 Text Properties https://www.w3.org/TR/2018/WD-css-text-3-20181212/", () => {

    //message("text-transform - see also CSS Level 1 Properties tests & CSS Level 2 Properties tests");
    assert(textSpread("text-transform", "full-width", "full-size-kana", ...inherit));

    assert(test.value("text-transform: uppercase full-width full-size-kana").check(["uppercase", "full-width", "full-size-kana"]));

    //message("white-space - see also CSS Level 1 Properties tests & CSS Level 2 Properties tests");
    assert(textSpread("white-space", "break-spaces", ...inherit));

    assert(test.value("tab-size: 23px").check(px(23)));

    assert(test.value("tab-size: 23").check(23));

    assert(textSpread("word-break", "normal", "keep-all", "break-all", ...inherit));

    assert(textSpread("line-break", "auto", "loose", "normal", "strict", "anywhere", ...inherit));

    assert(textSpread("hyphens", "none", "manual", "auto", ...inherit));

    assert(textSpread("overflow-wrap", "normal", "break-word", "anywhere", ...inherit));

    assert(textSpread("word-wrap", "normal", "break-word", "anywhere", ...inherit));

    assert(textSpread("text-align", "justify", "justify-all", "start", "end", ...inherit));

    assert(textSpread("text-align-all", "end", "left", "right", "center", "justify", "match-parent", ...inherit));

    assert(textSpread("text-align-all", "start", "end", "left", "right", "center", "justify", "match-parent", ...inherit));

    assert(textSpread("text-justify", "auto", "none", "inter-word", "inter-character", ...inherit));

    //message("word-spacing - see also CSS Level 1 Properties tests & CSS Level 2 Properties tests");
    assert(textSpread("word-spacing", ...inherit));

    //message("letter-spacing - see also CSS Level 1 Properties tests & CSS Level 2 Properties tests");
    assert(textSpread("letter-spacing", ...inherit));

    //message("text-indent - see also CSS Level 1 Properties tests & CSS Level 2 Properties tests");
    assert(textSpread("text-indent", ...inherit));

    assert(test.value("text-indent: 23% hanging").check([checkPercentage(23), "hanging"]));

    assert(test.value("text-indent: 23% hanging each-line").check([checkPercentage(23), "hanging", "each-line"]));

    assert(textSpread("hanging-punctuation", "none", "first", "force-end", "allow-end", "last", ...inherit));

    assert(test.value("hanging-punctuation:first allow-end last").check(["first", "allow-end", "last"]));

});
