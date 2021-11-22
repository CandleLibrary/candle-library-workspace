import { parse } from "../build/css.js";


"@candlelib/css test spec";
"PARSER"; "#";
{
    const stylesheet = parse(`div{
        top:320%;
        justify-content:space-around;
        font-family:Arial  , "Times new Roman"
    }
@media screen and (min-width : 900px) {
    .sdfsf  #nav{
        padding: 0 2px;
        z-index:-5820;
    }
}
@media screen and ( max-width: 800px ) {
    body{
        background-color:#ff0000
    }
}
    `),
        result =
            ` div{
    top:320%;
    justify-content:space-around;
    font-family:Arial  , "Times new Roman"
}`;

    const s = stylesheet.toString();

    ((s == result));
}

