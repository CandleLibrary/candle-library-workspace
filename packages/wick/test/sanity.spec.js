import wick from "../build/library/entry/wick-full.js";

assert_group("Compiles trivial input (HTML syntax)", sequence, () => {
    const input = `<div> hello world </div>`;

    const comp = await wick(input);

    assert("[<div> hello world </div>]", comp != null);
});

assert_group("Compiles trivial input (JSX syntax)", sequence, () => {
    const input = `export default <div> hello world </div>`;

    const comp = await wick(input);

    assert("[export default <div> hello world </div>]", comp != null);
});