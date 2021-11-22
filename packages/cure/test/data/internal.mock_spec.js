
import chai from "chai";

import { NullReporter } from "../../build/cure.js";

assert("0 Basic built in assertion should pass", 2 + 2 == 4);

var t = 0;

assert("1 Basic built in assertion", t = 4);

assert("2 Chai assert test 1 - Undeclared variable error", assert.equal(a + 1, 2));

const assert = chai.assert;

assert("3 Chai assert test 2", assert.strictEqual(a + 1, 0));

const a = 2;

assert("4 Chai assert test 3", assert.strictEqual(a + 1, 2, "expected a+1 to equal 2"));

assert("5 Chai assert test 4", assert.equal(a, 2, "expected a+1 to equal 2"));

assert("6 Report undeterminable test", data = 1);

assert("7 Basic failed inequality", 1 < 1);

assert("8 Failed strict equality", 1 === "1");

assert("9 Passing equality", 1 == "1");

const np = new NullReporter();
assert("10 The NullReport update method should return true", await np.complete() == true);
