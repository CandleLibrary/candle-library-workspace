import {
    Dispatcher,
    ext_map
} from "@candlelib/lantern";
import URI from '@candlelib/uri';
import { promises as fsp } from 'fs';
import { compile_module } from '../server/compile_module.js';
import { get_resolved_working_directory } from "./resolved_working_directory.js";
import { logger } from "../logger.js";

export const workspace_modules_dispatch = <Dispatcher>{
    name: "Workspace Editor Modules",
    MIME: "application/javascript",
    priority: 10000,
    keys: [],
    init(lantern, dispatcher) {
        lantern.addExtension("js", "application/javascript");
        lantern.addExtension("ts", "application/javascript");
        dispatcher.keys = [{ ext: ext_map.ts | ext_map.ts, dir: "/*" }];
    },
    respond: async function (tools) {
        const output_dir = <URI>URI.resolveRelative("./.wick-temp/", get_resolved_working_directory());
        const module_path = <URI>URI.resolveRelative(tools.pathname, get_resolved_working_directory());
        const output_path = <URI>URI.resolveRelative("./" + tools.file + ".temp", output_dir);

        if (tools.ext == "ts") {

            if (!await output_dir?.DOES_THIS_EXIST()) {
                logger.debug("Creating wick-temp folder");
                await fsp.mkdir(output_dir + "", { recursive: true });
                logger.debug("Created wick-temp folder");
            }

            await compile_module(module_path + "", output_path + "");

            if (await output_path.DOES_THIS_EXIST()) {
                tools.setMIME();
                return tools.sendUTF8FromFile(output_path + "");
            }
        }

        return false;
    }
};
