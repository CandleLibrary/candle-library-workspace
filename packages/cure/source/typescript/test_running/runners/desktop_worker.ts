import spark from '@candlelib/spark';
//@ts-ignore
import equal from "deep-equal";
import { performance } from "perf_hooks";
import * as util from "util";
import { rst } from "../../reporting/utilities/colors.js";
import { ImportSource } from "../../types/imports.js";
import { Test } from "../../types/test.js";
import { createNameErrorMessage } from "../../utilities/library_errors.js";
import { createHierarchalName } from "../../utilities/name_hierarchy.js";
import { createTestFunctionFromTestSource } from "../utilities/create_test_function.js";
import { createTestHarnessEnvironmentInstance } from "../utilities/test_harness.js";


//@ts-ignore
const harness_env = createTestHarnessEnvironmentInstance(equal, util, <Performance><any>performance, rst);
export const harness = harness_env.harness;
export const ImportedModules: Map<string, any> = new Map();
export async function loadImport(source: string) {
    try {
        return await import(source);
    } catch (e) {
        throw (e);
    };
}

export function createAddendum(sources: ImportSource[], test: Test) {


    if (sources.findIndex(s => s.module_specifier == "@candlelib/wick") >= 0)
        return `const __URI__ = (await import("@candlelib/uri")).default; __URI__.GLOBAL = new __URI__("${test.working_directory + "/"}")`;
    if (sources.findIndex(s => s.module_specifier == "@candlelib/uri") >= 0) {
        return `const __URI__ = (await import("@candlelib/uri")).default; __URI__.server(); __URI__.GLOBAL = new __URI__("${test.working_directory + "/"}")`;
    }
    return "";
}

async function RunTest({ test }: { test: Test; }) {
    let results = [];

    const {
        harness,
        harness_flushClipboard,
        harness_getResults,
        harness_overrideLog,
        harness_restoreLog,
        harness_init,
        harness_initSourceMapFromString,
        harness_initialSourceCodeString
    } = harness_env;

    try {
        //@ts-ignore
        global.harness = harness;

        harness_init(
            test.source_location,
            test.working_directory
        );
        harness_overrideLog();

        //Test Initialization TestResult
        //console.log({ ImportedModules });
        const fn = (await createTestFunctionFromTestSource(
            test,
            harness,
            ImportedModules,
            loadImport,
            createAddendum
        ));

        // Clear any existing TestInfo created by [createTestFunctionFromTestSource]
        harness_init(
            test.source_location,
            test.working_directory
        );

        harness_initialSourceCodeString(test.source);

        // Global TestResult 
        // - Catchall for any errors that lead to a hard crash of the test function
        harness.pushTestResult();

        harness_initSourceMapFromString(test.map);

        harness.setResultName(createHierarchalName(test.name, `Test failed with a critical error`));

        await fn();

        harness.popTestResult();

        harness_restoreLog();

        results = harness_getResults().slice(0, -1);

    } catch (e) {

        if (e instanceof Error) {

            harness_restoreLog();

            harness_flushClipboard();

            harness.addException(e);

            harness.popTestResult();
        }

        results = harness_getResults().slice(-1); //Only return the worker test
    }


    if (results.length == 0) {

        harness_init(
            test.source_location,
            test.working_directory
        );

        harness.pushTestResult();

        harness.setResultName("Critical Test Errors");

        harness.addException(new Error("No results generated from this test"));

        harness.popTestResult();

        results = harness_getResults();
    }

    for (let i = 0, result = null; (result = results[i], i++ < results.length);)
        if (result.name == "") {
            result.name = createNameErrorMessage(i);
            result.PASSED = false;
        }


    return results;


    //parentPort.postMessage(results);
}

//parentPort.on("message", RunTest);


let POLLING = true;
process.on("message", async (m: { type: "close"; } | { type: "test"; test: Test; }) => {

    if (m.type == "close") {
        POLLING = false;
    } else {

        const results = await RunTest(m);

        if (process.send)
            process.send(results);
    }
});

process.on("SIGTERM", () => {
    POLLING = false;
    process.exit();
});

process.on("disconnect", () => {
    POLLING = false;
    process.exit();
});

if (process.send) {

    process.send({ ready: true });

    async function poll() {
        while (POLLING) { await spark.sleep(50); }
        process.exit();
    }

    await poll();
}

