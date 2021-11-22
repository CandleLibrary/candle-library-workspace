/*** 

    Tests for parsing of CSS level 1 flexbox properties https://www.w3.org/TR/css-flexbox-1/

***/

import {
    textSpread,
    checkText,
    checkArray,
    checkColor,
    checkLength,
    checkPercentage,
    checkNumber,
    checkURL,
    test,
    px,
    inherit
} from "./test_tools.js";

describe("CSS Level 3 Writing Modes Properties https://drafts.csswg.org/css-writing-modes-3/", () => {
    textSpread("position", "static", "relative", "absolute", "sticky", ...inherit);

    textSpread("top",
        "auto",
        ...inherit
    );

    test.value = "top:20px";
    test.check = px(20);

    test.value = "top:20%";
    test.check = checkPercentage(20);

    textSpread("right",
        "auto",
        ...inherit
    );

    test.value = "right:20px";
    test.check = px(20);

    test.value = "right:20%";
    test.check = checkPercentage(20);

    textSpread("bottom",
        "auto",
        ...inherit
    );

    test.value = "bottom:20px";
    test.check = px(20);

    test.value = "bottom:20%";
    test.check = checkPercentage(20);

    textSpread("left",
        "auto",
        ...inherit
    );

    test.value = "left:20px";
    test.check = px(20);

    test.value = "left:20%";
    test.check = checkPercentage(20);

    textSpread("offset-before",
        "auto",
        ...inherit
    );

    test.value = "offset-before:20px";
    test.check = px(20);

    test.value = "offset-before:20%";
    test.check = checkPercentage(20);

    textSpread("offset-end",
        "auto",
        ...inherit
    );

    test.value = "offset-end:20px";
    test.check = px(20);

    test.value = "offset-end:20%";
    test.check = checkPercentage(20);

    textSpread("offset-after",
        "auto",
        ...inherit
    );

    test.value = "offset-after:20px";
    test.check = px(20);

    test.value = "offset-after:20%";
    test.check = checkPercentage(20);

    textSpread("offset-start",
        "auto",
        ...inherit
    );

    test.value = "offset-start:20px";
    test.check = px(20);

    test.value = "offset-start:20%";
    test.check = checkPercentage(20);
});
