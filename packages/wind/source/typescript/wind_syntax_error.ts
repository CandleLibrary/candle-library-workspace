import { jump_table } from "./tables.js";
import { LexerType } from "./types.js";
/**
 * Error Object produced by wind.errorMessage
 */

const HORIZONTAL_TAB = 9,
    arrow = "^",
    line = "-",
    thick_line = "=";

export function blame(lex: LexerType) {
    const tab_size = 4, window_size = 400, file = lex.source;
    // Get the text from the proceeding and the following lines; 
    // If current line is at index 0 then there will be no proceeding line;
    // Likewise for the following line if current line is the last one in the string.

    let
        line_start = lex.off - lex.char,
        char = lex.char,
        l = lex.line,
        str = lex.str,
        len = str.length,
        sp = " ";

    lex.tl = lex.tl || 1;

    let prev_start = 0,
        next_start = 0,
        next_end = 0,
        i = 0;

    //get the start of the proceeding line
    for (i = line_start; --i > 0 && jump_table[str.codePointAt(i)] !== 6;);
    prev_start = i;


    //get the end of the current line...
    for (i = lex.off + lex.tl; i < len && jump_table[str.codePointAt(i)] !== 6; i++);
    next_start = i;

    //and the next line
    for (i++; i < len && jump_table[str.codePointAt(i)] !== 6; i++);
    next_end = i;

    let pointer_pos = char - (line_start > 0 ? 1 : 0);

    for (i = line_start; i < lex.off; i++)
        if (str.codePointAt(i) == HORIZONTAL_TAB)
            pointer_pos += tab_size - 1;

    prev_start = Math.max(prev_start, 0);
    line_start = Math.max(line_start, 0);
    next_start = Math.max(next_start, 0);
    //find the location of the offending symbol
    const
        prev_line = str.slice(prev_start + (prev_start > 0 ? 1 : 0), line_start).replace(/\n/g, "").replace(/\t/g, sp.repeat(tab_size)),
        curr_line = str.slice(line_start + (line_start > 0 ? 1 : 0), next_start).replace(/\n/g, "").replace(/\t/g, sp.repeat(tab_size)),
        next_line = str.slice(next_start + (next_start > 0 ? 1 : 0), next_end).replace(/\n/g, "").replace(/\t/g, " "),

        //get the max line length;

        max_length = Math.max(prev_line.length, curr_line.length, next_line.length),
        min_length = Math.min(prev_line.length, curr_line.length, next_line.length),
        length_diff = max_length - min_length,

        //Get the window size;
        w_size = window_size,
        w_start = Math.max(0, Math.min(pointer_pos - w_size / 2, max_length)),
        w_end = Math.max(0, Math.min(pointer_pos + w_size / 2, max_length)),
        w_pointer_pos = Math.max(0, Math.min(pointer_pos, max_length)) - w_start - (line_start == 0 ? 1 : 0),


        //append the difference of line lengths to the end of the lines as space characters;

        prev_line_o = (prev_line + sp.repeat(length_diff)).slice(w_start, w_end),
        curr_line_o = (curr_line + sp.repeat(length_diff)).slice(w_start, w_end),
        next_line_o = (next_line + sp.repeat(length_diff)).slice(w_start, w_end),

        trunc = w_start !== 0 ? "..." : "",

        line_number = n => ` ${(sp.repeat(3) + (n + 1)).slice(-(l + 1 + "").length)}: `,

        error_border = thick_line.repeat(curr_line_o.length + line_number.length + 8 + trunc.length);

    return [
        /* brdr */`${error_border}`,
        /* prev */`${l - 1 > -1 ? line_number(l - 1) + trunc + prev_line_o + (prev_line_o.length < prev_line.length ? "..." : "") : ""}`,
        /* curr */`${true ? line_number(l) + trunc + curr_line_o + (curr_line_o.length < curr_line.length ? "..." : "") : ""}`,
        /* arrw */`${(" " || line).repeat(w_pointer_pos + trunc.length + line_number(l + 1).length) + arrow}`,
        /* next */`${next_start < str.length ? line_number(l + 1) + trunc + next_line_o + (next_line_o.length < next_line.length ? "..." : "") : ""}`,
        /* brdr */`${error_border}`
    ]
        .filter(e => !!e)
        .join("\n");
}
export class WindSyntaxError extends SyntaxError {

    wind_error_message: string;

    /**
     * Source file 
     */
    file: string;

    /**
     * Line number of source file where exception occurred.
     * 
     * @readonly
     */
    line: number;

    /**
     * Column number of source file where exception occurred.
     * 
     * @readonly
     */
    column: number;

    lex: LexerType;

    post_peek_lines: number;

    pre_peek_lines: number;

    window: number;

    msg: string;

    constructor(message: string = "", lex: LexerType) {

        super();


        this.name = "WindSyntaxError";
        this.lex = lex.copy();
        this.file = "";
        this.line = lex.line;
        this.column = lex.column;
        this.post_peek_lines = 1;
        this.pre_peek_lines = 1;
        this.window = 50;
        this.msg = message || "no error message";
    }


    get message() {

        const lex = this.lex, tab_size = 4, window_size = 400, message = this.msg, file = lex.source ?? "";

        return "\n" + message + "\n at " + file + ":" + (lex.line + 1) + ":" + lex.char + "\n" + blame(lex);
    }
}
