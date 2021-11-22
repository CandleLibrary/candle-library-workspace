import { Dispatcher } from "../types/types";

/**
    Credit: https://github.com/h5bp/html5-boilerplate
**/

const $404 = `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Page Not Found</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * {
            line-height: 1.2;
            margin: 0;
        }
        html {
            color: #888;
            display: table;
            font-family: sans-serif;
            height: 100%;
            text-align: center;
            width: 100%;
        }
        body {
            display: table-cell;
            vertical-align: middle;
            margin: 2em auto;
        }
        h1 {
            color: #999;
            font-size: 2em;
            font-weight: 400;
        }
        h2{
        	color:#888
        }
        p {
            margin: 0 auto;
            width: 280px;
        }
        @media only screen and (max-width: 280px) {
            body, p {
                width: 95%;
            }
            h1 {
                font-size: 1.5em;
                margin: 0 0 0.3em;
            }
        }
    </style>
</head>
<body>
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>Sorry, but the page you were trying to view does not exist.</p>
</body>
</html>
<!-- IE needs 512+ bytes: https://blogs.msdn.microsoft.com/ieinternals/2010/08/18/friendly-http-error-pages/ -->
`;

export default <Dispatcher>{
    name: "404",
    description: `
A default 404 page. 

Design credit to: H5BP
https://github.com/h5bp/html5-boilerplate
    `,
    response_code: 404,
    MIME: "text/html",
    respond: (tools) => {
        return tools.sendUTF8String($404 + " " + tools.url);
    },
    keys:
    {
        ext: 0xFFFFFFFF,
        dir: "/*"
    }
};