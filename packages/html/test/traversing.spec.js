import html from "@candlelib/html";

html.server();

const HTML_DATA =
    `
                <html type="truetype">
                    <head screen="true">
                        <!-- test -->
                        <style>
                            a{color:red}
                        </style>
                    </head>
                    <script>sthis</script>
                    <body class="mango">
                        thisis some of my text
                        <app>sdfsaf 
                            <template id="my_id">
                                this is my inner template.
                            </template>
                            <template id="this" class="mango dog hippo"></template>
                        </app>
                        <body>
                        </body>
                    </body>
                    <layer id="my_id">
                    </layer>
                </html>
                `;

let dom = html(HTML_DATA);


//"Can look through child elements for id"
let temp1 = dom.getID("my_id");
assert(temp1.tag == "layer");
assert(temp1.id == "my_id");

//"Can look through descendant elements for id"
let temp2 = dom.getID("my_id", true);
assert(temp2.tag == "template");
assert(temp2.id == "my_id");

//"Can lookup child elements by class"
let temp3 = dom.getClass("mango");
assert(temp3.length == 1);
assert(temp3[0].tag == "body");

//"Can lookup descendant elements by class"
let temp4 = dom.getClass("mango", true);
assert(temp4.length == 2);
assert(temp4[0].tag == "body");
assert(temp4[1].tag == "template");

//"Can lookup child elements by tag"
let temp5 = dom.getTag("body");
assert(temp5.length == 1);
assert(temp5[0].tag == "body");

//"Can lookup descendant elements by tag"
let temp6 = dom.getTag("template", true);
assert(temp6.length == 2);
assert(temp6[0].tag == "template");
assert(temp6[1].tag == "template");
