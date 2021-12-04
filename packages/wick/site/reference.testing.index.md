# Testing In Wick

The `@test` test synthetic import allows unit tests to be defined within the component file.
Test syntax and runtime are defined in the `@candlelib/cure` test system. 

Through `@candlelib/cure`, Wick components can be instrumented with tests that can be run
with the `candle.wick test` CLI command. The tests a run within a browser process to replicate
as closely as possible the conditions in which a component will be used. 

## Example

```jsx 

/**
 * This Component demonstrates the ability to limit the number of entries that
 * appear by utilizing the container tag's `limit` attribute. 
 */

let data = [{v:1},{v:2},{v:3},{v:4}];

let v = 1;

export default <div>

    <input type=number value={v} />

    <container {data} limit=1>
        <span>span value: {model.v}</span>
    </container>

    <container {data} limit={v}>
        <a>anchor value: {model.v}</a>
    </container>

</div>;

import test from "@test";

test: {


    const spans = document.querySelectorAll("span");

    assert("With limit set to 1, only 1 span should be present [STATIC]", spans.length == 1 );

    let a_s = document.querySelectorAll("a");

    assert("With limit set to 2, only 2 anchors should be present [DYNAMIC]", a_s.length == 1 );
    
    keep: v = 3;
    
    await spark.sleep(5)

    const a_d = document.querySelectorAll("a");

    assert("After change, limit should now be 3 with three anchors [DYNAMIC]", a_d.length == 3 );
}

```
# TODO