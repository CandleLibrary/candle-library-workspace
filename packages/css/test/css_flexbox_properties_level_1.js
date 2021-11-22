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
    mm,
    cm,
    _in,
    pc,
    pt,
    ch,
    em,
    ex,
    rem,
    vh,
    vw,
    vmin,
    vmax,
    deg,
    message,
    inherit
} from "./test_tools.js"

const color = checkColor;
const text = checkText;
const url = checkURL;

describe("CSS Level 1 Flexbox Properties https://www.w3.org/TR/css-flexbox-1/", () => {

    textSpread("display", "flex", "inline-flex", ...inherit);

    textSpread("flex-direction", "row", "row-reverse", 'column', "column-reverse", ...inherit);

    textSpread("flex-wrap", "nowrap", "wrap", "wrap-reverse", ...inherit);

    test.value = "flex-flow: row"
    test.check = "row"

    test.value = "flex-flow: wrap row"
    test.check = ["wrap", "row"]

    test.value = "order:3"
    test.check = 3

    textSpread("flex", "none", ...inherit);
    test.value = "flex: -5 6 auto",
    
    test.check = [-5, 6, "auto"]

	textSpread("flex-grow", ...inherit);
    test.value = "flex-grow:8"
    test.check = 8

	textSpread("flex-shrink", ...inherit);
    test.value = "flex-shrink:-1"
    test.check = -1;

    textSpread("flex-basis", "content", "auto", ...inherit);
    test.value = "flex-basis:-1px"
    test.check = px(-1);

    test.value = "flex-basis:55%"
    test.check = checkPercentage(55);
    
    textSpread("justify-content", "flex-start" , "flex-end" , "center" , "space-between" , "space-around", ...inherit)

    textSpread("align-items", "flex-start" , "flex-end" , "center" , "baseline" , "stretch", ...inherit)
    textSpread("align-self", "flex-start" , "flex-end" , "center" , "baseline" , "stretch", ...inherit)
    textSpread("align-content", "flex-start" , "flex-end" , "center" , "space-around", "space-between" , "stretch", ...inherit)
})
