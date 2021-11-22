<h1 align=center>
    <img src="./flavor/cfw-flame-w-lib.svg" type="text/svg" rel="svg" height=80>
</h1>

<h3 align=center>Parsing - Editing - Generating</h3>

<p align=center> <sub><b>v0.0.14</b></sub> </p>

#


CandleLibrary HTML is a HTML parser that builds a node graph of HTML elements. It provides methods for hooking into the parsing process to generate custom HTML node graphs.

## Install

### NPM

```bash
npm install --save @candlelib/html
```
## Usage

>**note**:
>This script uses ES2015 module syntax,  and has the extension ***.mjs***. To include this script in a project, you may need to use the node flag ```--experimental-modules```; or, use a bundler that supports ES modules, such as [rollup](https://github.com/rollup/rollup-plugin-node-resolve).


```javascript
import html from "@candlelib/html"

html(`<div><a>hello world!</a></div>`).then(root=>{
	root.tag //=> div
	root.get //
})

```

## Notes

CandleLibrary HTML makes use of a none standard attribute to provide asynchronous HTML building. The `url` attribute can be used to fetch arbitrary data and insert that into the inner HTML of the element that has the attribute.

e.g.
```html
<!--file src.html -->
	<h1>
		<button style="background-color:red">Don't Touch</button>
	</h1>
```
In Javascript

```javascript
//javascript file in same folder
html(`<div url="./src.html"></div>`).then( root=>{

	const button = root.getTag("button", true)[0];

	button.toString() //=> "<button style="background-color:red">Don't Touch</button>"
})
```

# Members

## HTMLNode
mixin [@candlelib/ll - tree](https://github.com/galactrax/cfw-ll#README)

`import {HTMLNode} from "@candlelib/html"`

### Constructor

##### new HTMLNode ( )

### Properties

- **class** - *String* <br>&ensp; The class attribute value.

- **classList** - *Array* <br>&ensp; Array of all class values.

- **DTD** - *Boolean* <br>&ensp; **True** if the HTMLNode is a DTD element, such as a comment or ``<!DOCTYPE>``.

- **id** - *String* <br>&ensp; The id attribute value.

- **nextElementSibling** - *HTMLNode* <br>&ensp; Returns the next sibling HTMLNode or **null**

- **parentElement** - *HTMLNode* <br>&ensp; Returns the parent HTMLNode or **null**;

- **previousElementSibling** *HTMLNode* <br>&ensp; Returns the previous sibling HTMLNode or **null**

- **single** - *Boolean* <br>&ensp;  True if the element is a single tag element, such as \<input\>

- **tag** - *String* <br>&ensp; The tag name of the object.

- **tagName** - *String* <br>&ensp; Same as `tag`.

- **type** (Read-Only) - *Number* <br>&ensp;  `0` (`HTML`).

- **url** - *[CandleLibrary URL](https://github.com/galactrax/cfw-url)* <br>&ensp; If the element tag in the orignal HTML string contained an attribute named url, then value of that attribute is applied to `url`.

### Methods

- *HTMLElement* - ***build*** ( [ **parent** ] ) <br>&ensp;  Builds an HTMLElement tree from parsed nodes. If an HTMLNode is passed as `parent`, the HTMLElements will be appended to `parent`.


- *Object* - ***getAttrib*** ( **prop** ) <br>&ensp;  Returns the value of an attribute whose name matches `prop`, or it returns **null** if no attributes match the value.


- *String* - ***getClass*** ( **class_name** [ , **INCLUDE_DESCENDANTS** [ , **array** ] ] ) <br>&ensp; Returns an array of HTMLNodes that have values in their class attribute that matches `_class`. If `INCLUDE_DESCENDANTS` is set to **true**, all descendants of the node will searched, otherwise only the immediate children of the node will be searched. An optional Array can be passed as ``array`` to store the results in.


- *String* - ***getID*** ( **id** [ , **INCLUDE_DESCENDANTS** ] ) <br>&ensp;  Returns an array of HTMLNodes whose **id** property matches `id`. If `INCLUDE_DESCENDANTS` is set to **true**, all descendants of the node will searched, otherwise only the immediate children of the node will be searched. An optional Array can be passed as ``array`` to store the results in.


- *String* - ***getTag*** ( **tag** [ , **INCLUDE_DESCENDANTS** [ , **array** ] ] ) <br>&ensp; Returns an array of HTMLNodes whose tag property matches `tag`. If `INCLUDE_DESCENDANTS` is set to **true**, all descendants of the node will searched, otherwise only the immediate children of the node will be searched. An optional Array can be passed as ``array`` to store the results in.


- *Promise* - ***parse*** ( **lex** [ , **url** ] ) <br>&ensp; Parses HTML string. Accepts a [Whind Lexer](https://github.com/galactrax/cfw-whind) or a string as the value for `lex`.


- *String* - ***toString*** ( [ **offset** ] ) <br>&ensp; Returns a string representation of the HTMLNode. This rebuilds the original HTML string starting at the calling node. A number can passed to ```offset``` to indent string **offset** spaces.


#### Private

- *TextNode* - ***createTextNode*** ( **lex** ,  **start** , **end** ) <br>&ensp; Called by `parseRunner` to create a new `TextNode`.


- **parseOpenTag** ( **lex** , **DTD** , **old_wurl** ) <br>&ensp; Called by `parseRunner` to parse an open HTML tag.


- **parseRunner** ( **lex** , **OPENED** , **IGNORE_TEXT_TILL_CLOSE_TAG** , **parent** , **last_url**) <br>&ensp; Called by various methods to continue parsing an HTML input string.

#### Hooks - Methods that can be overridden in derived objects  

- *HTMLNode* - ***createHTMLNodeHook*** ( **tag** , **start** ) <br>&ensp;  Override this method to create a different node type for the given value of `tag`. The `start` value is the character position offset at the start of the element open tag.  
   > If overridden, returned object should support:
   > - Linked List methods and properties provided by [@candlelib/ll](https://github.com/galactrax/) mixins.
	 > - All properties and methods in HTMLNode


- *Boolean* - ***endOfElementHook*** ( **lex** , **parent** ) <br>&ensp; Override this method to hook into the last stage of element parsing. `lex` will be set to just after the close tag of the element within the input string. The value of `lex.off` combined with the `start` value passed in ``createHTMLNodeHook`` define the bounds of the element in the input string, starting at the beginning of the open tag (`start`) through to the end the `>` character of the close tag (`lex.off`). `parent` is the parent HTMLNode.


- *Boolean* - ***ignoreTillHook*** ( **tag** ) <br>&ensp; Override this method and return **true** to tell the parser to not to parse inner HTML data of a tag and simply skip over it.


- *Object* - ***processAttributeHook*** ( **name** , **lex** ) <br>&ensp; Override this method to parse attribute data. The returned object of this function should contain `name` and `value` properties to allow the object to work with the `getAttrib` function eg: `return {name:"id", value:"mango"}`. If **null** is returned instead, nothing will be inserted into the `attributes` array.
	- `name` is a string value with the name of the attribute in the original HTML.
	- `lex` is a fenced [Whind Lexer](https://github.com/galactrax/cfw-whind) that contains the string value of the attribute.


- *Promise* or *null* - ***processFetchHook*** ( **lexer** , **OPENED** , **IGNORE_TEXT_TILL_CLOSE_TAG** , **parent** , **url** ) <br>&ensp; Override this method to process how a url based resource is fetched.
     	
	> If overridden:  
	>
	> - This function should return either **null** or a **Promise**. If a **Promise** is returned, the parser will wait until the promise is resolved. This enables external content to be fetched and parsed.
	>	
	> - If you want to continue processing the returned data with the HTMLNode parse mechanism, call `this.parseRunner`, and pass the string value of the fetched data wrapped in a [Whind Lexer](https://github.com/galactrax/cfw-whind), **OPENED** , **IGNORE_TEXT_TILL_CLOSE_TAG**, **parent**, and **url** to the function. Passing these values will preserve the state of the parser.
	>
	> e.g:
	> ```javascript
	> import whind from "@candlelib/whind"
	> /*...
	>   ...
	>   ...*/
	> DerivedNode.prototype.processFetchHook = function(lexer, OPENED, IGNORE_TEXT_TILL_CLOSE_TAG, parent, url){
	>  	return fetch(url)
	> 	.then(res => {res.text()
	>		.then(txt => this.parsesRunner(whind(txt), OPENED, IGNORE_TEXT_TILL_CLOSE_TAG, parent, url))
	>	})
	> }
	> ```
	> **Warning**: It is up to the implementer to follow best practices when dealing with external data with regard to client and server safety. Additional issues can occur if URL recursion is not taken into account, which can lead to an infinite fetching loop within the parser! Check that the URL has not already been fetched by an ancestor HTMLNode before attempting to fetch a resource.


- *TextNode* - ***processTextNodeHook*** ( **lex** , **IS_INNER_HTML** ) <br>&ensp; Override this to process inner HTML text before creating and returning a TextNode. If **null** is returned, then the text data will be omitted from the resulting HTMLNode tree.
	- `lex` is a fenced [Whind Lexer](https://github.com/galactrax/cfw-whind) that contains the raw text data that is to inserted into the TextNode.
	- `IS_INNER_HTML` a *Boolean* value set to **true** if the lex data contains the entirety of the elements inner HTML. If **false**, then the data is the text data between sibling HTMLNodes.


- *Boolean* - ***selfClosingTagHook*** ( **tag** ) <br>&ensp; Override this method and return `true` to tell the parser that the HTML tag name`tag` is self closing and to not look for a matching close tag. e.g. ```return (tag === "input") ? true : false;```

## TextNode
mixin [@candlelib/ll - tree](https://github.com/galactrax/cfw-ll#README)

` import {TextNode} from "@candlelib/html"`

### Constructor
##### new ***TextNode*** ( [ **str** ] )

### Properties

- **txt** - *String* <br>&ensp; The string contents of the node.


- **type** (Read-Only) - *Number* <br>&ensp; `1` (`TEXT`)

### Methods


- *HTMLTextNode* - **build** ( ) <br>&ensp; Builds a and returns a HTMLTextNode.


- *String* - **toString** ( [ **offset** ] ) <br>&ensp; Returns a string representation of the TextNode. A number can passed to ```offset``` to indent string `offset` spaces.
