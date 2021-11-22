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

    async init(globals, request, respond, RELOAD_DEPENDENCIES) {

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

        while (!this.STOP_ALL_ACTIVITY) {

            const current_time = performance.now();

            for (const wkr of this.workers) {


                if (wkr.test && !wkr.READY) {

                    const dur = current_time - wkr.start;

                    if (dur > wkr.test.timeout_limit) {
                        Logger.get("TEST_RUNNER").activate().log("TEST_TIMED_OUT");

                        this.createWorkerProcess(wkr);

                        if (wkr.test.retries > 0) {
                            Logger.get("TEST_RUNNER").activate().log("RERUN_TEST");
                            wkr.test.retries--;
                            wkr.start = current_time;
                            wkr.target.send({ type: "test", test: wkr.test });
                        } else {
                            const result: TestInfo = <TestInfo>{
                                name: createHierarchalName(wkr.test.name, "Test Timed Out"),
                                expression_handler_identifier: -1,
                                log_start: wkr.start,
                                clipboard_start: wkr.start,
                                clipboard_write_start: wkr.start,
                                previous_clipboard_end: wkr.start,
                                clipboard_end: wkr.start + dur,
                                location: {
                                    compiled: { column: wkr.test.pos.column, line: wkr.test.pos.line, offset: wkr.test.pos.off, },
                                    source: { column: wkr.test.pos.column, line: wkr.test.pos.line, offset: wkr.test.pos.off, }
                                },
                                logs: [],
                                //@ts-ignore
                                errors: [createTestErrorFromString("Test timed out at " + dur + " milliseconds", globals.harness)],
                                test: wkr.test,
                                TIMED_OUT: true,
                                PASSED: false
                            };

                            this.respond(wkr.test, result);

                            wkr.test = null;
                            wkr.READY = true;
                        }
                    }
                } else if (wkr.READY) {

                    const test = await this.request(this);

                    if (test) {
                        wkr.test = test;
                        wkr.start = current_time;
                        wkr.target.send({ type: "test", test: wkr.test });
                        wkr.READY = false;
                    }
                }
            }

            await spark.sleep(100);
        }
    }

    deleteWorkerProcess(wkr: DesktopWorkerHandle) {
        if (wkr.target) {
            wkr.target.send({ type: "close" });
            wkr.target.disconnect();
            // wkr.target.kill();
            wkr.target = null;
        }
    }

    createWorkerProcess(wkr, module_url = this.module_url) {

        if (wkr.target)
            return;

        const worker = fork(module_url, {
            env: {
                //  "NODE_V8_COVERAGE": "/tmp/tests/"
            }
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
                    results.forEach(res => res.test = wkr.test);
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
    private loadWorkers(RELOAD_DEPENDS: boolean, workers, url?) {
        for (const wkr of workers) {

            wkr.test = null;

            if (!wkr.READY && wkr.test) {

                this.deleteWorkerProcess(wkr);

                this.createWorkerProcess(wkr, url);

                wkr.start = 0;
            }
        }
    }
}



