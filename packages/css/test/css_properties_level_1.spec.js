/*** 

    Tests for parsing of CSS level 1 properties https://www.w3.org/TR/REC-CSS1/?utm_source=www.uoota.com#box-properties 

***/

import {
    textSpread, checkText, checkArray, checkColor, checkLength, checkPercentage, checkNumber, checkURL, test, px,
    mm,
    cm,
    nch,
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
    deg
} from "./test_tools.js";

const color = checkColor;
const text = checkText;
const url = checkURL;

assert_group("CSS Level 1", () => {
    assert_group(sequence, "Font Properties: https://www.w3.org/TR/REC-CSS1/?utm_source=www.uoota.com#font-properties", () => {

        test.value(`font-family: Arial, Times New Roman, sans-serif`);
        //test.only();
        assert(test.check([checkText("Arial"), checkText(","), checkText("Times New Roman"), checkText(","), checkText("sans-serif")]));

        test.value(`font-family: monospace, monospace, sans-serif`);
        //test.only();
        textSpread(
            "font-style",
            "normal",
            "italic",
            "oblique"
        );

        textSpread(
            "font-variant",
            "normal",
            "small-caps"
        );

        textSpread(
            "font-weight",
            "normal",
            "bold",
            "bolder",
            "lighter",
            "100",
            "200",
            "300",
            "400",
            "500",
            "600",
            "700",
            "800",
            "900"
        );

        textSpread(
            "font-size",
            "xx-small",
            "x-small",
            "small",
            "medium",
            "large",
            "x-large",
            "xx-large",
            "larger",
            "smaller"
        );

        test.value("font-size:90px");
        assert(test.check(checkLength(90, "px"),));

        test.value("font-size:90em");
        assert(test.check(checkLength(90, "em")));

        test.value("font-size:90em");
        assert(test.check(checkLength(90, "em")));

        test.value("font:italic 30px Arial, sans-serif");
    });

    assert_group(sequence, "Color and Background Properties: https://www.w3.org/TR/REC-CSS1/?utm_source=www.uoota.com#color-and-background-properties", () => {

        test.value("color: red");
        assert(test.check(color(255)));

        test.value("color: #FF0000");
        assert(test.check(color(255)));

        test.value("color: #F00");
        assert(test.check(color(255)));

        test.value("color: rgb(255, 0, 0)");
        assert(test.check(color(255)));

        test.value("color: rgb(100%, 0%, 0%)");
        assert(test.check(color(255)));

        test.value("background-color: transparent");
        assert(test.check(color(0, 0, 0, 0)));

        test.value("background-color: #FF0000");
        assert(test.check(color(255)));

        test.value("background-image:none");
        assert(test.check(checkText("none")));

        test.value("background-image:url(test.me:8080)");
        assert(test.check(checkURL("test.me:8080")));

        textSpread(
            "background-repeat",
            "repeat",
            "repeat-x",
            "repeat-y",
            "no-repeat"
        );

        textSpread(
            "background-attachment",
            "scroll",
            "fixed"
        );

        test.value("background-position:0% 0%");
        assert(test.check([checkPercentage(0), checkPercentage(0)]));

        test.value("background-position:top right");
        assert(test.check([checkText("top"), checkText("right")]));

        test.value("background: red url(bg.ck:12) scroll");
        assert(test.check([color(255), url("bg.ck:12"), "scroll"]));
    });

    assert_group(sequence, "Text Properties: https://www.w3.org/TR/REC-CSS1/?utm_source=www.uoota.com#text-properties", () => {

        test.value("word-spacing:normal");
        assert(test.check(checkText("normal")));

        test.value("word-spacing:20px");
        assert(test.check(checkLength(20, "px")));

        test.value("letter-spacing:normal");
        assert(test.check(checkText("normal")));

        test.value("letter-spacing:20px");
        assert(test.check(checkLength(20, "px")));

        test.value("letter-spacing:201pt");
        assert(test.check(checkLength(201, "pt")));
        //test.only();
        textSpread(
            "text-decoration",
            "none",
            "underline",
            "overline",
            "line-through",
            "blink"
        );

        test.value("text-decoration: underline blink");
        assert(test.check(["underline", "blink"]));

        textSpread(
            "vertical-align",
            "baseline",
            "middle",
            "sub",
            "super",
            "text-top",
            "text-bottom",
        );

        test.value("vertical-align:120%");
        assert(test.check(checkPercentage(120)));

        textSpread(
            "text-transform",
            "capitalize",
            "uppercase",
            "lowercase",
            "none"
        );

        textSpread("text-align", "left", "right", "center", "justify");


        test.value("text-indent:120%");
        assert(test.check(checkPercentage(120)));


        test.value("text-indent:148rem");
        assert(test.check(checkLength(148, "rem")));

        textSpread(
            "line-height",
            "normal"
        );

        test.value("line-height:102%");
        assert(test.check(checkPercentage(102)));

        test.value("line-height:14px");
        assert(test.check(checkLength(14, "px")));

        test.value("line-height:1412");
        assert(test.check(checkNumber(1412)));
    });

    assert_group(sequence, "Box Properties: https://www.w3.org/TR/REC-CSS1/?utm_source=www.uoota.com#box-properties", () => {
        textSpread(
            "margin-top",
            "auto"
        );

        test.value("margin-top:102%");
        assert(test.check(checkPercentage(102)));

        test.value("margin-top:14mm");
        assert(test.check(checkLength(14, "mm")));

        textSpread(
            "margin-right",
            "auto"
        );

        test.value("margin-right:140%");
        assert(test.check(checkPercentage(140)));

        test.value("margin-right:14cm");
        assert(test.check(checkLength(14, "cm")));

        textSpread(
            "margin-bottom",
            "auto"
        );

        test.value("margin-bottom:140%");
        assert(test.check(checkPercentage(140)));

        test.value("margin-bottom:14vh");
        assert(test.check(checkLength(14, "vh")));

        textSpread(
            "margin-left",
            "auto"
        );

        test.value("margin-left:140%");
        assert(test.check(checkPercentage(140)));

        test.value("margin-left:14vh");
        assert(test.check(checkLength(14, "vh")));

        textSpread(
            "margin",
            "auto"
        );

        test.value("margin: 30%");
        assert(test.check(checkPercentage(30)));

        test.value("margin: 2px 100%");
        assert(test.check([checkLength(2, "px"), checkPercentage(100)]));

        test.value("margin: 2px 4px 8px 9px");
        assert(test.check([checkLength(2, "px"), checkLength(4, "px"), checkLength(8, "px"), checkLength(9, "px")]));

        test.value("padding-top:102%");
        assert(test.check(checkPercentage(102)));

        test.value("padding-top:14mm");
        assert(test.check(checkLength(14, "mm")));

        test.value("padding-right:140%");
        assert(test.check(checkPercentage(140)));

        test.value("padding-right:14cm");
        assert(test.check(checkLength(14, "cm")));

        test.value("padding-bottom:140%");
        assert(test.check(checkPercentage(140)));

        test.value("padding-bottom:14vh");
        assert(test.check(checkLength(14, "vh")));

        test.value("padding-left:140%");
        assert(test.check(checkPercentage(140)));

        test.value("padding-left:14vh");
        assert(test.check(checkLength(14, "vh")));

        test.value("padding: 30%");
        assert(test.check(checkPercentage(30)));

        test.value("padding: 2px 100%");
        assert(test.check([checkLength(2, "px"), checkPercentage(100)]));

        test.value("padding: 2px 4px 8px 9px");
        assert(test.check([px(2), px(4), px(8), px(9)]));

        textSpread(
            "border-top-width",
            "thin",
            "medium",
            "thick"
        );

        test.value("border-top-width:14vmax");
        assert(test.check(checkLength(14, "vmax")));

        textSpread(
            "border-right-width",
            "thin",
            "medium",
            "thick"
        );

        test.value("border-right-width:14px");
        assert(test.check(checkLength(14, "px")));

        textSpread(
            "border-bottom-width",
            "thin",
            "medium",
            "thick"
        );

        test.value("border-bottom-width:14rem");
        assert(test.check(checkLength(14, "rem")));

        textSpread(
            "border-left-width",
            "thin",
            "medium",
            "thick"
        );

        test.value("border-left-width:14deg");
        assert(test.check(checkLength(14, "deg")));

        textSpread(
            "border-width",
            "thin",
            "medium",
            "thick"
        );

        test.value("border-width: 2px 100px");
        assert(test.check([checkLength(2, "px"), checkLength(100, "px")]));

        test.value("border-width: 2px 4px 8px 9px");
        assert(test.check([checkLength(2, "px"), checkLength(4, "px"), checkLength(8, "px"), checkLength(9, "px")]));

        test.value("border-color: red green blue");
        assert(test.check([color(255), color(0, 128), color(0, 0, 255)]));

        test.value("border-color: teal");
        assert(test.check(color(0, 128, 128)));

        textSpread(
            "border-style",
            "none",
            "dotted",
            "dashed",
            "solid",
            "double",
            "groove",
            "ridge",
            "inset",
            "outset"
        );

        test.value("border-top: 2px double blue");
        assert(test.check([px(2), "double", color(0, 0, 255)]));

        test.value("border-top: 2px");
        assert(test.check(px(2)));

        test.value("border-top: double");
        assert(test.check("double"));

        test.value("border-top: #FF00FF");
        assert(test.check(color(255, 0, 255)));

        test.value("border-right: 2px double blue");
        assert(test.check([px(2), "double", color(0, 0, 255)]));

        test.value("border-right: 2px");
        assert(test.check(px(2)));

        test.value("border-right: double");
        assert(test.check("double"));

        test.value("border-right: #FF00FF");
        assert(test.check(color(255, 0, 255)));

        test.value("border-bottom: 2px double blue");
        assert(test.check([px(2), "double", color(0, 0, 255)]));

        test.value("border-bottom: 2px");
        assert(test.check(px(2)));

        test.value("border-bottom: double");
        assert(test.check("double"));

        test.value("border-bottom: #FF00FF");
        assert(test.check(color(255, 0, 255)));

        test.value("border-left: 2px double blue");
        assert(test.check([px(2), "double", color(0, 0, 255)]));

        test.value("border-left: 2px");
        assert(test.check(px(2)));

        test.value("border-left: double");
        assert(test.check("double"));

        test.value("border-left: #FF00FF");
        assert(test.check(color(255, 0, 255)));

        test.value("border: 2px double blue");
        assert(test.check([px(2), "double", color(0, 0, 255)]));

        test.value("border: 2px");
        assert(test.check(px(2)));

        test.value("border: double");
        assert(test.check("double"));

        test.value("border: #FF00FF");
        assert(test.check(color(255, 0, 255)));

        test.value("width:auto");
        assert(test.check("auto"));

        test.value("width:20%");
        assert(test.check(checkPercentage(20)));

        test.value("width:180vh");
        assert(test.check(vh(180)));

        test.value("height:auto");
        assert(test.check("auto"));

        test.value("height:180vh");
        assert(test.check(vh(180)));

        textSpread(
            "float",
            "left",
            "right",
            "none"
        );

        textSpread(
            "clear",
            "left",
            "right",
            "both",
            "none"
        );

        textSpread(
            "display",
            "block",
            "inline",
            "list-item",
            "none"
        );

        textSpread(
            "white-space",
            "normal",
            "pre",
            "nowrap"
        );

        textSpread(
            "list-style-type",
            "disc",
            "circle",
            "square",
            "decimal",
            "lower-roman",
            "upper-roman",
            "lower-alpha",
            "upper-alpha",
            "none"
        );

        test.value("list-style-image:none");
        assert(test.check("none"));

        test.value("list-style-image:url(rockwell.org:3030)");
        assert(test.check(url("rockwell.org:3030")));

        textSpread(
            "list-style-position",
            "inside",
            "outside"
        );

        textSpread(
            "list-style",
            "disc",
            "circle",
            "square",
            "decimal",
            "lower-roman",
            "upper-roman",
            "lower-alpha",
            "upper-alpha",
            "none"
        );

        test.value("list-style:disc inside none");
        assert(test.check(["disc", "inside", "none"]));

        test.value("list-style:disc inside url(https://crankle.org.net.com:443)");
        assert(test.check(["disc", "inside", url("https://crankle.org.net.com:443")]));
    });
});
