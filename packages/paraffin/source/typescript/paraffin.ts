/**
 * Copyright 2021
 *
 * MIT License
 *
 * Copyright (c) 2021 Anthony C. Weathersby
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
*/
import { Logger, LogLevel } from '@candlelib/log';
import URI from '@candlelib/uri';
import "./logger_inject.js";
import { Argument } from "./types/cli_arg_types";
export {
    col_css,
    col_pwg, col_x11, xtBlink, xtBold, xtColor, xtDim, xtF, xtHidden, xtInvert, xtRBlink, xtRBold,
    xtRDim, xtReset, xtRInvert, xtRUnderline, xtUnderline
} from "./color/color.js";
export { PackageJSONData } from "./types/package.js";
export { getPackageJsonObject, savePackageJSON } from "./utils/get_package_json.js";
export {
    addCLIConfig, getProcessArgs, processCLIConfig
} from "./utils/command_processor.js";
export * from "./utils/traverse_files.js";
export { Argument };


const enum RT_TYPE {
    DENO,
    NODE
}

export enum FS_RESULTS {
    COULD_NOT_ACCESS_DIR,
    COULD_NOT_ACCESS_FILE,
    INVALID_INPUT,
    OK
}

export const args = {
    log_level_properties: <Argument<LogLevel>>{
        key: "loglevel",
        "help_brief":
            `
Filter the level of messages printed to the console:

- verbose: All messages will be printed.

- normal (default): All messages except "debug" messages will be printed.

- errors: Only "warn", "error", and "critical" messages will be printed.
`,
        accepted_values: ["verbose", "normal", "errors"],
        default: <any>"normal",
        REQUIRES_VALUE: true,
        transform: (val: string, args) => {

            let log_level = LogLevel.INFO | LogLevel.WARN | LogLevel.ERROR | LogLevel.CRITICAL;

            switch (val) {
                case "verbose":
                    log_level = LogLevel.INFO | LogLevel.ERROR | LogLevel.CRITICAL | LogLevel.WARN | LogLevel.DEBUG;
                    break;
                case "normal":
                    log_level = LogLevel.INFO | LogLevel.WARN | LogLevel.ERROR | LogLevel.CRITICAL;
                    break;
                case "errors":
                    log_level = LogLevel.WARN | LogLevel.ERROR | LogLevel.CRITICAL;
                    break;
            }

            Logger.setDefaultLogLevel(log_level);

            return log_level;
        }
    }
};


const RT = ("DENO" in globalThis) ? RT_TYPE.DENO : RT_TYPE.NODE;
const Deno = RT ? globalThis["Deno"] : undefined;
export const utils = {

    get cwd() {
        if (RT == RT_TYPE.DENO) {
            return Deno.cwd();
        } else {
            return process.cwd();
        }
    },

    async readJSON() {
        if (RT == RT_TYPE.DENO) {

        } else {

        }
    },

    async readUTF8() {
        if (RT == RT_TYPE.DENO) {

        } else {

        }
    },

    async readBuffer() {
        if (RT == RT_TYPE.DENO) {

        } else {

        }
    },

    /**
     * Converts a JS object to a JSON string
     * and writes to given location
     */
    async writeToJSONFile(obj: any[] | object, location: URI, logger?: Logger) {

        if (typeof obj != "object" || Array.isArray(obj)) {
            if (logger) {
                logger.error(`Expected obj arg to be type object or an Array. Got ${typeof obj}`);
            }
            return FS_RESULTS.INVALID_INPUT;
        }

        let output = "";
        try {
            output = JSON.stringify(obj, undefined, 2);
        } catch (e) {
            if (logger) {
                logger.error(`Unable to stringify input as JSON:`, e.message);
            }
            return FS_RESULTS.INVALID_INPUT;
        }

        return utils.writeToUTF8File(output, location, logger);
    },

    async writeToBinaryFile() {
        if (RT == RT_TYPE.DENO) {

        } else {

        }
    },

    async writeToUTF8File(output: string, location: URI, logger?: Logger) {

        if (typeof output != "string") {
            if (logger) {
                logger.error(`Expected as output argument to writeToUTF8File`);
            }
            return FS_RESULTS.INVALID_INPUT;
        }

        if (RT == RT_TYPE.DENO) {

        } else {
            const fs = await import("fs");
            const fsp = fs.promises;
            //Ensure the directory exists;
            try {

                await fsp.mkdir(location.dir, { recursive: true });

                try {

                    await fsp.writeFile(location + "", output, { encoding: "utf8" });

                } catch (e) {
                    if (logger) {
                        logger.error(`Could not write file [ ${location + ""} ]`);
                        logger.error(e.message);
                    }
                    return FS_RESULTS.COULD_NOT_ACCESS_FILE;
                }
            } catch (e) {
                if (logger) {
                    logger.error(`Could not write to directory [ ${location.dir + ""} ]`);
                    logger.error(e.message);
                }
                return FS_RESULTS.COULD_NOT_ACCESS_DIR;
            }

            return FS_RESULTS.OK;
        }
    }
};
