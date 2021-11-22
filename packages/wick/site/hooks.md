# Standard Wick Hooks

## Plugin Usage

Register a component an Extended Type
```jsx
import {
    getExtendTypeVal
} from "wick-plugin"

const my_type = getExtendedTypeVal("hello-world-type")

//Install Handler For Node

```
Lookup value shortcuts - No checks are done to verify that the indexed values exists
- **Container** - `\$\$ctr\d+`
- **Element** - `\$\$ele\d+`
- **Child** - `\$\$ch\d+`

## Terms

### Data Direction
- Out : Data from components internal JS system: Model updates, internal ref updates
- In : Data from user input, parent component, or children components. 

### Binding Variable
A variable that is bound to some value that can be changed by any number of operations. When a binding variable's value changes, any hooks that have expressions that are dependent on the binding variable will also change to reflect the new value associated with the value of the binding variable.

There are 8 types of binding variables:
- INTERNAL_VARIABLE - var let in root scope
- CONST_INTERNAL_VARIABLE - const in root scope
- PARENT_VARIABLE - bound from `import ... from "@parent"`
- MODEL_VARIABLE - bound from `import ... from "@model"` and `import ... from  "@model:named-model"`
- GLOBAL_VARIABLE - auto bound from undeclared variables names that match names of properties in the `globalThis` object.
- METHOD_VARIABLE - bound from declarations of functions within the root scope.
- MODULE_MEMBER_VARIABLE - bound from  `import {...} from  "@api` and from `import {...} from "path/to/js/ts/module"`
- MODULE_VARIABLE - `import var_name from  "@api` and from `import var_name from "path/to/js/ts/module"`
- UNDECLARED_VARIABLE - default bound variable type when none of the above apply 

## HTML Element Hooks

## Input Hooks

### Input `value` Hook

```jsx
<input type="text" value={ hook_expression }>
```

Binds the hook expression the inputs `value` attribute. If the hook_expression is a single variable reference, then the data flow is automatically bi-directional: Any update to the element from user input will be used to update the binding variable value, and any update to the binding variable value from the JS system will update the value of the `<input>` element. 

If the hook_expression is complex ( anything other than a single var reference), then data direction is out-only: only update from the JS system will cause changes to the elements value attribute; any user input is ignored. 

If `read-only` attribute is present on the `<input>` element, then the above behavior is enforced by default, regardless of the complexity of the hook's expression.

### Checkbox `checked` Hook

```jsx
<input type="checkbox" checked={ hook_expression }>
```
### Element `on*` Event listener hook

```jsx
<input onclick={ hook_expression}>
<iframe onload={ hook_expression }></iframe>
```

## Listen standard library function 

```jsx 

listen(...<binding_reference>, <component_function_name>);

```

The `listen` function can be used to bind the calling of an internal function to any number of binding_references. If the value of any one of the hooked binding variables changes, then the function will be called. Deduplication is used to prevent the function from being called more than once during an update frame. No arguments are passed to the called function.

## General Attribute Hook
```jsx
<div id={hook_expression}></div>
```

## Anchor Element HREF Hook
```jsx
<a href={hook_expression}></a>
```

## CSS Selector Hook

```jsx
var ele = "@.class[\"history\"]";
```

Resolves the string expression beginning with an `@` symbol to a reference of the first matching element that has been declared in the  component. Does not match elements defined within `<container>` elements or elements found within imported component elements. 

## Closest canvas context hook

```jsx
var ele2D = $ctx2d;
var ele3D = $ctx3d[0];
var eleWebGPU = $ctxWebGPU[0];
```

Resolves the reference to the context object for 2D, 3D, and WebGPU contexts. Component must define at least one canvas. An array specifier can be used to select the index of the canvas element whose respective context should be retrieved. If the array member accessor is not used, then the first canvas element declared in the component will be used for context retrieval. 

## Wick Element Hooks
### Component Import Hooks
#### `export` Parent Data Hook
```jsx
<child-element export={ parent_internal_variable as external_var_name }/>
```
#### `export` Child Data Hook
```jsx
export { internal_variable as external_var_name }
```
#### `source-url` Hook
### Component Import Hooks
### Container Hooks
#### Data Hook 
```jsx
<container data={ [{},{},{}] }></container>
```
Expects expression to resolve to an array of Objects

#### USE-IF Hook

```jsx
var data = "test";
<container>
    <div use-if={ m == data}>
</container>
```

The first UNDECLARED binding reference the expression will be bound to the pending model object.

#### Filter Hook
```jsx
<container filter={m == data}></container>
```

Filters out modules from the container data collection when the expression evaluates to false. Expression can also bind to a single
METHOD_VARIABLE

#### Sort Hook
```jsx
<container sort={m1.length > m2.length ? 1 : 0}></container>
```

#### Scrub Hook 
```jsx
<container sort={scrub_delta }></container>
```

#### Offset Hook 
```jsx
<container sort={offset }></container>
```

#### Limit Hook 
```jsx
<container sort={limit_value }></container>
```

#### Shift Hook 
```jsx
<container sort={shift_value }></container>
```

#### HTML Text Hook 
```jsx
<div>{text_data}</div>
```