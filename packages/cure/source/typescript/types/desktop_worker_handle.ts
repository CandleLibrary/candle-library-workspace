import { ChildProcess } from 'child_process';
import { Worker } from "worker_threads";
import { Test } from "./test.js";

export interface DesktopWorkerHandle {
    test: Test;

    DISCARD: boolean;

    READY: boolean;

    target: ChildProcess;

    start: number;

    end: number;
}
