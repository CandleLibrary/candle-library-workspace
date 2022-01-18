import { FunctionMaps } from "./build/parser_next/ast.js";
import { Bytecode, Entrypoint, TokenLookup, ExpectedTokenLookup, ReduceNames } from "./build/parser_next/parser_data.js";
import { ByteWriter, complete, Token, assign_peek, scanner_state_mask, state_index_mask } from "@hctoolkit/runtime";

const input = `#test.test[gracy=tacos] { 
    background-color: red;
 }`;
assign_peek((f, iter) => {
    const index = f & state_index_mask;
    if (f & scanner_state_mask)
        return;
    let expected = "";
    let token = "";
    const off = iter.tokens[1].byte_offset;
    const len = iter.tokens[1].byte_length;
    const offb = iter.tokens[0].byte_offset;
    const lenb = off - offb;
    if (ExpectedTokenLookup.has(index)) {
        expected = ExpectedTokenLookup.get(index)?.map(v => TokenLookup.get(v)).join(" ");
    }
    if (iter.reader.offset_at_end(off)) {
        token = "<EOF>";
    }
    else if (f & scanner_state_mask) {
        token = String.fromCodePoint(iter.reader.byte() ?? 26);
    }
    else {
        token = TokenLookup.get(iter.tokens[1].type || 0) ?? "";
    }
    const slice = input.slice(off - 5, off) + "|>" + input.slice(off, off + len) + "<|" + input.slice(off + len);
    const sliceB = input.slice(offb - 5, offb) + "|>" + input.slice(offb, offb + lenb) + "<|" + input.slice(offb + lenb);
    console.log(`\n state ${((f & 0xFFFF) * 4).toString(16)} - [${token}] tokpos:${off} bufpos:${iter.reader.cursor} \n \n${sliceB}\n${slice} \n expected: [ ${expected} ]`);
});
const { result, err, ...rest } = complete(input, Entrypoint.css, Bytecode, FunctionMaps, ReduceNames);
if (err) {
    const index = err.last_state & state_index_mask;
    let expected = "";
    let token = new Token(input, err.tk_length || 1, err.tk_offset, 0);
    if (ExpectedTokenLookup.has(index)) {
        expected = ExpectedTokenLookup.get(index)?.map(v => TokenLookup.get(v)).join(" | ");
    }
    console.log({
        err,
        expected,
        index: (index * 4).toString(16),
    });

    if (token == " ")
        token.throw(`Expected [ ${expected} ] but found a space.`);
    if (err.tk_offset >= input.length)
        token.throw(`Expected [ ${expected} ] but encountered the end of the input.`);

    token.throw(`Expected [ ${expected} ] but found [ ${token} ]`);
}
console.dir({ result: result }, { depth: null });
class FileWriter extends ByteWriter {
    constructor(handle) {
        super();
        this.handle = handle;
    }
    purge() {
        this.handle.write(new Uint8Array(this.get_chunk()));
        this.cursor = 0;
    }
}
/*
const handle = await open("./test.bin", "w+");

const writer = new FileWriter(handle);

console.log({ d: Serialize(result, writer) });

writer.purge();

await handle.close();

const handle2 = await open("./test.bin", "r");

const reader = new SerialReader((await handle2.read()).buffer.buffer);

handle2.close();

console.dir({ in: Deserialize(reader), out: result }, { depth: null });


 */
//# sourceMappingURL=index.js.map