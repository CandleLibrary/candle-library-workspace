import * as css from "../build/css.js";
import spark from "@candlelib/spark";

//Allow time for the WASM CSS parser to load
await spark.sleep(10);
function checkF(f) {
    if (typeof (f) == "string")
        return checkText(f);
    else
        if (Array.isArray(f))
            return checkArray(...f);
        else
            if (typeof (f) == "object" && f.unit)
                return checkLength(f);
            else
                if (!isNaN(f))
                    return checkNumber(f);
    return f;
}

export function checkURL(url) {
    const URL = new css.CSS_URL(url);
    return function (prop) {
        harness.shouldHaveProperty(URL, "host");
        harness.shouldEqual(prop.host, URL.host);
        harness.shouldHaveProperty(URL, "port");
        harness.shouldEqual(prop.port, URL.port);
    };
}

export function checkColor(r = 0, g = 0, b = 0, a = 1) {
    return function (prop) {
        harness.shouldHaveProperty(prop, "r", "g", "b", "a");
    };
}

export function checkNumber(val) {
    return function (prop) {
        harness.shouldEqual(prop, val);
    };
}

export function checkLength(val, type) {
    return function (prop) {
        if (typeof (val) == "object" && val.unit) {
            type = val.unit;
        }
        harness.shouldEqual(prop, parseFloat(val));
        harness.shouldNotEqual(typeof prop.unit, "undefined");
        harness.shouldEqual(prop.unit, type);
    };
}

export function checkPercentage(val) {
    return function (prop) {
        harness.shouldEqual(prop, val);
        harness.shouldEqual(prop.toString(), val + "%");
    };
}

export function checkText(val) {
    return function (prop) {
        if (!harness.shouldEqual(prop, val)) {
            throw new Error(`Expected ${prop} to equal ${val}`);
        }
    };
}

export function checkArray(...rest) {
    return function (prop) {
        if (!prop)
            throw new Error("Property note created");

        const array = prop;

        harness.shouldEqual(Array.isArray(array) ? array.length : 1, rest.length);

        for (let i = 0; i < rest.length; i++) {
            let func = rest[i];

            func = checkF(func);


            let prop = (Array.isArray(array)) ? array[i] : array;

            func(prop);
        }
    };
}

export function textSpread(name, ...rest) {
    const ONLY = test.ONLY;

    let prop_name = name.replace(/\-/g, "_");

    for (let i = 0; i < rest.length; i++) {
        let text = rest[i];
        test.value(`${name}:${text}`);
        test.ONLY = ONLY;
        test.check(checkText(text));
    }

    test.ONLY = false;
}
let itOnly = null;
export const test = {
    v: "",
    prop_name: "",
    ONLY: false,
    only: function () {
        if (!itOnly)
            itOnly = it.only.bind(it);
        test.ONLY = true;
    },
    value(v) {
        test.ONLY = false;
        test.v = v;
        test.prop_name = v.split(":").shift().replace(/\-/g, "_");
        return test;
    },
    prop() {
        if (!test.v)
            throw new Error("Please provide css.CSS property value before defining a check function.");
        return css.rule(`a{${test.v}}`).props;
    },
    check(f) {


        if (!test.v)
            throw new Error("Please provide css.CSS property value before defining a check function.");

        const v = test.v;
        const prop_name = test.prop_name;

        f = checkF(f);

        let sheet = css.rule(`a{${v}}`);

        const test_prop = sheet.props.get(prop_name);

        harness.shouldNotEqual(typeof test_prop, "undefined");
        harness.shouldNotEqual(typeof test_prop, null, true);

        f(test_prop.value);

        test.prop_name = "";
        test.v = "";
        return test;
    }
};

export function px(n) {
    return checkLength(new css.CSS_Length(n, "px"));
}

export function mm(n) {
    return checkLength(new css.CSS_Length(n, "mm"));
}
export function cm(n) {
    return checkLength(new css.CSS_Length(n, "cm"));
}
export function inch(n) {
    return checkLength(new css.CSS_Length(n, "in"));
}
export function pc(n) {
    return checkLength(new css.CSS_Length(n, "pc"));
}
export function pt(n) {
    return checkLength(new css.CSS_Length(n, "pt"));
}
export function ch(n) {
    return checkLength(new css.CSS_Length(n, "ch"));
}
export function em(n) {
    return checkLength(new css.CSS_Length(n, "em"));
}
export function ex(n) {
    return checkLength(new css.CSS_Length(n, "ex"));
}
export function rem(n) {
    return checkLength(new css.CSS_Length(n, "rem"));
}
export function vh(n) {
    return checkLength(new css.CSS_Length(n, "vh"));
}
export function vw(n) {
    return checkLength(new css.CSS_Length(n, "vw"));
}
export function vmin(n) {
    return checkLength(new css.CSS_Length(n, "vmin"));
}
export function vmax(n) {
    return checkLength(new css.CSS_Length(n, "vmax"));
}
export function deg(n) {
    return checkLength(new css.CSS_Length(n, "deg"));
}

export const inherit = ["inherit", "unset", "revert"];
