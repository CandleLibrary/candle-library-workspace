/*** 

    Tests for parsing of CSS level 2.1 properties https://www.w3.org/TR/CSS2/

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
    inch,
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


assert_group("box-model: https://www.w3.org/TR/CSS2/box.html", sequence, () => {

    test.value("margin-top:inherit");
    assert(test.check("inherit"));

    test.value("margin-right:inherit");
    assert(test.check("inherit"));

    test.value("margin-bottom:inherit");
    assert(test.check("inherit"));

    test.value("margin-left:inherit");
    assert(test.check("inherit"));

    test.value("margin:inherit");
    assert(test.check("inherit"));

    test.value("padding-top:inherit");
    assert(test.check("inherit"));

    test.value("padding-right:inherit");
    assert(test.check("inherit"));

    test.value("padding-bottom:inherit");
    assert(test.check("inherit"));

    test.value("padding-left:inherit");
    assert(test.check("inherit"));

    test.value("padding:inherit");
    assert(test.check("inherit"));

});

assert_group("Visual Formatting: https://www.w3.org/TR/CSS2/visuren.html", sequence, () => {


    assert("display", textSpread("display",
        "inline",
        "block",
        "list-item",
        "inline-block",
        "table",
        "table-row-group",
        "inline-table",
        "table-header-group",
        "table-footer-group",
        "table-row",
        "table-column-group",
        "table-column",
        "table-cell",
        "table-caption",
        "none",
        "inherit"
    ));

    assert("position", textSpread("position",
        "static",
        "relative",
        "absolute",
        "fixed",
        "inherit"
    ));

    assert("top", textSpread("top",
        "auto",
        "inherit"
    ));


    assert(test.value("top:20px").check(px(20)));

    assert(test.value("top:20%").check(checkPercentage(20)));

    assert(textSpread("right",
        "auto",
        "inherit"
    ));

    assert(test.value("right:20px").check(px(20)));

    test.value("right:20%");
    assert(test.check(checkPercentage(20)));

    assert("bottom", textSpread("bottom",
        "auto",
        "inherit"
    ));

    test.value("bottom:20px");
    assert(test.check(px(20)));

    test.value("bottom:20%");
    assert(test.check(checkPercentage(20)));

    assert("left", textSpread("left",
        "auto",
        "inherit"
    ));

    test.value("left:20px");
    assert(test.check(px(20)));

    test.value("left:20%");
    assert(test.check(checkPercentage(20)));

    assert("float", textSpread("float",
        "left",
        "right",
        "none",
        "inherit"
    ));

    assert("clear", textSpread("clear",
        "left",
        "right",
        "none",
        "both",
        "inherit"
    ));

    assert("z-index", textSpread("z-index",
        "auto",
        "inherit"));

    test.value("z-index:20");
    assert(test.check(checkNumber(20)));

    assert("direction", textSpread("direction",
        "ltr",
        "rtl",
        "inherit"));

    assert("unicode-bidi", textSpread("unicode-bidi",
        "normal",
        "embed",
        "bidi-override",
        "inherit"));

    test.value("width:auto");
    assert(test.check("auto"));

    test.value("width:inherit");
    assert(test.check("inherit"));

    test.value("width:20%");
    assert(test.check(checkPercentage(20)));

    test.value("width:180vh");
    assert(test.check(vh(180)));

    test.value("min-width:inherit");
    assert(test.check("inherit"));

    test.value("min-width:20%");
    assert(test.check(checkPercentage(20)));

    test.value("min-width:180vh");
    assert(test.check(vh(180)));

    test.value("max-width:none");
    assert(test.check("none"));

    test.value("max-width:inherit");
    assert(test.check("inherit"));

    test.value("max-width:20%");
    assert(test.check(checkPercentage(20)));

    test.value("max-width:180vh");
    assert(test.check(vh(180)));

    test.value("height:auto");
    assert(test.check("auto"));

    test.value("height:inherit");
    assert(test.check("inherit"));

    test.value("height:180vh");
    assert(test.check(vh(180)));

    test.value("height:20%");
    assert(test.check(checkPercentage(20)));

    test.value("min-height:inherit");
    assert(test.check("inherit"));

    test.value("min-height:180vh");
    assert(test.check(vh(180)));

    test.value("min-height:20%");
    assert(test.check(checkPercentage(20)));

    test.value("max-height:none");
    assert(test.check("none"));

    test.value("max-height:inherit");
    assert(test.check("inherit"));

    test.value("max-height:180vh");
    assert(test.check(vh(180)));

    test.value("max-height:20%");
    assert(test.check(checkPercentage(20)));

    test.value("line-height:inherit");
    assert(test.check("inherit"));

    test.value("vertical-align:inherit");
    assert(test.check("inherit"));

    test.value("vertical-align:2px");
    assert(test.check(px(2)));
});

assert_group("Visual Effect: https://www.w3.org/TR/CSS2/visufx.html", sequence, function () {

    assert("overflow", textSpread("overflow",
        "visible",
        "hidden",
        "scroll",
        "auto",
        "inherit"
    ));

    assert("clip", textSpread("clip",
        "auto",
        "inherit"
    ));

    test.value("clip:rect(20vh,31em,auto,58)");

    assert(test.value("clip:rect(20vh,31em,auto,58)").check("rect(20vh,31em,100%,58)"));

    assert("visibility", textSpread("visibility",
        "visible",
        "hidden",
        "collapse",
        "inherit"
    ));
});

assert_group("Generate: https://www.w3.org/TR/CSS2/generate.html", sequence, function () {

    assert("content", textSpread("content",
        "normal",
        "none",
        "open-quote",
        "close-quote",
        "no-open-quote",
        "no-close-quote",
        "inherit"
    ));

    test.value("content:close-quote close-quote");
    assert(test.check(["close-quote", "close-quote"]));

    test.value("content:close-quote close-quote");
    assert(test.check(["close-quote", "close-quote"]));

    test.value("content:counter(section) ' ' counters(sub-section, ' ') 'test'");
    assert(test.check("counter"));

    test.value("content:attr('open') ");
    assert(test.check("attr('open')"));


    assert(textSpread("quotes", "none", "inherit"));

    test.value(`quotes: "|" "|" `);
    assert(test.check([`"|"`, `"|"`]));

    textSpread("counter-reset",
        "none",
        "inherit"
    );

    test.value("counter-reset:chapter section 1");
    assert(test.check(["chapter", "section", checkNumber(1)]));

    assert(textSpread("counter-reset", "none", "inherit"));

    test.value("counter-increment:chapter section 22");
    assert(test.check(["chapter", "section", checkNumber(22)]));

    assert(textSpread(
        "list-style-type",
        "disc",
        "circle",
        "square",
        "decimal",
        "decimal-leading-zero",
        "lower-roman",
        "upper-roman",
        "lower-greek",
        "lower-latin",
        "upper-latin",
        "armenian",
        "georgian",
        "lower-alpha",
        "upper-alpha",
        "none",
        "inherit"
    ));


    assert(test.value("list-style-image:inherit").check("inherit"));
    assert(test.value("list-style-position:inherit").check("inherit"));
    assert(test.value("list-style:inherit").check("inherit"));
});

assert_group("Page: https://www.w3.org/TR/CSS2/page.html", sequence, function () {
    assert("page-break-before", textSpread(
        "page-break-before",
        "auto",
        "always",
        "avoid",
        "left",
        "right",
        "inherit"
    ));

    assert("page-break-after", textSpread(
        "page-break-after",
        "auto",
        "always",
        "avoid",
        "left",
        "right",
        "inherit"
    ));

    assert("page-break-inside", textSpread(
        "page-break-inside",
        "auto",
        "avoid",
        "inherit"
    ));

    test.value("orphans:inherit");
    assert(test.check("inherit"));

    test.value("orphans:88");
    assert(test.check(88));

    test.value("widows:inherit");
    assert(test.check("inherit"));

    test.value("widows:88");
    assert(test.check(88));
});

assert_group("Colors and Backgrounds: https://www.w3.org/TR/CSS2/colors.html - see also CSS Level 1 Properties test", sequence, function () {

    assert("color", textSpread("color", "inherit"));

    assert("background-color", textSpread("background-color", "inherit"));

    assert("background-image", textSpread("background-image", "inherit"));

    assert("background-repeat", textSpread("background-repeat", "inherit"));

    assert("background-attachment", textSpread("background-attachment", "inherit"));

    assert("background-position", textSpread("background-position", "inherit"));

    assert("background", textSpread("background", "inherit"));
});

assert_group("Fonts: https://www.w3.org/TR/CSS2/fonts.html", sequence, function () {
    assert("font-family - see also CSS Level 1 Properties test",
        textSpread("font-family", "inherit"));

    assert("font-style - see also CSS Level 1 Properties test",
        textSpread("font-style", "inherit"));

    assert("font-variant - see also CSS Level 1 Properties test",
        textSpread("font-variant", "inherit"));

    assert("font-weight - see also CSS Level 1 Properties test",
        textSpread("font-weight", "inherit"));

    assert("font-size", "see CSS Level 1 Properties test", textSpread("font-size", "inherit"));
    assert("font - see also CSS Level 1 Properties test",
        textSpread(
            "font",
            "caption",
            "icon",
            "menu",
            "message-box",
            "small-caption",
            "status-bar",
            "inherit"
        )
    );
});

assert_group("Text: https://www.w3.org/TR/CSS2/text.html", sequence, function () {
    assert("text-indent - see also CSS Level 1 Properties test",
        textSpread("text-indent", "inherit"));

    assert("text-align - see also CSS Level 1 Properties test",
        textSpread("text-align", "inherit"));

    assert("text-decoration - see also CSS Level 1 Properties test",
        textSpread("text-decoration", "inherit"));

    assert("letter-spacing - see also CSS Level 1 Properties test",
        textSpread("letter-spacing", "inherit"));

    assert("word-spacing - see also CSS Level 1 Properties test",
        textSpread("word-spacing", "inherit"));

    assert("text-transform - see also CSS Level 1 Properties test",
        textSpread("text-transform", "inherit"));

    assert("white-space - see also CSS Level 1 Properties test",
        textSpread("white-space", "pre-line", "inherit"));
});

assert_group("Tables: https://www.w3.org/TR/CSS2/tables.html", sequence, function () {
    assert(textSpread("caption-side", "top", "bottom", "inherit"));
    assert(textSpread("table-layout", "auto", "fixed", "inherit"));
    assert(textSpread("border-collapse", "collapse", "separate", "inherit"));

    assert(textSpread("border-spacing", "inherit"));

    test.value("border-spacing: 12px 2em");
    assert(test.check([px(12), em(2)]));
    assert(textSpread("empty-cells", "show", "hide", "inherit"));
});

assert_group("User Interface: https://www.w3.org/TR/CSS2/ui.html", sequence, function () {
    assert("cursor", textSpread("cursor",
        "auto",
        "crosshair",
        "default",
        "pointer",
        "move",
        "e-resize",
        "ne-resize",
        "nw-resize",
        "n-resize",
        "se-resize",
        "sw-resize",
        "s-resize",
        "w-resize",
        "text",
        "wait",
        "help",
        "progress",
        "inherit"
    ));

    test.value("cursor: url(my.com:80/giraffe.cur), auto");

    assert(test.check([url("my.com:80/giraffe.cur"), ",", "auto"]));

    assert("outline-width", textSpread(
        "outline-width",
        "inherit"
    ));

    test.value("outline-width: 2px");

    assert(test.check([checkLength(2, "px")]));

    assert("outline-style", textSpread(
        "outline-style",
        "none",
        "dotted",
        "dashed",
        "solid",
        "double",
        "groove",
        "ridge",
        "inset",
        "outset",
        "inherit"
    ));

    textSpread("outline-color", "invert", "inherit");
    test.value("outline-color: #00FF00");
    assert(test.check(color(0, 255)));

    assert("outline", textSpread(
        "outline",
        "inherit"
    ));

    test.value("outline: red solid 2px");
    assert(test.check([color(255), "solid", px(2)]));

});

assert_group("Aural: https://www.w3.org/TR/CSS2/aural.html", function () {

});

