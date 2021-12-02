import { Argument } from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import { WickCompileConfig } from "../types/config";
import { mapEndpoints } from '../workspace/server/load_directory.js';
import { Logger } from "@candlelib/log";

export const compile_logger = Logger.get("wick").get("config");

export const default_config: WickCompileConfig = {
    globals: [],
    RESOLVE_HREF_ENDPOINTS: true,
    endpoint_mapper: mapEndpoints
};

const transformCLI = async (arg: any, args: any[]) => {

    const input_path = <URI>URI.resolveRelative(args.slice(-1)[0]);

    let js_path: URI = <URI>URI.resolveRelative("./wickonfig.js");
    let json_path: URI = <URI>URI.resolveRelative("./wickonfig.json");


    if (!input_path.host && await input_path.DOES_THIS_EXIST()) {
        js_path = <URI>URI.resolveRelative("./wickonfig.js", input_path);
        json_path = <URI>URI.resolveRelative("./wickonfig.json", input_path);
    }

    if (arg instanceof URI) {
        if (arg.ext == "json")
            json_path = <URI>URI.resolveRelative(arg);

        else
            js_path = <URI>URI.resolveRelative(arg);
    }

    let config = default_config;

    if (await js_path.DOES_THIS_EXIST()) {
        try {

            const user_config = (await import(js_path + "")).default || {};

            if (!user_config)
                compile_logger.warn(`Unable to load config object from [ ${js_path + ""} ]:`);

            else
                config = Object.assign({}, config, user_config);

        }
        catch (e) {
            compile_logger.error(`Unable to load config script [ ${js_path + ""} ]:`, e.message);
            throw e;
        }

        compile_logger.debug(`Loaded user wickonfig at:       [ ${js_path + ""} ]`);

    } else if (await json_path.DOES_THIS_EXIST()) {
        try {

            const user_config = await json_path.fetchJSON();

            if (!user_config)
                compile_logger.warn(`Unable to load config object from [ ${json_path + ""} ]:`);

            else
                config = Object.assign({}, config, user_config);

        }
        catch (e) {
            compile_logger.error(`Unable to load config script [ ${json_path + ""} ]:`);
            throw e;
        }

        compile_logger.debug(`Loaded user wickonfig at:       [ ${json_path + ""} ]`);
    }

    return config;
};

export const create_config_arg_properties = (process_name: string = "Wick"):
    Argument<WickCompileConfig> => ({
        key: "config",
        REQUIRES_VALUE: true,
        accepted_values: [URI],
        default: default_config,
        transform: transformCLI,
        help_brief: `
A path to a wickonfig.js or wickonfig.json file. 

If this argument is not present then ${process_name} will search the CWD
for a wickonfig( .js | .json ) file. If again not present, ${process_name}
will use default built-in values.`
    });
