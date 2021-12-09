/**
 * Copyright (C) 2021 Anthony Weathersby - Flame Language Server & Dev Server
 */
import { args } from "@candlelib/lantern";
import { Logger } from "@candlelib/log";
import {
    addCLIConfig,
    args as paraffin_args,
    getPackageJsonObject,
} from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import { Environment, setEnv } from '../common/env.js';
import { init_build_system } from '../compiler/init_build_system.js';
import { logger } from '../workspace/common/logger.js';
import { create_config_arg_properties } from './config_arg_properties.js';

const
    command_name = "workspace",
    log_level_arg = addCLIConfig(command_name, paraffin_args.log_level_properties),
    config_arg = addCLIConfig(command_name, create_config_arg_properties("Flame")),
    port_arg = addCLIConfig(command_name, args.create_port_arg_properties("Wick", "WICK_DEV_PORT", "8080")),
    browser_arg = addCLIConfig<string>(command_name, {
        key: "browser",
        REQUIRES_VALUE: true,
        default: "none",
        help_arg_name: "browser-name",
        accepted_values: ["chrome", "opera", "safari", "edge", "firefox"],
        help_brief: "Open a web browser after component has been compiled and server has started"
    }),
    { package: pkg, package_dir }
        //@ts-ignore
        = await getPackageJsonObject(new URI(import.meta.url).path);


addCLIConfig<URI>(command_name, {
    key: command_name,
    default: <URI>URI.resolveRelative(process.cwd()),
    transform: (arg: URI, _: any) => <URI>URI.resolveRelative(arg),
    accepted_values: <(typeof URI)[]>[URI],
    help_arg_name: "Workspace Directory",
    REQUIRES_VALUE: true,
    help_brief:
        `
Starts Wick in Component Editing Mode.

This starts integrated editing systems for WYSIWYG
development of components within a browser and HMR
support components edited within a code editor. 
`}


).callback =
    async (arg) => {

        const port = port_arg.value;

        Logger.get("lantern").deactivate()
            .activate(log_level_arg.value);
        logger.deactivate()
            .activate(log_level_arg.value)
            .debug(`Using local network port [ ${port} ]`);

        setEnv(Environment.WORKSPACE);

        await init_build_system();

        (await import('../workspace/server/server.js'))
            .initDevServer(port, config_arg.value, new URI(arg + '/'));
    };
