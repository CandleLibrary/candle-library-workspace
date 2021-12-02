
import { SchemeConstructor } from "./scheme_constructor.js";

import { date, DateSchemeConstructor } from "./date.js";

import { time, TimeSchemeConstructor } from "./time.js";

import { string, StringSchemeConstructor } from "./string.js";

import { number, NumberSchemeConstructor } from "./number.js";

import { bool, BoolSchemeConstructor } from "./bool.js";

let schemes = { date, string, number, bool, time };



/**
 * Used by Models to ensure conformance to a predefined data structure. Becomes immutable once created.
 * @param {Object} data - An Object of `key`:`value` pairs used to define the Scheme. `value`s must be instances of or SchemeConstructor or classes that extend SchemeConstructor.
 * @readonly
 */
class Schema { }

export { SchemeConstructor, DateSchemeConstructor, TimeSchemeConstructor, StringSchemeConstructor, NumberSchemeConstructor, BoolSchemeConstructor, schemes };
