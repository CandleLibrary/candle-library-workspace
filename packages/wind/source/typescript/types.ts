export type SymbolMap = Map<number, number | SymbolMap> & { IS_SYM: boolean; };

export enum TokenType {
    number = 1,
    num = number,
    identifier = 2,
    string = 4,
    white_space = 8,
    open_bracket = 16,
    close_bracket = 32,
    operator = 64,
    symbol = 128,
    new_line = 256,
    tab = 512,
    number_bin = number | 1024,
    number_oct = number | 2048,
    number_hex = number | 4096,
    number_int = number | 8192,
    number_sci = number | 16384,
    number_flt = number | 32768,
    alpha_numeric = (identifier | number),
    white_space_new_line = (white_space | new_line | tab),
    id = identifier,
    str = string,
    ws = white_space,
    ob = open_bracket,
    cb = close_bracket,
    op = operator,
    sym = symbol,
    nl = new_line,
    tb = tab,
    int = number_int,
    integer = number_int,
    bin = number_bin,
    binary = number_bin,
    oct = number_oct,
    octal = number_oct,
    hex = number_hex,
    hexadecimal = number_hex,
    flt = number_flt,
    float = number_flt,
    sci = number_sci,
    scientific = number_sci,
}

export const enum Masks {
    TYPE_MASK = 0xF,
    PARSE_STRING_MASK = 0x10,
    USE_EXTENDED_NUMBER_TYPES_MASK = 0x4,
    IGNORE_WHITESPACE_MASK = 0x20,
    CHARACTERS_ONLY_MASK = 0x40,
    USE_EXTENDED_ID_MASK = 0x80,
    TOKEN_LENGTH_MASK = 0xFFFFFF00,
}


export interface LexerType {
    char: number,
    /**
    * Line location of the current token
    */
    line: number;
    /**
     * Column location of the current token
     */
    column: number;
    /**
     * The
     */
    tk: number;

    /**
     * The type id of the current token.
     */
    type: TokenType;
    /**
     * The offset in the string of the start of the current token.
     */
    off: number;

    /**
    * The length of the current token.
    */
    tl: number;
    sl: number;

    /**
     * Location for the source of the string.
     */
    source: string;

    masked_values: number;

    str: string;

    symbol_map: SymbolMap;

    //Exists on prototype
    id_lu: Uint16Array;
    addCharacter: any;

    copy: () => LexerType;
}
