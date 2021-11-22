#!/usr/bin/env node
/**
 * Copyright (C) 2021 Anthony Weathersby - Wick Component Compiler
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * Contact: acweathersby.codes@gmail.com
 */

import {
    addCLIConfig,
    getPackageJsonObject,
    processCLIConfig
} from "@candlelib/paraffin";

import URI from '@candlelib/uri';

URI.server();

import "./cli/test.js";
import "./cli/create.js";
import "./cli/compile.js";
import "./cli/run.js";


const
    { package: pkg, package_dir }
        //@ts-ignore
        = await getPackageJsonObject(new URI(import.meta.url).path),
    HELP_MESSAGE = `
****          CANDLELIB::Wick v${pkg.version}        ****

**** Candle Library's Web Component Compiler ****
`;

addCLIConfig("root", {
    key: "root",
    help_brief: HELP_MESSAGE
});

processCLIConfig();