<h1 align=center>CandleLibrary Wick</h1>

<h3 align=center>Static First Dynamic Components</h3>

<p align=center> <img alt="npm (tag)" src="https://img.shields.io/npm/v/@candlelib/wick?style=for-the-badge&logo=appveyor"> </p>

## Quick Start

Install Wick:
```bash
# NPM
$: npm install -g @candlelib/wick
```
```bash
# YARN
$: yarn global add @candlelib/wick
```

Build a component:
```jsx
// ./my_component.wick

<div> hello world </div>
```

Run the component in a browser:
```bash
candle.wick run --browser firefox ./my_component.wick
```

Compile your component into a static app:
```bash
candle.wick compile --output ./app ./my_component.wick
```

Host your app (using whatever static file web server you choose):
```bash
$ http-server ./app
```

Now grab a drink and toast your excelence!

> psss ... Checkout out [@candlelib/flame](https://github.com/candlelibrary/flame) for more goodies for editing and working with components

### But wait, there's more!

Add some pizzazz:
```jsx
// ./my_component.wick

export default <div> 
    <div class=banner>
        <h1> Hello World! </h1>
    </div>
</div>;

<style>
    root { 
        display:flex; width:100vw; 
        height: 100vh; align-items:center;
        justify-content:center; position:relative; 
        font-family: "sans-serif"
    }

    .banner{
        width:80%; height:60%; 
        text-align:center; justify-content:center; 
        padding:80px; display:flex;
        background: linear-gradient( 18deg, rgba(63,0,71,1) 0%, rgba(204,109,29,1) 45%, rgba(220,200,50,1) 100% );
        border-radius: 1vw
    }
    
    h1 { color:white; font-size:20vh; text-transform:uppercase }
</style>
```

Refactor that mess:
```jsx
// ./my_component.wick

import "./my_style.css";

export default <div> 
    <div class=banner>
        <h1> Hello World! </h1>
    </div>
</div>;
```
Get some reactions:
```jsx
// ./my_component.wick

import "./my_style.css";

let likes = 1;

export default <div> 
    <div class=banner>
        <h1> Hello World! </h1>
        <h3> 👍: {likes > 9000 ? "Over 9000 !!!!!!" : likes} </h3>
        <p><button onclick={likes++}> LIKE! </button></p>
    </div>
</div>;
```
Test it out:
```jsx
// ./my_component.wick

import "./my_style.css";

let likes = 1;

export default <div> 
    <div class=banner>
        <h1> Hello World! </h1>
        <h3> 👍: {likes > 9000 ? "Over 9000 !!!!!!" : likes} </h3>
        <p><button onclick={likes++}> LIKE! </button></p>
    </div>
</div>;

import test from "@test";

test: {
    likes += 9001; //Classic
    assert( 
        document.querySelector( document.querySelector("h3").innerText = "👍: Over 9000!!!!!!" ) 
     )
}
```

```bash
$ candle.wick test ./my_component.wick
```
Passed? Grab some moons:
```
🌕 🌕 
  🌙 
```


## Wick Is... 

Wick is a web component compiler that consumes JavaScript, CSS, HTML, JSON, Markdown, and few other things, and outputs
well constructed HTML documents that feel equally at home in a static deployment as they do in server side rendering. Its
designed to be easily configurable and infinitly adaptable.

Want to create a static blog web site with template system and editor, Wick has got you covered. Want 
to build a complete web editor in the browser, no problem; checkout CandleLibrary Flame for an example
of how Wick makes this possible.

#### Features

- Static first design. Whatever can be made static is made static, meaning small distributions that load quickly with zero JS overhead. Wick Runtime can be lazily load components as users interact with document to reduce CPU time and increase performance perception.

- Restricted syntax sugar on top of HTML, CSS, and JavaScript means less having to learn how to use
    wick, and simply using wick to get the job done.

- Full support of ECMAScript 2022, including import statements, await statements (WIP)

- Small Distribution

- Flexible component system with adaptable data flow. From simple drop in components to full applications, decide how your app should be structured.

- Dev, Language, and CSS tools provided with [CandleLibrary Flame](https://github.com/CandleLibrary/flame)

- Backed by [CandleLibrary Hydrocarbon](http://github.com/CandleLibrary/hydrocarbon), a flexible parser compiler that can be leveraged to expand Wick's syntax for even higher levels of customization and integration.

## More Examples

```jsx
//component-package-a.wick

//Import an outside style sheet into this component. 
import "./button-css.wick"

const greetings  = ["Hola", "Hello", "Salute", "こんにちは", "Helló"] //TODO should be hoisted to an internal, static property. 

export default  <button onclick={count++} > { greeting[count%greetings.length] } </button>

```

```CSS
/ /button-css.wick

// Wick Support both JSX like syntaxes as well as an HTML like syntax
<style>
    button {
        border:none;
        border-radius: 10px;
        padding: 10px 20px;
        <! Wick supports /*...*/, //..., & <! ... > comments anywhere >
        color: { ["red", "green", "blue" ][count%3] /* Even Here */ }
    }
</style>
```

A Todo App
```JSX
import { href } from "@model:std-location"

var data = [{task: "Clean desk", COMPLETED:false}];

export default <div>
    
    <input type="text" 
        onclick:ENTER={ data.push({ val:todo_string, COMPLETED:false }), "@input".value = "" }
    />

    <container {data} filter={!m.COMPLETED} hidden={ href=="#/active" || href=="#/all" }>

        <div>{val} <input type="checkbox" value={COMPLETED}}> </div>

    </container>

    <container {data} filter={m.COMPLETED} hidden={ href=="#/completed" || href=="#/all" }>

        <div>{val} <input type="checkbox" value={COMPLETED}}> </div>

    </container>

</div>;
```
# State Of The Library

Wick is in ongoing development and more features will be added, hardened, and bug fixed in persuite of a 
version 1.0.0 release. Of primary concern at this point is the construction of documentation to reflect the
depth and breadth of the Wick compiler and it's associated CandleLibrary sister projects. 

Wick can be used to build prototypes and products at this point, but it should be understood that Wick is
still volatile and unstable in areas, and cannot be gaurenteed to produce a production ready product until
a version 1.0.0 release. 

## Get Involved 

Wick is still in a very causual development process. If you want chip in and improve one what's already
here, I encourage you to open an issue. Ideas, bugs, rants, whatever it is, let me know what can be done to 
make this a stellar project.


# License

[MIT](./LICENSE) License
