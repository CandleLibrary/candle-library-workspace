import { LogLevel, LogWriter } from "@candlelib/log";

import { col_x11, xtBlink, xtBold, xtColor, xtDim, xtF, xtInvert, xtRBold, xtReset } from "./color/color.js";

import { inspect } from 'util';

const log_color = xtF(xtColor(col_x11.SkyBlue2));
const error_color = xtF(xtBlink, xtBold, xtColor(col_x11.Red3));
const warn_color = xtF(xtColor(col_x11.OrangeRed));
const debug_color = xtF(xtColor(col_x11.GreenYellow));
const time_color = xtF(xtColor(col_x11.LemonChiffon1));
const rst = xtF(xtReset);

let delta = 0;
let prev_name = "";

export function limitColumnLength(
    string: string,
    max_column_length: number,
    join = "\n"
) {
    return string.split("\n").flatMap(v => {
        v = v.trim();
        if (v.length > max_column_length) {
            const spaces = v.split(" ");
            const pending = [];
            const out = [];
            let curr_len = 0;
            for (const str of spaces) {
                if (curr_len + str.length + 8 >= max_column_length) {
                    out.push(pending.join(" "));
                    curr_len = 0;
                    pending.length = 0;
                }
                curr_len += str.length + 1;
                pending.push(str);
            }
            if (pending.length > 0)
                out.push(pending.join(" "));
            return out;

        }
        return v;
    }).join(join);
}

LogWriter.prototype.writeLog = function (
    logger_name: string,
    log_level: LogLevel,
    REWRITE: boolean,
    ...args: any[]
) {
    const max_column = process.stdout.columns;

    const data = limitColumnLength(args.map(i => typeof i == "string" ? i : inspect(i, {
        depth: 8, colors: true
    })).join(" "), max_column, "\n      ");

    let header = "";

    if (prev_name != (logger_name + log_level) || REWRITE)
        switch (log_level) {
            case LogLevel.CRITICAL:
                header = construct_log_header(xtF(xtBold) + "CRITICAL" + xtF(xtRBold), logger_name, "❗", error_color);
                break;
            case LogLevel.ERROR:
                header = construct_log_header("ERROR", logger_name, "❌", error_color);
                break;
            case LogLevel.WARN:
                header = construct_log_header("WARN", logger_name, "⚠️", warn_color);
                break;
            case LogLevel.INFO:
                header = construct_log_header("INFO", logger_name, "ℹ️", log_color);
                break;
            case LogLevel.DEBUG:
                header = construct_log_header("DEBUG", logger_name, "☣️", debug_color);
                break;
        }
    else {
        header = "    •";
    }

    prev_name = logger_name + log_level;

    if (log_level == LogLevel.CRITICAL || log_level == LogLevel.ERROR) {
        process.stderr.write(header + " " + data + "\n");
        delta = 0;
    } else {

        const output = header + " " + data + "\n";

        if (REWRITE) {
            const diff = -delta;
            delta = [...output.matchAll(/\n/g)].length;
            process.stderr.moveCursor(0, diff);
            process.stderr.clearScreenDown();
            process.stderr.write(output);
        } else {
            process.stderr.write(output);
            delta = 0;
        }
    }

};
function construct_log_header(type, logger_name: string, emoji, color: string): any {

    const time = new Date();

    return ["  ", color, emoji, "  ", rst, time_color, time.toLocaleTimeString(undefined, <Intl.DateTimeFormatOptions>{
        hour12: false,
    }), color, " ", logger_name, ` [${type}] `, rst, "\n  ╰─•"].join("");
}

