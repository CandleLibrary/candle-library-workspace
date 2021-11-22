import wind from "@candlelib/wind";
"Wind Test Suite";

const test_string2 = `
        Here in lies all that matters: a nuൗmber, 101, a symbol, #, a string,
            "some day", the brackets, [{<()>}], and the rest, +=!@.
        This is a another line that contains far less then it should.
    `;

"Is able to find the start of a matched substring";

assert(wind(test_string2).seek(3, 38).ch == '[');
