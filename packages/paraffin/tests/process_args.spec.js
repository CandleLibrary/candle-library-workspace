/**[API]:testing
 * 
 * Test for argument parsing. 
 * 
 * NodeJS process.argv is an array of strings, so
 * that structure is recreated in this test by replacing
 * the argv structure to with authentic like argv test data. 
 * The first two argv entries are normally the process name 
 * and CWD, which are ignored in getProcessArgs,
 * these will be replaced with empty strings in the test data.
 * 
 * Input:
 * `{empty-string} {empty-string} --test "test value" --value uncaptured -abt timeout --data=./data/dir"`
 * Reference:
 * 
 * https://nodejs.org/docs/latest/api/process.html#process_process_argv
 */

import {
    getProcessArgs,
    addCLIConfig,
    processCLIConfig
} from "../build/library/paraffin.js";
import assert from "assert";


process.argv.length = 0;
process.argv.push("", "", "--test", `"test value"`, "--value", "uncaptured  ", "-abt", "timeout", "./dir", "--data", "=./data/dir", "../fi-le/path", "\"./another-potential/file/path/**/*.js\"");

/**[ADDENDUM]
 * The passed data is a list of anticipated arguments
 * and a boolean indicated if there should be arguments
 * for a givin key, or a string value indicating the argument
 * is an alias of another key.
 */
const args = getProcessArgs({
    test: true,
    t: "test",
    value: false,
    data: false
});

assert(typeof args.test.val == "string");
assert(typeof args.value.val == "boolean");
assert(typeof args.data.val == "string");
assert(typeof args.a.val == "boolean");
assert(typeof args.t.val == "string");
assert(typeof args.timeout == "undefined");

assert(args.value.val == true);
assert(args.test.val == "timeout");
assert(args.data.val == "./data/dir");

assert(
    "All trailing arguments should be present in args.trailing_arguments",
    args.trailing_arguments == ["../fi-le/path", "./another-potential/file/path/**/*.js"]
);


assert("addCLIConfig throws if the last argument is not an Argument object", !addCLIConfig("publish", "test"));


assert_group("Command Path Interface", sequence, () => {

    let CALLED = false;

    const handle =
        addCLIConfig("publish", {
            key: "test",
            accepted_values: ["trees"],
            REQUIRES_VALUE: true,
        }),

        multi_handle = addCLIConfig("publish", "npm", {
            key: "test",
            accepted_values: [String],
            REQUIRES_VALUE: false,
        }),
        throwing_handle = addCLIConfig("publish", "npm", {
            key: "throw",
            REQUIRES_VALUE: false,
            validate: (val) => "This argument cannot exist"
        });

    addCLIConfig("publish", {
        key: "publish",
        help_brief: "Test",
    }).callback = () => { };

    addCLIConfig("publish", "npm", {
        key: "npm",
        help_brief: "Test",
    }).callback = () => {
        CALLED = true;
    };
    await processCLIConfig("", false, ["publish", "npm", "--test grass"]);

    await processCLIConfig("", false, ["publish", "--test trees"]);

    assert("Handle is assigned value of argument that captures a value", handle.value == "trees");

    assert("Handle is assigned value of argument that captures a value, multi command", multi_handle.value == "grass");

    assert("Returns the command path that was taken: help path", await processCLIConfig("", false, ["publish", "--help"]) == "publish::help");

    assert("Returns the command path that was taken: root help path", await processCLIConfig("", false, ["--help"]) == "root::help");

    assert("Returns the command path that was taken: regular command path", await processCLIConfig("", false, ["publish", "npm"]) == "publish/npm");

    assert("Returns the command path that was taken: depth 2 help", await processCLIConfig("", false, ["publish", "npm", "--help"]) == "publish/npm::help");

    assert("Throws if a required value fails validation", !processCLIConfig("", false, ["publish", "npm", "--throw"]));

    assert("Callback registered on command is called", CALLED == true);
});