/**
 * Copyright (C) 2021 Anthony Weathersby - Flame Language Server & Dev Server
 */
import { args as lantern_args } from "@candlelib/lantern";
import { Logger } from "@candlelib/log";
import {
    addCLIConfig,
    args as paraffin_args,
    getPackageJsonObject,
    processCLIConfig
} from "@candlelib/paraffin";
import { args as wick_args } from "@candlelib/wick";
import URI from '@candlelib/uri';

const
    log_level_arg = addCLIConfig("dev-server", paraffin_args.log_level_properties),
    config_arg = addCLIConfig("dev-server", wick_args.create_config_arg_properties("Flame")),
    port_arg = addCLIConfig("dev-server", lantern_args.create_port_arg_properties(
        "Flame", "FLAME_PORT", "8082"
    )),
    { package: pkg, package_dir }
        //@ts-ignore
        = await getPackageJsonObject(new URI(import.meta.url).path);

addCLIConfig("root", {
    key: "root",
    help_brief: `
CANDLE_LIBRARY::FLAME v${pkg.version}

Editing and development tools for CANDLE_LIBRARY::WICK`
});

addCLIConfig("dev-server", {
    key: "dev-server",
    help_brief:
        `
Starts Flame in Component Editing Mode.

This starts integrated editing systems for WYSIWYG
development of components within a browser and HMR
support components edited within a code editor. 
`}


).callback =
    async () => {

        const port = port_arg.value;

        Logger.get("lantern").deactivate()
            .activate(log_level_arg.value);
        Logger.get("wick").deactivate()
            .activate(log_level_arg.value);
        Logger.get("flame").deactivate()
            .activate(log_level_arg.value)
            .debug(`Using local network port [ ${port} ]`);

        (await import('../server/development/flame_dev_server.js.js'))
            .initDevServer(port, config_arg.value);
    };



addCLIConfig("vscode-language-server", {
    key: "vscode-language-server",
    help_brief:
        `
Starts Flame in language server mode for 
Visual Studio Code.
`
}
).callback =
    async (args) =>
        await import("../server/language/vscode.js.js");


processCLIConfig();
