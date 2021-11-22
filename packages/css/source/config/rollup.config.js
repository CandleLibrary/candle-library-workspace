import resolve from 'rollup-plugin-node-resolve';

const output = [{
    name: "css",
    file: "./build/css.js",
    format: "iife",
    globals: { "worker_threads": "null", "os": "null" },
}];

export default {
    input: "./build/library/css.js",
    treeshake: { unknownGlobalSideEffects: true },
    output,
    plugins: [resolve({ jail: "", modulesOnly: true })],
    shimMissingExports: true
};

