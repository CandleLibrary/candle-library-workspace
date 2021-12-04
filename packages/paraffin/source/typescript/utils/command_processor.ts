
//import { ParserEnvironment } from "@candlelib/hydrocarbon";
//import parse_data from "../parser/parser.js";
import URI from '@candlelib/uri';
import { col_x11, xtBold, xtColor, xtF, xtReset } from "../color/color.js";
import { limitColumnLength } from '../logger_inject.js';
import framework from "../parser/args_parser.js";
import { Argument, ArgumentHandle, CommandBlock } from '../types/cli_arg_types';
import { Output } from '../types/output';
import { e } from './ascii.js';

const err_color = xtF(xtColor(col_x11.Red), xtBold);
const warn_color2 = xtF(xtColor(col_x11.Orange3));
const warn_color = xtF(xtColor(col_x11.Orange3), xtBold);
const key_color = xtF(xtColor(col_x11.LightBlue3), xtBold);
const string_color = xtF(xtColor(col_x11.SeaGreen3));
const bold = xtF(xtBold);
const rst = xtF(xtReset);
const showHelpDoc = console.log;
const { parse } = await framework;

/**[API]
 *	Returns an object housing key:value pairs from the values of process.argv. 
 *	
 *	Maps argv that begin with [-] to keys, and following argv values that 
 *	do not lead with [-] to values. 
 *	
 *	Prop keys are created by stripping Argv keys of leading [-] chars and having 
 *	all other [-] chars replaced with [_]. 
 *	
 *	Argv keys that are not followed by non [-] leading argv values have value set to [""].
 *
 *	Returned object contains both properties named by the converted keys assigned to the key:value pairs,
 *	and an array prop that contains the the key:value pairs ordered left to right based on the 
 *	original argv index location. 
 */
export function getProcessArgs<T>(
    /** An object whose keys represent expected argument keys
     *  and key~values which can either be `true`, `false` or a string
     * 
     * 1. If the value is `true` then the any argument with -- or -
     * proceeding it will have capture the next naked argument
     * 
     * 2. If this value is `false` then no value will be assigned to the
     * argv unless the argv key is followed by an equal [=] character
     * 
     * 2. If the value is a `string` then the it will act like case 1.
     * and, in addition, the value will be remapped to an output property
     * with a key that matches the `string` value. 
     * > This will overwrite any existing property with the same name.
     */
    arg_candidates: T = <T>{},

    /**
     * An optional error message to log to the console in the 
     * event arguments could not be parsed
     * 
     * Defaults to ""
     */
    process_arguments: string[] = process.argv.slice(2)

): Output<typeof arg_candidates> {

    if (process_arguments.length < 1) {
        //@ts-ignore
        return {
            __array__: [],
            trailing_arguments: []
        };
    }

    const env = {
        options: {},
        functions: {},
        data: arg_candidates
    };

    const { result, err } = parse(process_arguments.join(" "), env);

    const value = result[0];


    // for each arg candidate,
    // if the arg candidate value is a string, then replace the output value entry 
    // with the value of this argument.

    if (err) {

        console.error(err);

        return <Output<typeof arg_candidates>>{ __array__: [] };
    } else {



        for (const name in arg_candidates) {
            const val = arg_candidates[name];
            if (typeof val == "string") {
                if (value[name])
                    value[<string>val] = value[name];
            }
        }

        value.trailing_arguments = [];

        for (const [key, val, hyphens] of value.__array__.reverse()) {
            if (val || hyphens > 0) break;
            value.trailing_arguments.push(key);
        }

        value.trailing_arguments = value.trailing_arguments.reverse();
    }

    return value;
}

let configs: CommandBlock<any> = {
    key: "root",
    path: "root",
    name: "root",
    help_brief: "",
    arguments: new Map,
    sub_commands: new Map
};
/**
 * Assigns an argument or command data to a command path and returns a 
 * handle to the argument object, or to the command.
 */
export function addCLIConfig<T = any, Default = any>(...commands: (string | Argument<T, Default>)[]): ArgumentHandle<T, Default> {

    if (typeof commands.slice(-1)[0] != "object")
        throw new Error("Invalid type provided for the last argument. Should be an object that matches the Argument interface");

    const argument: Argument<T, Default> = Object.assign({}, <any>commands.slice(-1)[0]);

    let command_block = configs;

    let path = commands.slice(0, -1);

    let command_path = [];

    if (
        command_block.name == argument.key
        &&
        path.length == 1
        &&
        path[0] == "root"

    ) {
        //Merge the command

        Object.assign(configs, argument);

    } else for (const command of path) {

        command_path.push(command);

        if (typeof command == "string") {

            if (!command_block.sub_commands.has(command)) {

                command_block.sub_commands.set(
                    command,
                    //@ts-ignore
                    Object.assign({}, {
                        path: command_path.join("/"),
                        name: command,
                        help_brief: "",
                        arguments: new Map,
                        sub_commands: new Map
                    })
                );
            }

            command_block = command_block.sub_commands.get(command);
        }
    }


    if (command_block.name == argument.key) {

        Object.assign(command_block, argument);

        const handle: ArgumentHandle<any> = {
            argument: null,
            value: "command",
            callback: null
        };

        command_block.handle = handle;

        Object.freeze(command_block);

        return handle;

    } else {

        argument.handles = [];

        argument.path = path.join("/") + "::" + argument.key;

        if (!argument.accepted_values && argument.REQUIRES_VALUE)
            argument.accepted_values = [String];


        command_block.arguments.set(<string>argument.key, argument);

        const handle: ArgumentHandle<any> = {
            argument: argument,
            value: null
        };

        argument.handles.push(handle);

        return handle;
    }
};

export async function processCLIConfig(
    /**
     * Name of the process as entered in the command line.
     */
    process_name: string,
    /**
     * Automatically end process if an error is captured 
     */
    AUTO_EXIT_ON_FAILURE: boolean = true,
    process_arguments: string[] = process.argv.slice(2),
): Promise<string> {
    try {
        let command_block: CommandBlock<any> = configs;

        let i = 0;

        for (; i < process_arguments.length; i++) {

            const command_candidate = process_arguments[i];

            if (command_block.sub_commands.has(command_candidate)) {

                command_block = command_block.sub_commands.get(command_candidate);

                continue;

            } else break;
        }

        const remaining_arguments = process_arguments.slice(i);

        const arg_params = { "md": true }, to_process_arguments: Set<Argument<any>> = new Set();

        for (const [key, arg] of command_block.arguments) {

            arg_params[key] = false;

            if (arg.REQUIRES_VALUE === true || arg.accepted_values)
                arg_params[key] = true;

            //if (arg.default != undefined || arg.REQUIRES_VALUE === true)
            to_process_arguments.add(arg);
        }

        const args = getProcessArgs(arg_params, remaining_arguments);

        for (const key in args) {

            if (
                key == "md"
                ||
                key == "h"
                ||
                key == "help"
                ||
                key == "?"
                ||
                !(command_block?.handle?.callback)
            ) {

                const help_doc = key == "md"
                    ? renderMarkdownHelpDoc(command_block, args[key]?.val || "").join("\n")
                    : "\n" + renderHelpDoc(command_block, process_name);

                showHelpDoc(help_doc);

                return command_block.path + "::help";
            }

            if (command_block.arguments[key]) {
                to_process_arguments.add(command_block.arguments[key]);

            }
        }

        for (const arg of to_process_arguments) {

            const key = arg.key;


            const input_val = args[key]?.val ?? !!args[key];

            let val = await process_argument(arg, input_val);

            if (arg.transform)
                val = await arg.transform(val, args);

            for (const handle of arg.handles)
                handle.value = val;
        }

        let command_val: any = null;

        if (command_block.REQUIRES_VALUE || command_block.accepted_values) {
            command_val = await process_argument(command_block, args.trailing_arguments.pop());
        }

        if (command_block?.handle?.callback)
            await command_block?.handle?.callback(command_val, args);

        return command_block.path;

    } catch (e) {

        if (e && e instanceof Error)
            console.error(e.stack);
        if (AUTO_EXIT_ON_FAILURE)
            process.exit(-1);
        else throw e;
    }
}

async function process_argument(
    arg: CommandBlock<any> | Argument<any>,
    input_val: any
) {

    if (arg.REQUIRES_VALUE && !input_val && arg.default === undefined) {

        let arg_value = arg.path == arg.key ? "" : "--";

        const error = `\n  ARGUMENT ERROR:\n\n   No value provided for argument [ ${arg_value}${arg.key} ${renderArg(arg)} ]\n`
            + (arg.accepted_values ? `   Expected ${renderArg(arg)} to be one of [ ${arg.accepted_values.map(v => {
                if (typeof v == "string")
                    return `"${v}"`;
                else return `<${v.name}>`;
            }).join(", ")} ]\n` : "\n");

        throw new Error(error);
    }

    let val = (input_val || arg.default) ?? null;

    if (input_val) {

        if (arg.validate) {

            const error_message = arg.validate(val);

            if (error_message != undefined) {
                const error = `ARGUMENT ERROR:\n\n[--${arg.key}] = ${val}\n`
                    + addIndent(error_message, 4)
                    + "\n";

                throw new Error(error);
            }
        } else if (arg.accepted_values) {
            let VALID = false;


            for (const validator of arg?.accepted_values ?? []) {
                if (typeof validator == "string" && val == validator) {
                    VALID = true;
                    break;
                } else if (validator === Number && !Number.isNaN(Number.parseFloat(val))) {
                    VALID = true;
                    break;
                } else if (validator === URI) {

                    const _val = new URI(val);


                    if (!_val.path && arg.accepted_values.length == 1)
                        break;

                    val = _val;
                    VALID = true;
                    break;
                } else if (validator === String) {
                    VALID = true;
                    break;
                }
            }

            if (!VALID) {
                if (arg.path == arg.key) {

                } else {
                    throw new Error(`\n${err_color}ARGUMENT ERROR:${rst} [ ${val} ] is not a valid value for [ ${key_color}--${arg.key + rst} ${renderArg(arg)} ]`
                        + `\n\nThis argument accepts  [ ${arg.accepted_values.map(accepted_values_to_string).join(" | ")} ]\n`);
                }
            }
        }
    }

    return val;
}

function addIndent(message: string, number_of_indent_space: number = 2) {
    const space = " ".repeat(number_of_indent_space);
    const indent = "\n" + space;
    return space + message.split("\n").join(indent);
}

function create_header(depth: number) {
    return `#`.repeat(Math.max(1, Math.min(6, depth)));
}

function renderMarkdownHelpDoc(command_block: CommandBlock<any>, cli_name: string = "", header_depth: number = 2): string[] {

    const help_message = [];

    if (command_block.name != "root") {
        help_message.push(
            ...[
                `${create_header(header_depth)} ${command_block.path}`,
                `> `
                + cli_name
                + " "
                + command_block.path.split("::").map(s => `**${s}**`).join(" ")
                + " "
                + [...command_block.arguments].map(getArgRepresentationMD).join(" ")
                + ((command_block.REQUIRES_VALUE || command_block.accepted_values) ? " " + renderArgMD(command_block) : ""),

            ]
        );
    }

    if (command_block.help_brief)
        help_message.push("", ...command_block.help_brief.split("\n").map(s => s.trim()));

    if (command_block.REQUIRES_VALUE || command_block.accepted_values || command_block.arguments.size > 0)
        help_message.push(`${create_header(header_depth + 1)} Arguments:\n`);

    if (command_block.REQUIRES_VALUE || command_block.accepted_values) {

        const arg = command_block;

        const REQUIRED = arg.REQUIRES_VALUE && arg.default === undefined;

        let line = `- >${renderArgMD(arg)}`;

        if (REQUIRED) {
            line += ` **REQUIRED**\n`;
        }

        help_message.push(line);

        if (arg.accepted_values)
            help_message.push(`\n     Accepted values: [ ${arg.accepted_values.map(accepted_values_to_stringMD).join(" | ")} ]\n`);

    }


    if (command_block.arguments.size > 0) {

        for (const [key, arg] of command_block.arguments) {

            const REQUIRED = arg.REQUIRES_VALUE && arg.default === undefined;

            const lines = [`- ${create_header(header_depth + 1)} ${key}`, (`    > **--${key}** ${arg.REQUIRES_VALUE ? " " + renderArgMD(arg) : ""}`)];

            if (REQUIRED) {
                lines.push((` **REQUIRED**`));
            }

            if (arg.accepted_values)
                lines.push("", (`    Accepted values: [ ${arg.accepted_values.map(accepted_values_to_stringMD).join(" | ")} ]\n`));

            lines.push("", "    " + arg.help_brief.split("\n").map(s => s.trim()).join("\n    "));

            help_message.push(...lines, "\n");
        }
    }

    if (command_block.sub_commands.size > 0)

        help_message.push(`${create_header(header_depth)} Sub-Commands`);

    for (const [name, cb] of command_block.sub_commands.entries()) {

        help_message.push(...renderMarkdownHelpDoc(cb, cli_name, header_depth + 1));

        help_message.push("-----");
    }

    return help_message;
}

function renderHelpDoc(command_block: CommandBlock<any>, process_name: string = "", indent = 0) {

    const help_message = [];

    if (!command_block?.handle?.callback) {
        if (command_block.name != "root")
            help_message.push(
                [
                    "NAMESPACE [", command_block.path.split("/").join(" "), "]\n"
                    /* "\nCommand:",
                    command_block.path.split("/").join(" "),
                    [...command_block.arguments].map(getArgRepresentation).join(" "),
                    ((command_block.REQUIRES_VALUE || command_block.accepted_values) ? renderArg(command_block) : "") */
                ].join("")
            );
    } else {

        help_message.push(
            [
                `[${command_block.name}]\n `,
                "\n  syntax:",
                process_name + " " + command_block.path.split("/").join(" "),
                [...command_block.arguments].map(getArgRepresentation).join(" "),
                ((command_block.REQUIRES_VALUE || command_block.accepted_values) ? renderArg(command_block) : "")
            ].join(" ")
        );
    }

    const HAVE_TRAILING_PARAM = command_block.REQUIRES_VALUE || command_block.accepted_values;
    const HAVE_PARAMETERS = command_block.arguments.size > 0;

    if (command_block.help_brief) {
        if (help_message.length > 0)
            help_message.push("");

        help_message.push(addIndent(createHelpColumn(command_block, 80 - indent), indent));
    }

    if (HAVE_TRAILING_PARAM || HAVE_PARAMETERS)
        help_message.push("", addIndent(`${bold}Parameters:${rst}`, indent));
    else help_message.push("");

    if (HAVE_TRAILING_PARAM) {

        const arg = command_block;

        const REQUIRED = arg.REQUIRES_VALUE && arg.default === undefined;

        let line = `${renderArg(arg)}`;

        if (REQUIRED) {
            line += ` ${warn_color}REQUIRED${rst}\n`;
        }

        const lines = ["", addIndent(line, indent + 2)];

        if (arg.accepted_values)
            lines.push(addIndent(`Accepted values: [ ${arg.accepted_values.map(accepted_values_to_string).join(" | ")} ]\n`, indent + 2));

        help_message.push(...lines);
    }

    if (HAVE_PARAMETERS) {

        const arg_indent = indent;

        const arg_info = arg_indent + 2;

        const args = [];

        for (const [key, arg] of command_block.arguments) {

            const REQUIRED = arg.REQUIRES_VALUE && arg.default === undefined;

            const lines = [addIndent(`${key_color}--${key}${arg.REQUIRES_VALUE ? " " + renderArg(arg) : ""}${rst}\n`, arg_indent)];

            if (REQUIRED) {
                lines.push(addIndent(`${warn_color}REQUIRED${rst}\n`, arg_info));
            }

            if (arg.accepted_values)
                lines.push(addIndent(`Accepted Values: [ ${arg.accepted_values.map(accepted_values_to_string).join(" | ")} ]`, arg_info), "");

            lines.push(addIndent(createHelpColumn(arg, 80 - arg_info), arg_info));

            if (args.length > 0)
                args.push("", ...lines);
            else
                args.push(...lines);
        }

        help_message.push(...args);
    }

    /* if (command_block.sub_commands.size > 0)

        help_message.push(addIndent("==================================\n\nSub-Commands:", indent)); */

    for (const [name, cb] of command_block.sub_commands.entries()) {

        help_message.push(addIndent(renderHelpDoc(cb, process_name, indent + 1), indent));
    }

    return help_message.join("\n") + "\n";
};
function renderArg(command_block: CommandBlock<any> | Argument<any>) {
    return `<${command_block.help_arg_name ? command_block.help_arg_name : command_block.key + "_arg"}>`;
}

function renderArgMD(command_block: CommandBlock<any> | Argument<any>) {
    return `&lt;*${command_block.help_arg_name ? command_block.help_arg_name : command_block.key + "_arg"}*&gt;`;
}

function getArgRepresentation(
    [k, v]: [string, Argument<any>],
    index: number,
    array: [string, Argument<any>][]
): string {

    let str = `--${k}`;
    if (v.REQUIRES_VALUE) {
        str += " " + renderArg(v);
        if (!v.default) {
            return `${str}`;
        }
    }
    return `[${str}]?`;
}

function getArgRepresentationMD(
    [k, v]: [string, Argument<any>],
    index: number,
    array: [string, Argument<any>][]
): string {

    let str = `**--${k}**`;
    if (v.REQUIRES_VALUE || v.accepted_values) {
        str += " " + renderArgMD(v);
        if (!v.default) {
            return `${str}`;
        }
    }
    return `[${str}]?`;
}

function accepted_values_to_string(v: any) {
    const map = [
        [(v: any) => (v === Number), () => "num: [0-9]+"],
        [(v: any) => (v === URI), () => "path: \\.*(\\/.+)+"],
        [(v: any) => (v === String), () => "\"*\""],
        [(v: any) => (v instanceof String), (v: any) => `${string_color}"${v}"${rst}`],
        [_ => true, () => `${string_color}"${v.toString()}"${rst}`],
    ];

    for (const [evaluator, value] of map) {
        if (evaluator(v))
            return value(v);
    }
}

function accepted_values_to_stringMD(v: any) {
    const map = [
        [(v: any) => (v === Number), () => "num: [0-9]+"],
        [(v: any) => (v === URI), () => "File Path"],
        [(v: any) => (v === String), () => "\"*\""],
        [(v: any) => (v instanceof String), (v: any) => `"${v}"`],
        [_ => true, () => `<span style="color:green">${v.toString()}</span>`],
    ];

    for (const [evaluator, value] of map) {
        if (evaluator(v))
            return value(v);
    }
}
function createHelpColumn(cb: CommandBlock<any> | Argument<any>, column_size: number = 76): string {

    if (!cb.help_brief) return "";

    return limitColumnLength(cb.help_brief.split("\n").map(s => s.trim()).join("\n").replace(/(?<=[^\n])\n(?=[^\n])/g, " ").trim(), column_size);
}
