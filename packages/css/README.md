<h1 align=center>CandleLibrary CSS</h1>

<h3 align=center>CSS AST compiler & editing tools</h3>

<p align=center> <img alt="npm (tag)" src="https://img.shields.io/npm/v/@candlelib/css?style=for-the-badge&logo=appveyor"> </p>

CandleLibrary CSS is a general purpose CSS parser, editor, and generator tool.

# Install

### NPM 

```bash
npm install --save @candlelib/css
```

## Usage

>**note**:
>This script uses ES2015 module syntax,  and has the extension ***.mjs***. To include this script in a project, you may need to use the node flag ```--experimental-modules```; or, use a bundler that supports ES modules, such as [rollup](https://github.com/rollup/rollup-plugin-node-resolve).

```javascript
import css from "@candlelib/css";

css(`
    div, a.header, h1 > a {
        color: red;
        height: 100em;
    }
`).then(parsed_css => {
    parser_css.rules;
});

```
