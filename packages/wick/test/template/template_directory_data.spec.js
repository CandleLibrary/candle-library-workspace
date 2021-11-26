import { assert } from "console";
import { componentDataToCompiledHTML } from "../../build/compiler/ast-build/html.js";
import { Context } from "../../build/compiler/common/context.js";
import wick from "../../build/entry/wick-server.js";

/**
 * When a component is instantiated with the `@template` synthetic import,
 * the initialized instance data of the template can be accessed in other components
 * as an array of objects. This array can be used to generate indexes of the
 * the template outputs for use in listing blog posts, for instance.
 */

//Create the template component
const context = new Context();
const template_component = await wick(`

import directory from "./template.wick";

const len = directory.length;

export default <div> {len} </div>
`, context);

const { html } = await componentDataToCompiledHTML(template_component, context);

assert("Component importing template component has access to a copy of the template data array",
    html[0].children[0].data == 2);


const template_component2 = await wick(`

import directory from "./template.wick";

const len = directory.length;

export default <div> <directory/> </div>
`, context);


assert("An element cannot be instantiate from a template component", context.errors[0].comp == template_component2.name);
