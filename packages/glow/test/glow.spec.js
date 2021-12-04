import glow from "../build/glow.js";

assert_group("Basic single object sequence.", sequence, () => {
    const obj = { test: 2 };

    const anim = await glow({
        obj,
        test: [{ val: 0, tic: 0 }, { val: 0.05, tic: 200 }, { val: 20, tic: 400 }, { val: 50, tic: 800 }]
    });

    await anim.asyncPlay();

    assert(obj.test == 50);

    anim.step(0.50);

    assert(obj.test == 20);
});