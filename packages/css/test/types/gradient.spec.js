
import { CSS_Gradient } from "../../build/gradient.js";
import { test } from "../test_tools.js";

const gradient = CSS_Gradient.parse("linear-gradient(red 20%, blue)");

assert_group("test", sequence, () => {

    test.value("background: linear-gradient(red 20%, blue) top, top;");

    assert(test.prop().get("background") + "" == "background:linear-gradient( #ff0000 20%, #0000ff ) top , top");

});