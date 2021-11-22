#!/usr/bin/env node

import fs from "fs";
import Jimp from "jimp";
import path from "path";

const
    fsp = fs.promises;



/**
* This is a utility that outputs color ts files based on several color standards
*/



function hexToVec3(hex) {
    const thr_comp_string = hex.slice(1);

    const
        x = parseInt("0x" + thr_comp_string.slice(0, 2)),
        y = parseInt("0x" + thr_comp_string.slice(2, 4)),
        z = parseInt("0x" + thr_comp_string.slice(4, 6))

    return [x, y, z];
}

function rgbToHSV([r, g, b]) {
    let h = 0, s = 0, v = 0;
    var min, max, delta;
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    v = max; // v
    delta = max - min;
    if (max != 0)
        s = delta / max; // s
    else {
        s = 0;
        h = -1;
        return [h, s, v]
    }
    if (r == max)
        h = (g - b) / delta;
    else if (g == max)
        h = 2 + (b - r) / delta;
    else
        h = 4 + (r - g) / delta;
    h *= 60; // degrees
    if (h < 0)
        h += 360;

    return [h, s, v]
}

function compareHex(a$, b$, [a, b, c] = [1, 1, 1]) {
    const
        [x1, y1, z1] = rgbToHSV(hexToVec3(a$)),
        [x2, y2, z2] = rgbToHSV(hexToVec3(b$));

    return Math.sqrt([(x1 - x2) * a, (y1 - y2) * b, (z1 - z2) * c].map(x => x * x).reduce((r, x) => x + r, 0));
}

function compareHexB(a$, b$, [a, b, c] = [1, 1, 1]) {
    const
        [x1, y1, z1] = hexToVec3(a$),
        [x2, y2, z2] = hexToVec3(b$);

    return Math.sqrt([(x1 - x2) * a, (y1 - y2) * b, (z1 - z2) * c].map(x => x * x).reduce((r, x) => x + r, 0));
}

async function getDataURI([r, g, b]) {

    const width = 50,
        height = 50,
        image = await new Jimp(width, height),
        d = new Uint32Array([
            (255) | 0
            |
            (r << 24) | 0
            |
            (g << 16) | 0
            |
            (b << 8) | 0
        ])

    for (var y = 0; y < height; y++)
        for (var x = 0; x < width; x++)
            image.setPixelColor(d[0], x, y)

    return "data:image/png;base64," + (await image.getBufferAsync("image/png")).toString("base64")
}

async function start() {

    const color_data = JSON.parse(await fsp.readFile(path.resolve(process.cwd(), "./utils/colors.json"), { encoding: "utf8" }));

    for (const { prefix, colors, source } of color_data.colorStandards) {

        const out_colors = new Map();

        for (const { name, hex } of colors) {

            const table = color_data.x11ColorTable, hsv_candidates = [], value_candidates = [];

            let i = 0;

            let MATCH = false;

            for (const candidate of table) {

                const a = compareHexB(hex, candidate);

                if (a < 50) {
                    hsv_candidates.push({ i, hex: candidate })
                }
                i++;
            }

            for (const candidate of hsv_candidates) {

                const a = compareHex(hex, candidate.hex, [1, 1, 1]);

                if (a < 20) {

                    if (!out_colors.has(name)) {
                        out_colors.set(name, { i: candidate.i, original: hex, hex: candidate.hex, a })
                    } else {
                        let result = out_colors.get(name);

                        if (a < result.a) {
                            result.a = a;
                            result.i = candidate.i;
                            result.original = hex;
                            result.hex = candidate.hex;
                        }
                    }
                    MATCH = true;
                }
            }
            i = 0;
            if (!MATCH)
                for (const h of table) {

                    const candidate = { i: i++, hex: h }

                    const a = compareHexB(hex, candidate.hex);

                    if (a < 5) {

                        if (!out_colors.has(name)) {
                            out_colors.set(name, { i: candidate.i, original: hex, hex: candidate.hex, a })
                        } else {
                            let result = out_colors.get(name);

                            if (a < result.a) {
                                result.a = a;
                                result.i = candidate.i;
                                result.original = hex;
                                result.hex = candidate.hex;
                            }
                        }
                        MATCH = true;
                    }
                }
        }

        const string = []
        string.push("")
        string.push(`export enum col_${prefix} {`)
        //build a file
        for (const [key, { i, hex, original, a }] of out_colors.entries()) {
            const capital_name = (key[0].toUpperCase() + key.slice(1))
                .replace(/[A-Z]/g, a => " " + a)
                .replace(/\d+/g, d => " " + d).trim();

            let r, g, b, h, s, v;

            const data = `
            /**
             *### ${capital_name} 
             *
             * |xterm|original|
             * |---|----| 
             *|![color preview](${await getDataURI(hexToVec3(hex))}) |![color preview](${await getDataURI(hexToVec3(original))}) |
             *|${hex}|${original}|
             *
             *#### Source
             *${source}
             */
            ${key} = ${i},
            `

            string.push(data);
        }

        string.push("}")
        string.push("")
        string.join('\n')

        fsp.writeFile(`./source/color_${prefix}.ts`, string.join("\n"));
    }
}

start()