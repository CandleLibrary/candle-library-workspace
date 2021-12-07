import URI from '@candlelib/uri';
let resolved_working_directory = <URI>URI.resolveRelative("./", process.cwd() + "/");

export function get_resolved_working_directory() {
    return resolved_working_directory;
}

export function set_resolved_working_directory(uri: URI) {
    resolved_working_directory = uri;
}