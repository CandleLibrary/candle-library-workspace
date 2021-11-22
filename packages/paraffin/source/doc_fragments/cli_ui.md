<!--[README][LABEL]:cli_render[INDEX]:1[FOLLOWS]:install-->

## Rendering a CLI with Wickurse

Wickurse uses [cfw.Wick](https://github.com/CandleLibrary/wick) to compile HTML and *.wick source files. Please refer to the [Wick documentation](https://github.com/CandleLibrary/wick/documentation) for writing Wick components. 

#### `wick-component.html`
```html
<div>
    <style>
        root {
            width : 100%;
            height: 100%;
            padding: 2; 
            background-color:indigo;
            color:darkorange;
            text-align: center
        }
    </style>
    What a stylishly vibrant CLI! <br/>
    What do you want to accomplish today: <input type=text></>
</div>
```

#### `my-app.js` or `my-app.ts`
```ts
import { wickurse } from "@candlelib/paraffin";

const 
    cursed_wick = await wickurse(),
    cli_view = await cursed_wick.cli("./wick-component.html");

await cli_view.start();
```
#### OUTPUT
![CLI output screenshot](test.png)
