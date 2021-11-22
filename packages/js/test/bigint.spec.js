/**
 * Parses bigint
 */

import { parser, renderCompressed } from "../build/javascript.js";

let { ast } = parser("1n;");

assert(renderCompressed(ast) == "1n;");