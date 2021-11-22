import URI from "@candlelib/uri";
import fs from "fs";
export const fsp = fs.promises;

/**
 * Traverse files from a root directory, descending into 
 * children directories. 
 * 
 * An optional file evaluator function can be used
 * to filter out files based on their URI value.
 * 
 * An option
 * 
 * Yields URIs of file information
 */
export async function* traverseFilesFromRoot(
    dir: URI,
    {
        file_evaluator_function = _ => true,
        directory_evaluator_function = _ => true
    }: {
        file_evaluator_function?: (uri: URI) => boolean,
        directory_evaluator_function?: (uri: URI) => boolean,
    } = <any>{}
): AsyncGenerator<URI> {

    for (const dir_int of await fsp.readdir(dir + "/", { encoding: "utf8", withFileTypes: true })) {
        const uri = URI.resolveRelative("./" + dir_int.name, dir + "/");
        if (dir_int.isFile()) {
            if (file_evaluator_function(uri))
                yield uri;
        } else if (dir_int.isDirectory()) {
            if (directory_evaluator_function(uri))
                yield* traverseFilesFromRoot(
                    uri,
                    { file_evaluator_function, directory_evaluator_function }
                );
        }
    }
}
