import { Lexer } from "@candlelib/wind";
/**
 * Consume comma and return lex positioned a following token
 * if lex is not at a comma then return lex as is.
 * @param lex
 */
export function consumeComma(lex: Lexer): Lexer {
    if (lex.tx == ",")
        lex.next();
    return lex;
}
