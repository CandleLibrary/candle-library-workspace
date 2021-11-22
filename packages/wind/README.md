<h1 align=center>
    <img src="./flavor/cfw-flame-w-lib.svg" type="text/svg" rel="svg" height=80>
</h1>

<h3 align=center>Lightweight Lexer and Tokenizer</h3>

<p align=center> <sub><b>v0.4.0</b></sub> </p>
 
 \ ˈwīnd  \ - to raise to a high level [as of excitement or tension]

#

## Install

### NPM

```bash
npm install --save @candlelib/wind
```
## Usage

>**note**:
>This script uses ES2015 module syntax,  and has the extension ***.mjs***. To include this script in a project, you may need to use the node flag ```--experimental-modules```; or, use a bundler that supports ES modules, such as [rollup](https://github.com/rollup/rollup-plugin-node-resolve).



```javascript
import wind from "@candlelib/wind"

const sample_string = "The 2345 a 0x3456 + 'a string'";

let lexer = wind(sample_string);

//Example

lexer.text 						  //=> "The"
lexer.n.tx  					//=> "2345"                           
lexer.n.text   					//=> "a"                      
lexer.assert("b")
lexer.text                 		//=> "0x3456"
lexer.ty == lexer.types.number  //=> true
```

---
# Wind **Lexer**

`import { Lexer } from "@candlelib/wind"`

## Constructor


#### new ___Lexer___ ( __string__ [ , __INCLUDE_WHITE_SPACE_TOKENS__ ] )
- `string` - The input string to parse.
- `INCLUDE_WHITE_SPACE_TOKENS` - Flag to include white space tokens such as `TABS` and `NEW_LINE`.

>**note**: the default export `wind` has the same form as the Lexer constructor function  and is called without the **new** keyword.
>
> let lexer = ***wind*** ( __string__ [ , __INCLUDE_WHITE_SPACE_TOKENS__ )

## Properties

- __char__ (Read-Only) - *Number* <br>&ensp;  The char offset of the token relative to the `line`.

- __CHARACTERS_ONLY__  - *Boolean* <br>&ensp;  If **true** the Lexer will only produce tokens that are one character in length;

- __END__ (Read-Only) -  *Boolean* <br>&ensp;  If **true** the Lexer has reached the end of the input string.s

- __IGNORE_WHITE_SPACE__  - *Boolean* <br>&ensp;  If **true** `white_space` and `new_line` tokens will not be generated.

- __line__ (Read-Only) - *Number* <br>&ensp;  The index of the current line the token is located at.

- __off__ - *Number* <br>&ensp;  The absolute index position of the current token measured from the beginning of the input string.

- __p__ - *Wind Lexer* <br>&ensp;  A pointer cache to a peeking Lexer.

- __PARSE_STRING__ - *Boolean* <br>&ensp;  If set to **true** then string tokens will not be generated and instead the contents of string will be individually tokenized.

- __sl__ - *Number* <br>&ensp;  The length of the input string. Changing `sl` will cause the Lexer to stop parsing once `off+token_length >= sl`.

- __str__ - *String* <br>&ensp;  The string that is being tokenized.

- __string__ (Read-Only) - *String* <br>&ensp;  Returns the result of `slice()`

- __string_length__ (Read-Only) - *Number* <br>&ensp;  The length of the remaining string to be parsed. Same as `lex.sl - lex.off`.

- __text__ - *String* <br>&ensp;  The string value for the current token.

- __tl__ - *Number* <br>&ensp;  The size of the current token.

- __type__ - *Number* <br>&ensp;  The current token type. See [types](#Types).

- __types__ - *Object* <br>&ensp;  Proxy to types object.

- ***ch*** <br>&ensp;  The first character of the current token.

#### Alias properties

- **n** <br>&ensp;  Property proxy for `next()`;

- __string__ <br>&ensp;  Returns the result of `slice()`.

- __token__ <br>&ensp;   Property proxy for `copy()`

- **tx** <br>&ensp;  Proxy for `text`.

- **ty** <br>&ensp;  Proxy for  `type`.

- __pos__ <br>&ensp;  Proxy for `off`.

- **pk** <br>&ensp;  Property proxy for `peek()`.

## Methods

- *Lexer* - ___assert___ ( **text** ) <br>&ensp;  Compares the current token **text** value to the argument ``text``. If the values are the same then the lexer advances to the next token. If they are not equal, an error message is thrown.
    - *Returns Lexer to allow method chaining.*   


- *Lexer* - ___assertCharacter___ ( **char** ) <br>&ensp;  Same as `assert()` except compares a single character only.
    - *Returns Lexer to allow method chaining.*


- *Lexer* - ___comment___ ( [ **ASSERT** [ , **marker** ] ] ) <br>&ensp;  Skips to the end of the comment section if the current token is `/` and the peek token is `/` or `*`. If **true** is passed for the `ASSERT` argument then an error is thrown if the current token plus the peek token is not `/*` or `//`.
    - *Returns Lexer to allow method chaining.*   


- *Lexer* - ___copy___ ( [ **destination** ]) <br>&ensp;  Copies the value of the lexer to `destination`. `destination` defaults to a new Wind Lexer.


- *Lexer* - ___fence___ ( [ **marker** ] ) - Reduces the input string's parse length by the value of `marker.off`. The value of the `marker` *must* be a Wind Lexer that has the same input string as the callee Wind Lexer.
    - *Returns Lexer to allow method chaining.*


- *Lexer* - ___next___ ( [ **marker** ] ) <br>&ensp;  Advances the `marker` to the next token in its input string. Returns `marker` or **null** if the end of the input string has been reached.  `marker` defaults to the calling Wind Lexer object, which means **this** will be returned if no value is passed as `marker`.
    - *Returns Lexer to allow method chaining.*


- *Lexer* - ___peek___ ( [ **marker** [ , **peek_marker** ] ] ) <br>&ensp;  Returns another Wind Lexer that is advanced one token ahead of `marker`. `marker` defaults to **this** and `peek_marker` defaults to `p`. A new Wind Lexer is created if no value is passed as `peek_marker` and `marker.p` is **null**.


- *Lexer* - ___reset___ ( ) <br>&ensp;  Resets lexer completely. After this is called, the lexer will need to be set with a new input string to allow it to begin parsing again.
    - *Returns Lexer to allow method chaining.*


- *Lexer* - ___resetHead___ ( ) <br>&ensp;  Reset the lexer to the beginning of the string.
    - *Returns Lexer to allow method chaining.*


- *Lexer* - ___setString___ ( **string**  [ , **RESET** ] ) <br>&ensp;  Changes the input string to `string`. If the optional `RESET` argument is **true** then `resetHead()` is also called.
    - *Returns Lexer to allow method chaining.*


- *String* - ___slice___ ( [ **start** ] ) <br>&ensp;  Returns a substring of the input string that starts at `start` and ends at the value of `off`. If `start` is **undefined** then the substring starts at `off` and ends at `sl`.


- *Lexer* - ___sync___ ( [ **marker** ] ) <br>&ensp;  Copies the current values of the `marker` object to the Wind Lexer. `marker` defaults to the value of `p`.
    - *Returns Lexer to allow method chaining.*


- ___throw___ ( **message** ) <br>&ensp;  Throws a new Error with a custom `message` and information to indicate where in the input string the current token is positioned.

- *String* - ___toString___ ( ) <br>&ensp;  Returns the result of `slice()`.

- ___trim___ ( ) <br>&ensp;  Creates and returns new Lexer with leading and trailing whitespace and line terminator characters removed from the input string. 

#### Alias Methods

- ***a*** ( **text** ) <br>&ensp;  Proxy for `assert(text)`.

- ***aC*** ( **char** ) <br>&ensp;  Proxy for `assertCharacter(character)`.

- ***r*** ( ) <br>&ensp;  Proxy for `reset()`.

- ***s***( [ **start** ] ) <br>&ensp;  Proxy for `slice(start)`.

## Types

 There are 10 types of tokens that the Wind Lexer will create. Type identifiers can be accessed through ***wind.types***, ***Lexer.types***, and the `types` property in Lexer instances. Each type is identified with a power of 2 value to allow nested comparisons:
 ```js
 (lexer.type & (lexer.types.identifier | lexer.types.symbol)) ? true : false;  
 ```

- **types.identifier** or **types.id**
<br>&ensp; Any set of characters beginning with `_`|`a-z`|`A-Z`, and followed by `0-9`|`a-z`|`A-Z`|`-`|`_`|`#`|`$`.

- **types.number** or **types.num**<br>&ensp; Any set of characters beginning with `0-9`|`.`, and followed by `0-9`|`.`.

- **types.string** or **types.str** <br>&ensp;  A set of characters beginning with either `'` or `"` and ending with a matching `'` or `"`.

- **types.open_bracket** or **types.ob** <br>&ensp;  A single character from the set `<`|`(`|`{`|`[`.

- **types.close_bracket** or **types.cb** <br>&ensp;  A single character from the set `>`|`)`|`}`|`]`.

- **types.operator** or **types.op** <br>&ensp;  A single character from the set `*`|`+`|`<`|`=`|`>`|`\`|`&`|`%`|`!`|`|`|`^`|`:`.

- **types.new_line** or **types.nl** <br>&ensp;  A single `newline` (`LF` or `NL`) character. It may also be `LFCR` if the input string has Windows style new lines.

- **types.white_space** or **types.ws** <br>&ensp;  An uninterrupted set of `tab` or `space` characters.

- **types.symbol** or **types.sym** <br>&ensp;  All other characters not defined by the the above, with each symbol token being comprised of one character.

- **types.data_link** or **types.dl** <br>&ensp;  A data link ASCII character, followed by two more characters and another data link character.
