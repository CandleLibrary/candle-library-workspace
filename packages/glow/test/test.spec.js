import glow from "../build/glow.js";
import spark from "@candlelib/spark";

global.HTMLElement = function () { };

assert_group("Animates numeric properties of JS objects", sequence, () => {

    let obj = { prop: 0 };

    let animation = glow({ obj: obj, prop: [{ val: 1000, tic: 200, eas: glow.linear }] });

    animation.play();

    const t = spark.frame_time;

    await spark.sleep(100);

    assert(Math.floor(obj.prop) > 400);

    assert(Math.floor(obj.prop) < 650);

    await spark.sleep(200);

    assert(Math.floor(obj.prop) >= 900);

});
assert_group("Animates non-numeric properties of JS objects using stepped interpolation", () => {
    let obj = { prop: "Thom" };
    let animation = glow({ obj, prop: [{ val: "Jake", tic: 50 }, { val: "Thumb", tic: 150 }, { val: obj, tic: 250 }] });

    animation.play();

    await spark.sleep(60);

    assert(obj.prop == "Jake");

    await spark.sleep(160);

    assert(obj.prop == "Thumb");

    await spark.sleep(300);

    assert(obj.prop == obj);
});