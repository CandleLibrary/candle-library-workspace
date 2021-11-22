import { Lexer } from "@candlelib/wind";

export interface Comment extends Lexer {
    node?: Node;
}