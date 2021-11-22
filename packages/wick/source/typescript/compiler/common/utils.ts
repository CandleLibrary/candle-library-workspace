import { traverseFilesFromRoot } from '@candlelib/paraffin';
import URI from '@candlelib/uri';
import { parse_html, parse_markdown } from '../source-code-parse/parse.js';
import { convertMarkdownToHTMLNodes } from './markdown.js';

let working_directory = null;
export function set_working_directory(uri: URI) {
    working_directory = uri;
}

export function reset_working_directory() {
    working_directory = null;
}
/**
 * Yields URIs of files residing within the start_path and
 * its subdirectories.
 * @param start_path 
 */
export async function* loadFiles(start_path) {

    const start_directory = URI.resolveRelative(start_path, working_directory);

    yield* traverseFilesFromRoot(start_directory);
}
/**
 * Parses file at the givin input if it is one of the following
 * - MD
 * - HTML
 * - WICK
 * - JAVASCRIPT
 */
export async function parse(uri: URI) {

    if (!(uri instanceof URI))
        throw new Error("Expecting a URI object");

    const data = await uri.fetchText();

    switch (uri.ext.toLowerCase()) {
        case "md":
            return convertMarkdownToHTMLNodes(parse_markdown(data));
        case "html":
        case "htm":
            return parse_html(data);
        case "wick":
            return parse_markdown(data);
    }

    return data;
}

