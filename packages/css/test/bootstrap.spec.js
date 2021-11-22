import spark from "@candlelib/spark";
import {
    rule,
    parse,
    selector,
} from "../build/parser/parse.js";
import { renderCompressed } from "../build/render/render.js";
import { isSelectorEqual, doesRuleHaveMatchingSelector } from "../build/selector/utilities.js";
import URI from "@candlelib/uri";

await URI.server();

import * as csstree from 'css-tree';



const bootstrap = await (new URI("./bootstrap.css").fetchText());

console.time("B");

console.log(parse(bootstrap).nodes);
console.timeEnd("B");
console.time("B");
parse(bootstrap);
console.timeEnd("B");
console.time("B");
parse(bootstrap);
console.timeEnd("B");
console.time("B");
parse(bootstrap);
console.timeEnd("B");
console.time("B");
parse(bootstrap);
console.timeEnd("B");
console.time("B");
parse(bootstrap);
console.timeEnd("B");
console.time("B");
parse(bootstrap);
console.timeEnd("B");
console.time("B");
parse(bootstrap);
console.timeEnd("B");
console.time("B");
parse(bootstrap);
console.timeEnd("B");
console.time("B");
parse(bootstrap);
console.timeEnd("B");
console.time("B");
parse(bootstrap);
console.timeEnd("B");
console.time("B");
parse(bootstrap);
console.timeEnd("B");


const d = parse(bootstrap);



debugger;

await spark.sleep(100);



//assert(parse(bootstrap) == "");