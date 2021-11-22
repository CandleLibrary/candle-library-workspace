import spark from "@candlelib/spark";
import {
    rule,
    parse,
    selector,
} from "../build/parser/parse.js";
import { renderCompressed } from "../build/render/render.js";
import { isSelectorEqual, doesRuleHaveMatchingSelector } from "../build/selector/utilities.js";

await spark.sleep(100);

const test = selector("svg|* a:nth-child(2n+1)");

assert(renderCompressed(rule(".div{color: rgb(22, 22, 22)}")) == ".div{color:#161616}");

assert(renderCompressed(rule(".div {margin:2px 2px 2px;}")) == ".div{margin:2px 2px 2px}");

assert(renderCompressed(rule(".div{border: 2px solid green}")) == ".div{border:2px solid #008000}");

assert(renderCompressed(selector(".div")) == ".div");

assert(renderCompressed(selector("#div")) == "#div");

assert(renderCompressed(selector("#div[src]")) == "#div[src]");

assert(renderCompressed(selector("#div[src].a")) == "#div[src].a");

assert(renderCompressed(selector(`#div[src ^= "true"].a`)) == `#div[src^=true].a`);

assert(renderCompressed(selector(`#div[src ^= "true enough" i].a`)) == `#div[src^="true enough"i].a`);

assert(renderCompressed(selector("#div a")) == "#div a");

assert(renderCompressed(selector("svg|* a")) == "svg|* a");

assert(renderCompressed(selector("svg|* a || a")) == "svg|* a || a");

assert(renderCompressed(selector("svg|* a + a")) == "svg|* a + a");

assert(renderCompressed(selector("svg|* a:test")) == "svg|* a:test");

assert(renderCompressed(selector("svg|* a:nth-child(2n+1)")) == "svg|* a:nth-child(2n+1)");

assert(renderCompressed(selector("svg|* a::after")) == "svg|* a::after");

let a = selector("a[panda] .d"),
    b = selector("a[panda] .d");

assert("[ a[panda] .d ] == [ a[panda] .d ]", isSelectorEqual(a, b) == true);

b = selector(".a #t s");
assert("[ a[panda] .d ] != [ .a #t s ]", isSelectorEqual(a, b) == false);

b = selector("a[panda].d");
assert("[ a[panda] .d ] != [ a[panda].d ]", isSelectorEqual(a, b) == false);

b = selector(`a[svg|panda].d`);
assert("[ a[panda] .d ] != [ a['panda'].d ]", isSelectorEqual(a, b) == false);


assert(doesRuleHaveMatchingSelector(rule("a[panda] .d{ top:12px}"), selector("a[panda] .d")) == true);

assert(doesRuleHaveMatchingSelector(rule("a[panda].d{ top:12px }"), selector("a[panda] .d")) == false);



