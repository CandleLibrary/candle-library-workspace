import { log } from '../entry/logger.js';
import { performance } from "perf_hooks";

type RunTag = Readonly<{
    have_stack_name: boolean,
    tag: string;
    start: number;
}>;

let store = <Map<string, number[]>>new Map;

let hierarchy_stack = [""];
export const metrics = {

    startRun(run_tag_name: string): RunTag {

        const name = hierarchy_stack[hierarchy_stack.length - 1];

        let tag_name = run_tag_name;

        let have_stack_name: boolean = true;

        if (have_stack_name) {
            tag_name = name + run_tag_name;
            hierarchy_stack.push(tag_name + " > ");
        }

        return Object.freeze({
            have_stack_name,
            tag: tag_name,
            start: performance.now()
        });
    },

    endRun({ tag, start, have_stack_name }: RunTag) {

        const end = performance.now();

        const duration = end - start;

        if (have_stack_name)
            hierarchy_stack.pop();

        if (!store.has(tag))
            store.set(tag, []);

        store.get(tag).push(duration);
    },

    clearMetrics() {
        store.clear();
        hierarchy_stack.length = 0;
        hierarchy_stack.push("");
    },

    report() {
        let report_string = [];

        for (const [tag, entries] of store) {
            const average_duration = prettyPrintTiming(entries.reduce((r, a) => r + a, 0) / entries.length);
            const max_duration = prettyPrintTiming(Math.max(...entries));
            const min_duration = prettyPrintTiming(Math.min(...entries));

            report_string.push(`\n\n    ${tag}: \n         Average time: ${average_duration}\n         Max time: ${max_duration}\n         Min time: ${min_duration}`);
        }

        log("Metrics Runtime Report", ...report_string);

        metrics.clearMetrics();
    }
};

function prettyPrintTiming(time: number) {
    if (time < 0.001) {
        return (Math.floor(Math.round(time * 1000000)) * 0.001) + "us";
    } if (time > 1000) {
        return (Math.floor(Math.round(time) * 1000)) * 0.000001 + "s";
    } else {
        return (Math.floor(Math.round(time * 1000)) * 0.001) + "ms";
    }
}
