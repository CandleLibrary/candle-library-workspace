/**
 * Test parsing of CSS Grid level 2
 * 
 * reference:
 * https://drafts.csswg.org/css-grid-2/
 */

import { parse } from "@candlelib/css";
import assert from "assert";

//Basic grid 

assert(parse('test{ display:grid }').nodes[0].props.get("display").toString() === "display:grid");

//template column 
assert(parse('test{ grid-template-columns: 20% 20% 20% }').nodes[0].props.get("grid_template_columns").toString() === "grid-template-columns:20% 20% 20%");