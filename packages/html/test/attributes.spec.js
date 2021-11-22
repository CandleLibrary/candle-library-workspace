import html from "@candlelib/html";

html.server();


//Handles attributes in the form of name=\"value value\" and name=value

const dom = await html(`<div str="value" bare=((test)) ></div>`);

assert(dom.getAttribute("str") == "value");

assert(dom.getAttribute("bare") == "((test))");


//Handles wick style attributes in the form of name=\"(( value ))\" and name=((vala)(valb))

const dom2 = html(`<div str="(( value ))" simple=((myvalue.value)) bare=((vala)(valb)) grama=phone></div>`);

assert(dom2.getAttribute("simple") == "((myvalue.value))");

assert(dom2.getAttribute("str") == "(( value ))");

assert(dom2.getAttribute("bare") == "((vala)(valb))");

assert(dom2.getAttribute("grama") == "phone");

