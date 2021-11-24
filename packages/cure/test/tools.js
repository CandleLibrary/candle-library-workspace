import { parser } from "@candlelib/js";
import { NullReporter } from "@candlelib/cure";
import { compileTests } from "@candlelib/cure/build/compile/compile.js";
import { compileTestsFromString } from "@candlelib/cure/build/loading/load_tests.js";
import { DesktopRunner } from "@candlelib/cure/build/test_running/runners/desktop_runner.js";
import { runTests } from "@candlelib/cure/build/test_running/run_tests.js";
import { initializeReporterColors } from "@candlelib/cure/build/utilities/create_test_frame.js";
import URL from "@candlelib/uri";
import default_expression_handlers from "../build/compile/expression_handler/expression_handlers.js";
import { loadExpressionHandler } from "../build/compile/expression_handler/expression_handler_functions.js";
import { createGlobals } from "../build/utilities/create_globals.js";
import { createTestSuite } from "../build/utilities/create_test_suite.js";

await URL.server();

export function createTestsFromStringSource(source) {

    const globals = createGlobalsObject();

    const { assertion_sites } = compileTests(parser(source).ast, globals, []);

    return assertion_sites;
}

export function createGlobalsObject(report_constructor = NullReporter) {

    const { globals } = createGlobals(1000, "internal", false, false, false);

    for (const expression_handler of default_expression_handlers)
        loadExpressionHandler(globals, expression_handler);

    globals.reporter = initializeReporterColors(new report_constructor());

    return globals;
}

export async function createTestSuiteFromSource(source, globals = createGlobalsObject()) {

    const suite = createTestSuite("internal", 0);

    await compileTestsFromString(source, suite, globals);

    suite.name = "test";

    return suite;
}

export async function getSuiteTestOutcomeFromSource(source, global_modifications = {}) {

    const globals = createGlobalsObject();

    globals.runners = [new DesktopRunner(1)];

    Object.assign(globals, global_modifications);

    globals.suites = new Map([["dd", await createTestSuiteFromSource(source, globals)]]);

    const suites = Array.from(globals.suites.values());

    await runTests(suites.flatMap(suite => suite.tests), globals);

    await globals.runners[0].close();

    return globals.outcome;
}

export async function getSuiteTestOutcomeFromURL(url_string, global_modifications = {}) {

    const url = URL.resolveRelative(url_string, import.meta.url);

    const source = await url.fetchText();

    return getSuiteTestOutcomeFromSource(source, global_modifications);

}