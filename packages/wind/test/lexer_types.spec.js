import wind from "@candlelib/wind";

"Identifies Wind Lexer Types";

const a = wind("0o123456");
const b = wind("0x123456");

a.USE_EXTENDED_NUMBER_TYPES = true;
b.USE_EXTENDED_NUMBER_TYPES = true;

a.reset();
b.reset();

assert("Lexer type - octal", a.ty == wind.types.oct);
assert("Lexer type - hex", b.ty == wind.types.hex);
