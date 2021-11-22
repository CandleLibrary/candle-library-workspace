<!--[README][LABEL]:arg_usage[INDEX]:4[FOLLOWS]:install-->

## Extracting process arguments

```ts
// input: $ my-app --hello world -acb true naked_arg

import { getProcessArgs } from "@candlelib/paraffin";

const arg_obj = await getProcessArgs(
/** 
 * This object is an optional set of anticipated process arguments.
 * 
 *  - If the argument should be matched to a value, set the prop 
 *    value to `true`.
 * 
 *  - If the property should alias another property, provide the 
 *    name of the value to be aliased as a `string`.
 * 
 *  - If an argument is not defined, then it will appear in the 
 *    output object with a default value set to `true`.
 * 
 *  - If an argument name is not proceeded by a hyphen, then it 
 *    is considered a "naked" argument, and its output value is 
 *    set to `null`
 */ 
    {
        hello:true,
        boolean: true,
        b: "boolean"
    }
);

arg_obj["hello"]   // --> "hello world"
arg_obj.a           // --> true
arg_obj.c           // --> true
arg_obj.b           // --> undefined - This property was aliased to "boolean"
arg_obj.boolean     // --> "true"

```


