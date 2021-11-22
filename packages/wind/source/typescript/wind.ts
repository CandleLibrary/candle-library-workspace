/**[API]:license
 * Something broke? Open a bug report. We may or may not fix it, as we are under no 
 * obligation to do so. We'll judge each submission individually and decide what is
 * worthy of correction.
 * 
 * If you want to  get your hands dirty, feel free to change as you need. Open a 
 * pull request if you made some awesomeness that you want to share.
 */

/**[README; API]:brief
 * 
 * Wind is a zero dependency tokenizing class that is used extensively throughout 
 * the CFW libraries. It provides a clean API that allows easy integration into projects 
 * requiring a tokenizer. 
 * 
 * Wind is a simple tokenizing marker object that can be combined 
 * with other objects to provide token recognition, error reporting, parser assertions,
 */

/**[README; API]:credits
* De Bruijn Sequence: http://supertech.csail.mit.edu/papers/debruijn.pdf
*/

import {
    jump_table,
    id,
    num,
    hex,
    oct,
    bin,
    uni_id_cont_discrete,
    uni_id_cont_ranges,
    uni_id_start_discrete,
    uni_id_start_ranges,
    aii,
    air
} from "./tables.js";

import { WindSyntaxError, blame } from "./wind_syntax_error.js";


//De Bruijn Sequence for finding index of right most bit set.
//http://supertech.csail.mit.edu/papers/debruijn.pdf
export const debruijnLUT = [
    0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8,
    31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9
],
    getNumbrOfTrailingZeroBitsFromPowerOf2 = (value) => debruijnLUT[(value * 0x077CB531) >>> 27],

    SPACE = 32,
    extended_jump_table = jump_table.slice();

extended_jump_table[45] |= 2 << 8;
extended_jump_table[95] |= 2 << 8;


export class Lexer implements LexerType {

    line: number;
    column: number;
    type: TokenType;
    off: number;
    tl: number;
    sl: number;
    source: string;
    masked_values: number;
    str: string;
    p: Lexer;
    symbol_map: SymbolMap;
    id_lu: Uint16Array;
    addCharacter: any;
    tk: number;

    static types: typeof TokenType;
    /**
     * 
     * @param string 
     * @param INCLUDE_WHITE_SPACE_TOKENS 
     * @param PEEKING 
     */
    constructor(string: string = "", INCLUDE_WHITE_SPACE_TOKENS: boolean = false, PEEKING: boolean = false) {

        if (typeof (string) !== "string") throw new Error(`String value must be passed to Lexer. A ${typeof (string)} was passed as the 'string' argument.`);

        Object.defineProperties(this, {
            symbol_map: { // Really Don't need to see this when logging
                writable: true,
                value: null
            },
            // Reference to the peeking Lexer.
            p: {
                writable: true,
                value: null
            },
            /**
             * Stores values accessed through binary operations
             */
            masked_values: {
                writable: true,
                value: 0
            },
            //  The length of the string being parsed. Can be adjusted to virtually shorten the screen. 
            sl: {
                writable: true,
                enumerable: true,
                value: string.length
            },
            //  The string that the Lexer will tokenize.
            str: {
                writable: false,
                value: string
            }
        });


        this.type = 262144; //Default "non-value" for types is 1<<18;
        this.tl = 0;

        this.off = 0;
        this.column = 0;
        this.line = 0;

        this.source = "";

        /**
         * Flag to ignore white spaced.
         */
        this.IWS = !INCLUDE_WHITE_SPACE_TOKENS;

        this.USE_EXTENDED_ID = false;

        /**
         * Flag to force the lexer to parse string contents 
         * instead of producing a token that is a substring matched
         * by /["''].*["'']/
         */
        this.PARSE_STRING = false;

        if (!PEEKING) this.next();
    }


    /**
     * Restore the Lexer back to it's initial state.
     * @public
     */
    reset(): Lexer {
        this.resetHead();
        this.next();
        return this;
    }

    resetHead(): void {
        this.off = 0;
        this.tl = 0;
        this.column = 0;
        this.line = 0;
        this.p = null;
        this.type = 32768;
    };

    /**
     * Copies the data to a new Lexer object.
     * @return {Lexer}  Returns a new Lexer instance with the same property values.
     */
    copy(destination: Lexer = new Lexer(this.str, false, true)): Lexer {

        destination.off = this.off;
        destination.column = this.column;
        destination.line = this.line;
        destination.tl = this.tl;
        destination.sl = this.sl;
        destination.type = this.type;
        destination.symbol_map = this.symbol_map;
        destination.masked_values = this.masked_values;
        destination.source = this.source;

        return destination;
    }

    /**
     * Given another Lexer with the same `str` property value, copies the state of that Lexer.
     * @param      {Lexer}  [marker=this.peek]  The Lexer to clone the state from. 
     * @throws     {Error} Throws an error if the Lexers reference different strings.
     * @public
     */
    sync(marker: Lexer = this.p): Lexer {

        if (marker instanceof Lexer) {
            if (marker.str !== this.str)
                throw new Error("Cannot sync Lexers that tokenize different strings!");
            marker.copy(this);
        }

        return this;
    }

    /**
     * Returns the Lexer bound to Lexer.prototype.p, or creates and binds a new Lexer to Lexer.prototype.p. 
     * Advances the other Lexer to the token ahead of the calling Lexer.
     * @public
     * @type {Lexer}
     * @param {Lexer} [marker=this] - The marker to originate the peek from. 
     * @param {Lexer} [peeking_marker=this.p] - The Lexer to set to the next token state.
     * @return {Lexer} - The Lexer that contains the peeked at token.
     */
    peek(marker: Lexer = this, peeking_marker: Lexer = marker.p): Lexer {


        if (!peeking_marker) {
            if (!marker) return null;
            if (!marker.p) {
                marker.p = new Lexer(marker.str, false, true);
                peeking_marker = marker.p;
            }
        }

        marker.copy(peeking_marker);

        marker.next(peeking_marker);

        return peeking_marker;
    }
    /*
    peek(marker: Lexer = this, peeking_marker: Lexer = marker.p): Lexer {

        if (!marker) return null;

        marker.p = marker.copy(peeking_marker || new Lexer(this.str, false, true));

        marker.p.next();

        return marker.p;
    } 
    */

    /**
     * Sets the internal state to point to the next token. Sets Lexer.prototype.END to `true` if the end of the string is hit.
     * @public
     * @param {Lexer} [marker=this] - If another Lexer is passed into this method, it will advance the token state of that Lexer.
     */
    next(marker: Lexer = this, USE_CUSTOM_SYMBOLS = !!this.symbol_map): Lexer {

        if (marker.sl < 1) {
            marker.off = 0;
            marker.type = 32768;
            marker.tl = 0;
            marker.line = 0;
            marker.column = 0;
            return marker;
        }

        //Token builder
        const l = marker.sl,
            str = marker.str,
            jump_table = this.id_lu,
            IWS = marker.IWS;

        let length = marker.tl,
            off = marker.off + length,
            type = TokenType.symbol,
            line = marker.line,
            base = off,
            char = marker.column,
            root = marker.off;

        if (off >= l) {
            length = 0;
            base = l;
            //char -= base - off;
            marker.column = char + (base - marker.off);
            marker.type = type;
            marker.off = base;
            marker.tl = 0;
            marker.line = line;
            return marker;
        }

        let NORMAL_PARSE = true;

        if (USE_CUSTOM_SYMBOLS) {

            let code = str.charCodeAt(off);
            let off2 = off;
            let map = this.symbol_map,
                m;

            while (code == 32 && IWS)
                (code = str.charCodeAt(++off2), off++);

            while ((m = map.get(code))) {
                map = m;
                off2 += 1;
                code = str.charCodeAt(off2);

            }

            if (map.IS_SYM) {
                NORMAL_PARSE = false;
                base = off;
                length = off2 - off;
            }
        }

        while (NORMAL_PARSE) {

            base = off;

            length = 1;

            const code = str.codePointAt(off);

            switch (jump_table[code] & 255) {
                case 0: //SYMBOL
                    type = TokenType.symbol;
                    break;
                case 1: //IDENTIFIER
                    while (1) {

                        while (++off < l && (((id | num) & (jump_table[str.codePointAt(off)] >> 8))));

                        if (this.USE_EXTENDED_ID) {
                            if ("-_".includes(str[off]) && ((id | num) & (jump_table[str.codePointAt(off + 1)] >> 8)))
                                continue;
                        }

                        type = TokenType.identifier;

                        length = off - base;

                        break;
                    } break;
                case 2: //QUOTED STRING
                    if (this.PARSE_STRING) {
                        type = TokenType.symbol;
                    } else {
                        while (++off < l && str.codePointAt(off) !== code);
                        type = TokenType.string;
                        length = off - base + 1;
                    }
                    break;
                case 3: //SPACE SET
                    ++off;
                    //while (++off < l && str.codePointAt(off) === SPACE);
                    type = TokenType.white_space;
                    length = off - base;
                    break;
                case 4: //TAB SET
                    ++off;
                    type = TokenType.tab;
                    length = off - base;
                    break;
                case 5: //CARRIAGE RETURN
                    length = 2;
                //intentional
                case 6: //LINEFEED
                    type = TokenType.new_line;
                    line++;
                    base = off;
                    root = off;
                    off += length;
                    char = 0;
                    break;
                case 7: //NUMBER
                    type = TokenType.number;
                    //Check for binary, hexadecimal, and octal representation
                    if (code == 48) { // 0 - ZERO
                        off++;

                        if (("oxbOXB").includes(str[off])) {
                            const lups = {
                                b: { lu: bin, ty: TokenType.number_bin },
                                o: { lu: oct, ty: TokenType.number_oct },
                                x: { lu: hex, ty: TokenType.number_hex }
                            };
                            const { lu, ty } = lups[str[off].toLowerCase()];

                            //Code of first char after the letter should
                            // be within the range of the respective lu type : hex, oct, or bin

                            if ((lu & (jump_table[str.codePointAt(off + 1)] >> 8))) {
                                while (++off < l && (lu & (jump_table[str.codePointAt(off)] >> 8)));
                                type = ty;

                                if (!this.USE_EXTENDED_NUMBER_TYPES)
                                    type = TokenType.number;

                                length = off - base;

                                break;
                            }
                        }

                        //The number is just 0. Do not allow 0221, 00007, etc. 
                        //But need to allow 0.1, 0.12 etc
                        //and also detect .12354

                    } else {
                        while (++off < l && (num & (jump_table[str.codePointAt(off)] >> 8)));
                    }

                    //type = number_int;

                    if (str[off] == ".") {
                        while (++off < l && (num & (jump_table[str.codePointAt(off)] >> 8)));
                        //float
                        type = TokenType.number_flt;
                    }

                    if (("Ee").includes(str[off])) {
                        const ori_off = off;
                        //Add e to the number string
                        off++;
                        if (("-+").includes(str[off])) off++;

                        if (!(num & (jump_table[str.codePointAt(off)] >> 8))) {
                            off = ori_off;
                        } else {
                            while (++off < l && (num & (jump_table[str.codePointAt(off)] >> 8)));
                            type = TokenType.number_sci;
                        }
                        //scientific 
                    }


                    if (!this.USE_EXTENDED_NUMBER_TYPES)
                        type = TokenType.number;

                    length = off - base;

                    type = TokenType.number;

                    break;
                case 8: //OPERATOR
                    type = TokenType.operator;
                    break;
                case 9: //OPEN BRACKET
                    type = TokenType.open_bracket;
                    break;
                case 10: //CLOSE BRACKET
                    type = TokenType.close_bracket;
                    break;
            }

            if (IWS && (type & TokenType.white_space_new_line)) {
                if (off < l) {
                    type = TokenType.symbol;
                    //off += length;
                    continue;
                } else {
                    //Trim white space from end of string
                    base = l - off;
                    marker.sl -= off;
                    length = 0;
                }
            }
            break;
        }

        marker.type = type;
        marker.off = base;
        marker.tl = (this.masked_values & Masks.CHARACTERS_ONLY_MASK) ? Math.min(1, length) : length;
        marker.column = char + base - root;
        marker.line = line;

        return marker;
    }

    /**
     * Restricts max parse distance to the other Lexer's current position.
     * @param      {Lexer}  Lexer   The Lexer to limit parse distance by.
     */
    fence(marker = this): Lexer {
        if (marker.str !== this.str)
            return;
        this.sl = marker.off;
        return this;
    }

    /**
        Looks for the string within the text and returns a new lexer at the location of the first occurrence of the token or 
    */
    find(string: string): Lexer {

        const cp = this.pk,
            match = new Lexer(string);

        match.resetHead();

        cp.tl = 0;
        const char_cache = cp.CHARACTERS_ONLY;
        match.CHARACTERS_ONLY = true;
        cp.CHARACTERS_ONLY = true;

        while (!cp.END) {

            const
                mpk = match.pk,
                cpk = cp.pk;

            while (!mpk.END && !cpk.END && cpk.tx == mpk.tx) {
                cpk.next();
                mpk.next();
            }

            if (mpk.END) {
                cp.CHARACTERS_ONLY = char_cache;
                return cp.next();
            }

            cp.next();
        }

        return cp;
    }
    /**
     * Return a lexer at the indicated line and offset, or stop at the end of the 
     * string, whichever comes first.
     * @param line - Line number, 1 indexed
     * @param column - Column number, 1 indexed
     */

    seek(line: number, column: number): Lexer {
        const lex = this.copy();
        lex.CHARACTERS_ONLY = true;
        line = Math.max(0, line - 1);
        column = Math.max(1, column);
        while (!lex.END && lex.line != line) { lex.next(); }
        while (!lex.END && lex.char < column) { lex.next(); };
        lex.CHARACTERS_ONLY = this.CHARACTERS_ONLY;
        return lex;
    }

    createWindSyntaxError(message: string) {
        return new WindSyntaxError(message, this);
    }

    /**
     * Creates an error message with a diagram illustrating the location of the error. 
     */
    errorMessage(message: string = ""): string {
        return this.createWindSyntaxError(message).message;
    }

    errorMessageWithIWS(...v: string[]): string {
        return this.errorMessage(...v) + "\n" + (!this.IWS) ? "\n The Lexer produced whitespace tokens" : "";
    }

    blame() { return blame(this); }

    /**
     * Will throw a new Error, appending the parsed string line and position information to the the error message passed into the function.
     * @instance
     * @public
     * @param {String} message - The error message.
     */
    throw(message: string): never {
        throw new Error(this.errorMessage(message));;
    };

    /**
     * Proxy for Lexer.prototype.reset
     * @public
     */
    r() { return this.reset(); }


    /**
     * Proxy for Lexer.prototype.assert
     * @public
     */
    a(text: string) {
        return this.assert(text);
    }

    /**
     * Compares the string value of the current token to the value passed in. Advances to next token if the two are equal.
     * @public
     * @throws {Error} - `Expecting "${text}" got "${this.text}"`
     * @param {String} text - The string to compare.
     */
    assert(text: string): Lexer {

        if (this.off < 0 || this.END) this.throw(`Expecting [${text}] but encountered end of string.`);

        if (this.text == text)
            this.next();
        else
            this.throw(`Expecting [${text}] but encountered [${this.text}]`);

        return this;
    }

    /**
     * Proxy for Lexer.prototype.assertCharacter
     * @public
     */
    aC(char: string) { return this.assertCharacter(char); }
    /**
     * Compares the character value of the current token to the value passed in. Advances to next token if the two are equal.
     * @public
     * @throws {Error} - `Expecting "${text}" got "${this.text}"`
     * @param {String} text - The string to compare.
     */
    assertCharacter(char: string): Lexer {

        if (this.off < 0 || this.END) this.throw(`Expecting [${char[0]}] but encountered end of string.`);

        if (this.ch == char[0])
            this.next();
        else
            this.throw(`Expecting [${char[0]}] but encountered [${this.ch}]`);

        return this;
    }


    /**
     * Proxy for Lexer.prototype.slice
     * @public
     */
    s(start: number | Lexer) { return this.slice(start); }

    /**
     * Returns a slice of the parsed string beginning at `start` and ending at the current token.
     * @param {Number | LexerBeta} start - The offset in this.str to begin the slice. If this value is a LexerBeta, sets the start point to the value of start.off.
     * @return {String} A substring of the parsed string.
     * @public
     */
    slice(start: number | Lexer = this.off): string {

        if (start instanceof Lexer) start = start.off;

        return this.str.slice(start, (this.off <= start) ? this.sl : this.off);
    }

    /**
     * Replaces the string the Lexer is tokenizing. 
     * @param string - New string to replace the existing one with.
     * @param RESET - Flag that if set true will reset the Lexers position to the start of the string
     */
    setString(string: string, RESET = true): void {
        this.str = string;
        this.sl = string.length;
        if (RESET) this.resetHead();
    };

    toString() {
        return this.slice();
    }

    /**
     * Returns new Whind Lexer that has leading and trailing whitespace characters removed from input. 
     * @param leave_leading_amount - Maximum amount of leading space caracters to leave behind. Default is zero
     * @param leave_trailing_amount - Maximum amount of trailing space caracters to leave behind. Default is zero
     */
    trim(leave_leading_amount: number = 0, leave_trailing_amount: number = leave_leading_amount) {
        const lex = this.copy();

        let space_count = 0,
            off = lex.off;

        for (; lex.off < lex.sl; lex.off++) {
            const c = jump_table[lex.string.charCodeAt(lex.off)];

            if (c > 2 && c < 7) {

                if (space_count >= leave_leading_amount) {
                    off++;
                } else {
                    space_count++;
                }
                continue;
            }

            break;
        }

        lex.off = off;
        space_count = 0;
        off = lex.sl;

        for (; lex.sl > lex.off; lex.sl--) {
            const c = jump_table[lex.string.charCodeAt(lex.sl - 1)];

            if (c > 2 && c < 7) {
                if (space_count >= leave_trailing_amount) {
                    off--;
                } else {
                    space_count++;
                }
                continue;
            }

            break;
        }

        lex.sl = off;

        if (leave_leading_amount > 0)
            lex.IWS = false;

        lex.tl = 0;

        lex.next();

        return lex;
    }

    /**
     * Alias for lexer.column
     */
    get char() {
        return this.column;
    }

    /** 
     * Adds symbol to symbol_map. This allows custom symbols to be defined and tokenized by parser. 
    */
    addSymbol(sym: string): void {

        if (!this.symbol_map)
            this.symbol_map = <SymbolMap>new Map;

        let map = this.symbol_map;

        for (let i = 0; i < sym.length; i++) {
            let code: number = sym.charCodeAt(i);
            let m = map.get(code);
            if (!m) {
                m = map.set(code, <SymbolMap>new Map).get(code);
            }
            map = <SymbolMap>m;
        }

        map.IS_SYM = true;

    }

    addSymbols(...syms: string[]): void {
        for (const sym of syms) this.addSymbol(sym);
    }
    /**[API] 
     * Seeks the end of the input string. Returns marker set to this position.
    */
    getEnd() {
        const copy = this.copy();
        while (!copy.END) copy.next();
        return copy;
    }

    /** Getters and Setters ***/
    get string() {
        return this.str;
    }

    get string_length() {
        return this.sl - this.off;
    }

    set string_length(s) { }

    /**
     * The current token in the form of a new Lexer with the current state.
     * Proxy property for Lexer.prototype.copy
     * @type {Lexer}
     * @public
     * @readonly
     */
    get token(): Lexer {
        return this.copy();
    }


    get ch(): string {
        return this.str[this.off];
    }

    /**
     * Proxy for Lexer.prototype.text
     * @public
     * @type {String}
     * @readonly
     */
    get tx(): string { return this.text; }

    /**
     * The string value of the current token.
     * @type {string}
     * @public
     * @readonly
     */
    get text(): string {
        return (this.off < 0) ? "" : this.str.slice(this.off, this.off + this.tl);
    }

    /**
     * The type id of the current token.
     * @type {TokenType}
     * @public
     * @readonly
     */
    get ty(): TokenType { return this.type; };

    /**
     * The current token's offset position from the start of the string.
     * @type {Number}
     * @public
     * @readonly
     */
    get pos() {
        return this.off;
    }

    /**
     * Proxy for Lexer.prototype.peek
     * @public
     * @readonly
     * @type {Lexer}
     */
    get pk() { return this.peek(); }

    /**
     * Proxy for Lexer.prototype.next
     * @public
     */
    get n() { return this.next(); }

    /**
     * Boolean value set to true if position of Lexer is at the end of the string.
     */
    get END() { return this.off >= this.sl; }

    set END(v) { }

    get IGNORE_WHITE_SPACE(): boolean {
        return this.IWS;
    }

    set IGNORE_WHITE_SPACE(bool) {
        this.IWS = !!bool;
    }

    get CHARACTERS_ONLY(): boolean {
        return !!(this.masked_values & Masks.CHARACTERS_ONLY_MASK);
    }

    set CHARACTERS_ONLY(boolean) {
        this.masked_values = (this.masked_values & ~Masks.CHARACTERS_ONLY_MASK) | ((+boolean | 0) << 6);
    }

    get IWS(): boolean {
        return !!(this.masked_values & Masks.IGNORE_WHITESPACE_MASK);
    }

    set IWS(boolean) {
        this.masked_values = (this.masked_values & ~Masks.IGNORE_WHITESPACE_MASK) | ((+boolean | 0) << 5);
    }

    get PARSE_STRING(): boolean {
        return !!(this.masked_values & Masks.PARSE_STRING_MASK);
    }

    set PARSE_STRING(boolean) {
        this.masked_values = (this.masked_values & ~Masks.PARSE_STRING_MASK) | ((+boolean | 0) << 4);
    }

    get USE_EXTENDED_ID(): boolean {
        return !!(this.masked_values & Masks.USE_EXTENDED_ID_MASK);
    }

    set USE_EXTENDED_ID(boolean) {
        this.masked_values = (this.masked_values & ~Masks.USE_EXTENDED_ID_MASK) | ((+boolean | 0) << 7);
    }

    get USE_EXTENDED_NUMBER_TYPES(): boolean {
        return !!(this.masked_values & Masks.USE_EXTENDED_NUMBER_TYPES_MASK);
    }

    set USE_EXTENDED_NUMBER_TYPES(boolean: boolean) {
        this.masked_values = (this.masked_values & ~Masks.USE_EXTENDED_NUMBER_TYPES_MASK) | ((+boolean | 0) << 2);
    }

    /**
     * Reference to token id types.
     */
    get types(): typeof TokenType {
        return TokenType;
    }

    setSource(source: string) {
        this.source = source;
        return this;
    }
}

Lexer.prototype.id_lu = jump_table;
Lexer.prototype.addCharacter = Lexer.prototype.addSymbol;

function wind(string: string, INCLUDE_WHITE_SPACE_TOKENS = false): Lexer { return new Lexer(string, INCLUDE_WHITE_SPACE_TOKENS); }

wind.constructor = Lexer;

Lexer.types = TokenType;

wind.types = TokenType;

import { LexerType, TokenType, SymbolMap, Masks } from "./types.js";

export {
    TokenType,
    LexerType,
    jump_table,
    uni_id_cont_discrete,
    uni_id_cont_ranges,
    uni_id_start_discrete,
    uni_id_start_ranges,
    aii,
    air
};

export default wind;
