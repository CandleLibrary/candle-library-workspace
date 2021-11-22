import html from "@candlelib/html";


const result = `
<html>
    <head>
        <div>        </div>

        <body>        </body>
    </head>
</html>
`;

const tree = html(`
                <!DOCTYPE html>
                <html>
                <head>
                </div>
                <body>
                </html>
            `);

assert(tree.toString() == result);