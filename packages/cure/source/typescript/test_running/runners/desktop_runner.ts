import spark from "@candlelib/spark";
import URL from "@candlelib/uri";
import { performance } from "perf_hooks";
import { fork } from 'child_process';
import { Logger, LogLevel } from '@candlelib/log';
import { DesktopWorkerHandle } from "../../types/desktop_worker_handle";
import { Globals } from "../../types/globals";
import { Test } from "../../types/test.js";
import { TestInfo } from "../../types/test_info";
import { TestRunner, TestRunnerRequest, TestRunnerResponse } from "../../types/test_runner";
import { createHierarchalName } from "../../utilities/name_hierarchy.js";
import { createTestErrorFromString } from "../../utilities/test_error.js";
import { SIGKILL } from 'constants';
import URI from '@candlelib/uri';

export class DesktopRunner implements TestRunner {
    workers: DesktopWorkerHandle[];
    module_url: string;
    STOP_ALL_ACTIVITY: boolean;
    request: TestRunnerRequest;
    respond: TestRunnerResponse;

    constructor(max_workers: number = 1) {

        this.STOP_ALL_ACTIVITY = true;

        const
            module_url = (process.platform == "win32")
                ? import.meta.url.replace(/file\:\/\/\/ /g, "")
                : (new URL(import.meta.url)).pathname;

        this.respond = _ => _;
        this.request = async _ => <any>_;

        this.module_url = module_url.replace("desktop_runner.js", "desktop_worker.js");

        this.workers = <DesktopWorkerHandle[]>(new Array(max_workers))
            .fill(0)
            .map(() => ({ DISCARD: false, READY: false, target: null }));

        for (const wkr of this.workers)
            this.createWorkerProcess(wkr);
    }

    close() {

        for (const wkr of this.workers)
            this.deleteWorkerProcess(wkr);
    }

    Can_Accept_Test(test: Test) { return !test.BROWSER; }

    complete() {

        this.STOP_ALL_ACTIVITY = true;

        const RELOAD_DEPENDENCIES = false;

        this.loadWorkers(RELOAD_DEPENDENCIES, this.workers);
    }

    async init(
        globals: Globals,
        request: TestRunnerRequest,
        respond: TestRunnerResponse,
        RELOAD_DEPENDENCIES: boolean = false
    ) {

        this.STOP_ALL_ACTIVITY = true;

        //Reset any running workers
        this.loadWorkers(RELOAD_DEPENDENCIES, this.workers);

        this.request = request;

        this.respond = respond;

        this.STOP_ALL_ACTIVITY = false;

        await spark.sleep(100);

        this.run(globals);
    }

    async run(globals: Globals) {

        const pending_tests = [];

        while (!this.STOP_ALL_ACTIVITY) {

            try {

                const current_time = performance.now();

                for (const wkr of this.workers) {

                    if (wkr.test && !wkr.READY) {

                        const dur = current_time - wkr.start;

                        // Check that the test timeout has been exceeded

                        if (dur > wkr.test.timeout_limit) {

                            Logger.get("TEST_RUNNER").activate()
                                .log("TEST_TIMED_OUT " + wkr.test.name + " " + wkr.test.timeout_limit + " " + wkr.test.retries);

                            this.killWorkerProcess(wkr);
                            this.createWorkerProcess(wkr);

                            if (wkr.test.retries > 0) {

                                // Allow the test to re-enter the queue after decrementing 
                                // its retries property

                                Logger.get("TEST_RUNNER").activate().log("RERUN_TEST " + wkr.test.name);

                                wkr.test.retries--;

                                wkr.start = current_time;

                                pending_tests.push(wkr.test);

                            } else if (wkr.test) {

                                // The test has failed through timeout. Create a report of this.

                                Logger.get("TEST_RUNNER").activate().warn("UNABLE_TO_COMPLETE_TEST " + wkr.test.name);

                                const result: TestInfo = <TestInfo>{
                                    name: createHierarchalName(wkr.test.name, "Test Timed Out"),
                                    expression_handler_identifier: -1,
                                    log_start: wkr.start,
                                    clipboard_start: wkr.start,
                                    clipboard_write_start: wkr.start,
                                    previous_clipboard_end: wkr.start,
                                    clipboard_end: wkr.start + dur,
                                    location: {
                                        compiled: { column: wkr.test.pos?.column, line: wkr.test.pos?.line, offset: wkr.test.pos?.off, },
                                        source: { column: wkr.test.pos?.column, line: wkr.test.pos?.line, offset: wkr.test.pos?.off, }
                                    },
                                    logs: [],
                                    //@ts-ignore
                                    errors: [createTestErrorFromString("Test timed out at " + dur + " milliseconds", globals.harness)],
                                    test: wkr.test,
                                    TIMED_OUT: true,
                                    PASSED: false
                                };

                                this.respond(wkr.test, result);
                            }

                            wkr.test = null;
                        }
                    } else if (wkr.READY && wkr.target) {

                        let test = null;

                        if (pending_tests.length > 0) {
                            test = pending_tests.pop();
                        } else {
                            test = await this.request(this);
                        }

                        if (test) {
                            wkr.test = test;
                            wkr.start = current_time;
                            wkr.target.send({ type: "test", test: wkr.test });
                            wkr.READY = false;
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }

            await spark.sleep(1);
        }
    }

    killWorkerProcess(wkr: DesktopWorkerHandle) {
        if (wkr.target) {
            wkr.target.kill(SIGKILL);
            wkr.target = null;
        }
    }

    deleteWorkerProcess(wkr: DesktopWorkerHandle) {
        if (wkr.target) {
            wkr.target.send({ type: "close" });
            wkr.target.disconnect();
            wkr.target = null;
        }
    }

    createWorkerProcess(wkr: DesktopWorkerHandle, module_url = this.module_url) {

        if (wkr.target)
            return;

        const worker = fork(module_url, {
            env: Object.assign({
                "NODE_OPTIONS": "--enable-source-maps"
                //  "NODE_V8_COVERAGE": "/tmp/tests/"
            }, process.env),
            execArgv: ["--enable-source-maps"]
        });

        //const worker = new Worker(module_url);


        worker.on("error", e => {
            Logger.get("cure").get("server-runner").activate(LogLevel.ERROR).error(e.toString());
        });

        worker.on("message", (results: TestInfo[]) => {

            if ("ready" in results) {
                wkr.READY = true;
            } else {
                if (!this.STOP_ALL_ACTIVITY && wkr.test) {
                    results.forEach(res => res.test = <Test>wkr.test);
                    this.respond(wkr.test, ...results);
                    wkr.test = null;
                    wkr.READY = true;
                }
            }
        });

        wkr.target = worker;

        return worker;
    }


    /**
     * REMOVE  - No longer need to access this data in worker.
     * Sends a set list of local files to the worker process.
     * 
     * @param wkr A runner_worker reference,
     * @param globals The globals object @type {Globals} 
     * 
     * ```js
     initiateTestRun(wkr, globals: Globals) {
         wkr.target.postMessage({ accessible_files: [...globals.watched_files_map.keys()] });
        }
        ```
    */
    private loadWorkers(RELOAD_DEPENDS: boolean, workers: DesktopWorkerHandle[], url?: string) {
        for (const wkr of workers) {

            if (RELOAD_DEPENDS) { wkr.READY = false; }

            wkr.test = null;

            if (!wkr.READY && RELOAD_DEPENDS) {

                this.deleteWorkerProcess(wkr);

                this.createWorkerProcess(wkr, url);

                wkr.start = 0;
            }
        }
    }
}



