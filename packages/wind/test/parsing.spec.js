import wind from "@candlelib/wind";


const test_string = `
        Here in lies all that matters: a nuൗmber, 101, a symbol, #, a string,
        "some day", the brackets, [{<()>}], and the rest, +=!@.

    `;


let types = wind.types;
let lex = wind(test_string);

"test name";
assert(lex.tx == "Here");

lex.n.n.n.n;

assert(lex.tx == "that");

lex.n.n;

assert(lex.ch == ":");

let lex_copy = lex.copy();
lex_copy.off += 1;
lex.n.n.n.n;

assert(lex.ty == types.number);

lex.n;

assert(lex.slice(lex_copy) == " a nuൗmber, 101");

lex.n.n.n.n;

assert(lex.ty == types.symbol);

lex.n.n.n.n.n;

assert(lex.ty == types.string);

lex.n.n.n.n.n;

assert(lex.ty == types.open_bracket);

assert(lex.ch == "[");

lex.n;

assert(lex.ty == types.open_bracket);

assert(lex.ch == "{");

lex.n;

assert(lex.ty == types.operator);

assert(lex.ch == "<");

lex.n;

assert(lex.ty == types.open_bracket);

assert(lex.ch == "(");

lex.n;

assert(lex.ty == types.close_bracket);

lex.n;

assert(lex.ty == types.operator);

lex.n;

assert(lex.ty == types.close_bracket);

lex.n;

assert(lex.ty == types.close_bracket);

lex.n;

assert(lex.ty == types.symbol);

let start = lex.pos + 1;

lex.n.n.n.n;

assert(lex.ch == ",");

lex.n;

assert(lex.slice(start) == " and the rest, ");

assert(lex.ty == types.operator);

lex.n;

assert(lex.ty == types.operator);

lex.n;

assert(lex.ty == types.operator);

lex.n;

assert(lex.ty == types.symbol);

lex.n;

assert(lex.ty == types.symbol);
lex.n;

assert(lex.END == true);
