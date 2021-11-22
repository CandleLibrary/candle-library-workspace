import wind, { Lexer } from "@candlelib/wind";
import ll from "./ll.js";

/** NODE TYPE IDENTIFIERS **/
const HTML = 0;
const TEXT = 1;
const offset = "    ";

// Pollyfill of HTMLElement classList
function classList(this_arg, list: string[]) {
    Object.assign(list, {
        contains: str => {
            return list.includes(str);
        },
        add: (name) => {
            let attrib = this_arg.getAttrib("class");
            if (attrib) {
                attrib.value += " " + name;
                list.push(name);
            } else {
                this_arg.setAttribute("class", name);
            }
        }
    });
    return list;
}

/**
 * A node for text data.
 * @param  {string}  str     The text value of the node.
 */
class TextNode {

    private _data: string;

    par: HTMLNode;

    nxt: HTMLNode | TextNode;

    prv: HTMLNode | TextNode;

    constructor(str = "") {
        /**
         * The text value
         */
        this.data = str;
    }

    get data(): string {
        return this._data;
    }

    set data(d: string) {

        this._data = String(d);

        this.bubbleUpdate();
    }

    /**
     * Returns the type of `1` (`TEXT`)
     */
    get type() {
        return TEXT;
    }

    get parentElement() {
        return this.par;
    }

    /**
     * Returns a string representation of the object.
     * @param      {string}  str     Optional string passed down from calling method.
     * @return     {string}  String representation of the object.
     */
    toString(off = 0) {
        return `${this.data}`;
    }

    /**
     * Builds a real DOM HTMLTextNode node. 
     * @param      {HTMLElement}  parent  The real html element.
     */
    build(parent) {
        parent.appendChild(document.createTextNode(this.data));
    }

    set type(e) {

    }

    get innerText() {
        return this.toString();
    }

    set innerText(e) {

    }

    bubbleUpdate() {
        if (this.par)
            this.par.bubbleUpdate();
    }

}

ll.mixinTree(TextNode);


/**
 * A node for HTML data. 
 * Handles the parsing of HTML strings.
 */
class HTMLNode {
    attributes: any[];

    tag: string;
    DTD: boolean;

    single: boolean;

    line: number;

    pos: Lexer;

    fch: HTMLNode | TextNode;

    par: HTMLNode;

    nxt: HTMLNode | TextNode;

    prv: HTMLNode | TextNode;

    parent: HTMLNode;

    constructor() {

        /**
         * Element attributes
         * @public
         */
        this.attributes = [];

        /**
         * The tag name of the object.
         * @public
         */
        this.tag = "";

        /**
         * Whether the node is a DTD, such as a comment.
         * @private
         */
        this.DTD = false;

        /**
         * True if the element is a single tag element. 
         */
        this.single = false;

    }

    /******************************************* ATTRIBUTE AND ELEMENT ACCESS ******************************************************************************************************************/
    get style() {
        return {};
    }
    /**
     * Returns the type of `0` (`HTML`)
     * @public
     */
    get type() {
        return HTML;
    }

    get tagName() {
        return this.tag.toUpperCase();
    }

    get classList() {

        let classes = this.getAttrib("class");

        if (classes && typeof (classes.value) === "string")
            return classList(this, classes.value.split(" "));

        return classList(this, []);
    }

    getAttribute(name) {
        let attr = this.getAttrib(name);
        if (attr)
            return attr.value;
        return null;
    };

    hasAttribute(name) {
        return this.getAttribute(name) !== null;
    }

    setAttribute(name, value) {
        let attr = this.getAttrib(name);
        if (attr)
            attr.value = value;
        else
            this.attributes.push({ name, value });

        this.bubbleUpdate();
    };

    get parentElement() {
        return this.par;
    }

    get firstChild() {
        return this.fch;
    }

    get lastChild() {
        return this.fch ? this.fch.prv : null;
    }

    get previousElementSibling() {
        if (this.par) {
            let guard = this.par.fch;

            if (this == guard) return null;

            let node = this.prv;

            while (node && node != guard) {
                if (node.type == HTML)
                    return node;
                node = node.prv;
            }

            if (node.type == HTML)
                return node;
        }
        return null;
    }

    get nextElementSibling() {
        if (this.par) {
            let guard = this.par.fch;

            let node = this.nxt;

            while (node && node != guard) {
                if (node.type == HTML)
                    return node;
                node = node.nxt;
            }
        }
        return null;
    }



    /**
     * Gets an attribute.
     * @param      {string}  prop    The attribute name to lookup;
     * @public
     */
    getAttrib(prop, GET_IGNORED = false) {
        for (let i = -1, l = this.attributes.length; ++i < l;) {
            let attrib = this.attributes[i];
            if (attrib.name == prop && (!attrib.IGNORE || GET_IGNORED)) return attrib;
        }
        return null;
    }



    /**
     * Get Elements by the tag name.
     * @param      {string}   tag                  A string to match with the element's tag value.
     * @param      {boolean}  [INCLUDE_DESCENDANTS=false]  When `true` searching will recurse depth first into child elements.
     * @param      {Array}    array                Internal element store that is returned. 
     * @return     {Array}    An array of matched elements.
     * @public
     */
    getTag(tag, INCLUDE_DESCENDANTS = false, array = []) {
        for (let node = this.fch; node;
            //@ts-ignore
            (node = this.getNextChild(node))) {
            if (node.type == HTML) {
                //@ts-ignore
                if (node.tag == tag) array.push(node);
                //@ts-ignore
                if (INCLUDE_DESCENDANTS) node.getTag(tag, INCLUDE_DESCENDANTS, array);
            }
        }
        return array;
    }



    /**
     * Get Elements by the tag name.
     * @param      {string}   _class               A string to find with the element's class value.
     * @param      {boolean}  [INCLUDE_DESCENDANTS=false]  When `true` searching will recurse depth first into child elements.
     * @param      {Array}    array                Internal element store that is returned. 
     * @return     {Array}    An array of matched elements.
     * @public
     */
    getClass(_class, INCLUDE_DESCENDANTS = false, array = []) {
        for (let node = this.fch; node;
            //@ts-ignore
            (node = this.getNextChild(node))) {
            //@ts-ignore
            if (node.type == HTML) {
                //@ts-ignore
                if (node.class.includes(_class)) array.push(node);
                //@ts-ignore
                if (INCLUDE_DESCENDANTS) node.getClass(_class, INCLUDE_DESCENDANTS, array);
            }
        }
        return array;
    }



    /**
     * Get first element with matching id.
     * @param      {string}   id                   The identifier value to find.
     * @param      {boolean}  [INCLUDE_DESCENDANTS=false]  When `true` searching will recurse depth first into child elements.
     * @return     {HTMLNode}   The first element whose id matches.
     * @public
     */
    getID(id, INCLUDE_DESCENDANTS = false) {
        for (let node = this.fch, ch; node;
            //@ts-ignore
            (node = this.getNextChild(node))) {
            if (node.type == HTML) {
                //@ts-ignore
                if (node.id == id) return node;
                //@ts-ignore
                if (INCLUDE_DESCENDANTS && (ch = node.getID(id, INCLUDE_DESCENDANTS))) return ch;
            }
        }
        return null;
    }



    /**
     * The id attribute value.
     * @public
     */
    get id() {
        let id_attrib = this.getAttrib("id");
        return (id_attrib) ? id_attrib.value : "";
    }



    /**
     * The class attribute value.
     * @public
     */
    get class() {
        let id_attrib = this.getAttrib("class");
        return (id_attrib) ? id_attrib.value : "";
    }

    get childNodes() {
        //@ts-ignore
        for (var z = [], i = 0, node = this.fch; i++ < this.noc;)(
            z.push(node), node = node.nxt
        );
        return z;
    }

    /**
         * @return {array} Returns an array of all children.
         */
    get children() {
        for (var z = [], i = 0, node = this.fch; i++ < this.noc;)(
            z.push(node), node = node.nxt
        );

        return z.filter(e => e instanceof HTMLNode);
    }

    set children(e) {
        /* No OP */
    }

    get firstElementChild() {
        return this.children[0];
    }


    /**
     * Returns a string representation of the object.
     * @return     {string}  String representation of the object.
     * @public
     */
    toString(off: number = 0, off_multiplier = 1): string {

        let o = offset.repeat(off * off_multiplier);

        let str = `\n${o}<${this.tag}`,
            atr = this.attributes,
            i = -1,
            l = atr.length;

        while (++i < l) {
            let attr = atr[i];

            if (attr.name)
                if (attr.value)
                    str += ` ${attr.name}="${attr.value}"`;
                else
                    str += ` ${attr.name} `;
        }


        if (this.single || this.tag == "img")
            return str + "/>";

        str += ">";
        str += this.innerToString(off + 1, off_multiplier);

        return str + `${o}</${this.tag}>\n`;
    }

    innerToString(off: number = 0, off_multiplier = 1): string {
        let str = "";
        for (let node = this.fch; node;
            //@ts-ignore
            (node = this.getNextChild(node))) {
            str += node.toString(off, off_multiplier);
        }
        return str;
    }



    /******************************************* PARSING ******************************************************************************************************************/



    /**
     * Creates a text node. 
     *
     * @param      {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}
     * @param      {start}  start   The starting point of the data slice
     * @private
     */
    private createTextNode(lex: Lexer, start: number = 0, end: number = 0) {

        if (end) {
            const other_lex = lex.copy();
            other_lex.off = start - 1;
            other_lex.tl = 1;
            other_lex.sl = end;
            other_lex.IWS = false;
            other_lex.next();
            const text_node = this.processTextNodeHook(other_lex, true);
            //@ts-ignore
            if (text_node) this.addChild(text_node);
        } else if (start <= lex.off) {
            let other_lex = lex.copy();

            other_lex.off = start;
            other_lex.END = false;
            other_lex.tl = 0;
            other_lex.fence(lex);
            other_lex.IWS = false;
            other_lex.n;
            other_lex.IWS = true;
            //if ((other_lex.sl - other_lex.off) < 2) {
            //No data
            //TODO
            //throw new Error("Unexpected end of input");
            //} else {
            let text_node = this.processTextNodeHook(other_lex, false);
            //@ts-ignore
            if (text_node) this.addChild(text_node);
            //}

        }
    }



    /**
     * Parses an HTML open tag.
     * @param {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}  
     * @param {Object} attribs - An object which will receive the attribute keys and values. 
     * @private
     */
    private parseOpenTag(lex: Lexer, DTD: any) {

        lex.PARSE_STRING = true;

        while (!lex.END && lex.text !== ">") {

            if (DTD && lex.ch == "-" && lex.pk.ch == "-") {
                //parse comment

                let pk = lex.pk;
                if (!lex.text) throw Error("Unexpected end of input.");
                let a = pk.n.ch,
                    b = pk.n.ch;
                while (!pk.END && (b !== "-" || a !== "-")) {
                    a = b;
                    b = pk.n.tx;
                }
                lex.sync().n;
                continue;
            }

            this.processInnerTextCharacterHook(lex);

            lex.IWS = false;

            let pk = lex.pk;


            while (!pk.END && !(pk.ty & (pk.types.ws | pk.types.nl)) && pk.ch !== "=" && pk.ch !== ">") { pk.n; }

            let attrib_name = pk.slice(lex).trim();

            lex.sync();

            lex.IWS = true;

            let out_lex = lex.copy();

            out_lex.sl = lex.off;

            if (lex.ch == "=") {
                let pk = lex.pk;

                const sentinel = pk.ch;

                let start = pk.off;

                pk.IWS = false;
                if (sentinel == "\"" || sentinel == "\'") {
                    pk.next();
                    while (!pk.END) {
                        pk.next();
                        if (pk.ch == sentinel) {
                            pk.next();
                            break;
                        };
                    };
                } else {
                    while (!pk.END && !((pk.ty & (pk.types.ws | pk.types.nl)) > 0) && !(["\"", "\'", "\=", "\<", "\>", "\`"].includes(pk.ch))) {
                        pk.next();
                    }
                }



                if (pk.off > start) {
                    out_lex = lex.n.copy();
                    out_lex.fence(pk);
                    lex.sync();

                    if (out_lex.slice()[0] == "\"" || out_lex.slice()[0] == "\'") {
                        out_lex.tl = 1;
                        out_lex.next();
                        out_lex.sl -= 1;
                    }

                } else {
                    //Have simple value
                    lex.sync(pk);

                    out_lex = lex.copy();

                    if (lex.pos < 0)
                        lex.throw(`Unexpected end of input. Expecting value for attribute "${attrib_name}"`);
                    else if (lex.type == lex.types.str) {
                        out_lex.tl = 1;
                        out_lex.n;
                        out_lex.sl = lex.pos + lex.tl - 1;
                        lex.n;
                    } else {
                        lex.next();
                        out_lex.fence(lex);
                    }
                }
            }

            let attrib = this.processAttributeHook(attrib_name, out_lex);

            if (attrib)
                this.attributes.push(attrib);
        }

        return false;
    }

    parseRunner(lex: Lexer = null, OPENED = false, IGNORE_TEXT_TILL_CLOSE_TAG = false, parent = null) {
        let start = lex.pos;
        let end = lex.pos;
        let HAS_INNER_TEXT = false;

        // The lexer Should not produce string tokens when parsing HTML tags. If it does, markup such as 
        //  
        // <div> The " Market Row <b> Clipers <\b> " </div>
        // 
        // Would be incorrectly parsed since the lexer would produce a token {type:"string", tx:" Market Row <b> Clipers <\b> "} 
        // that would prevent the <b> tag from being detected and parsed.

        lex.PARSE_STRING = true;

        main_loop:
        while (!lex.END) {

            this.processInnerTextCharacterHook(lex);

            switch (lex.ch) {

                case "<":

                    lex.IWS = true;
                    let pk = lex.pk;
                    if (pk.ch == "/") {

                        let { tag_name: name, parse_head } = parseTagName(pk.pk);

                        if (this.tag != name) {
                            if (IGNORE_TEXT_TILL_CLOSE_TAG) {
                                break;
                            }
                        }

                        if (HAS_INNER_TEXT) {
                            if (IGNORE_TEXT_TILL_CLOSE_TAG)
                                this.createTextNode(lex, start);
                            else if ((end - start) > 0)
                                this.createTextNode(lex, start, end);
                        }


                        //Close tag is not the one we are looking for. We'll create a new dummy node and close the tag with it. 
                        if (name != this.tag) {
                            let par = this.par;
                            while (par) {
                                if (name == par.tag) {
                                    return this.endOfElementHook();
                                }
                                par = par.par;
                            }

                            let insert = new HTMLNode();
                            insert.tag = name;
                            //@ts-ignore
                            this.addChild(insert);
                            lex.sync(parse_head);
                            lex.IWS = true;
                            lex.a(">");
                            start = lex.pos;
                            continue;
                        } else {

                            //Close tag
                            lex.sync(parse_head);
                            lex.IWS = false;
                            lex.a(">");
                            return this.endOfElementHook();
                        }
                    }

                    if (!IGNORE_TEXT_TILL_CLOSE_TAG) {

                        if (pk.ch == "!") {
                            /* DTD - Doctype and Comment tags*/
                            //This type of tag is dropped
                            while (!lex.END && lex.n.ch !== ">") { };
                            lex.a(">");
                            lex.IWS = false;
                            continue;
                        }

                        //Check to see if tag name is valid
                        //Expect tag name 
                        let { tag_name, parse_head } = parseTagName(pk);

                        if (!tag_name) {
                            lex.IWS = false;
                            break;
                        }

                        //Open tag
                        if (!OPENED) {
                            this.DTD = false;
                            this.attributes.length = 0;

                            this.tag = tag_name.toLowerCase();

                            lex.sync(parse_head);
                            lex.tl = 0;

                            this.parseOpenTag(lex.next(), false);

                            this.pos = lex.copy();

                            start = lex.pos + 1;
                            lex.IWS = false;

                            let SELF_CLOSING = this.selfClosingTagHook(this.tag);

                            if (lex.ch == "/") {
                                //This is a tag that should be closed 
                                lex.next();

                                SELF_CLOSING = true;

                                //This element is self closing and does not have a body.
                            } else {

                                HAS_INNER_TEXT = IGNORE_TEXT_TILL_CLOSE_TAG = (this.ignoreTillHook(this.tag));

                                OPENED = true;
                            }

                            lex.assert(">");

                            if (HAS_INNER_TEXT)
                                start = lex.pos;

                            if (SELF_CLOSING) {
                                // Tags without matching end tags.
                                this.single = true;

                                return (this.endOfElementHook()) || this;
                            }

                            continue;
                        } else {
                            // Processing any characters leading up to this point 
                            // as a text node.
                            lex.IWS = false;
                            //Create text node;
                            if (HAS_INNER_TEXT) {

                                if (IGNORE_TEXT_TILL_CLOSE_TAG)
                                    this.createTextNode(lex, start);
                                else if ((end - start) > 0) {
                                    this.createTextNode(lex, start, end);
                                }
                            }

                            //New Child node found
                            //@ts-ignore
                            let node = this.createHTMLNodeHook(lex.pk.tx, lex.off, lex, this);

                            if (node) {

                                node.par = this;

                                node = node.parseRunner(lex, false, false, this);

                                node.par = null;

                                node.parent = this;
                                //@ts-ignore
                                if (node.DTD) this.removeChild(node);
                            }

                            lex.IWS = false;
                            start = lex.pos;
                            end = lex.pos;
                            HAS_INNER_TEXT = false;
                            IGNORE_TEXT_TILL_CLOSE_TAG = false;

                            continue main_loop;
                        }
                    }

                    lex.IWS = false;
                    break;
            }

            if (!IGNORE_TEXT_TILL_CLOSE_TAG) {
                if (lex.ty == 8 && !HAS_INNER_TEXT) {
                    start = lex.pos;
                } else if (lex.ty == 256) { } else {
                    HAS_INNER_TEXT = true;
                    end = lex.off + lex.tl;
                }
            }

            lex.next();
        }

        if (OPENED && start < lex.off) {
            if (lex.off - start > 0) {
                //Got here from a network import, need produce a text node;
                this.createTextNode(lex, start);
            }
        }

        return this;

    }

    /**
     * Parses HTML string. Appends new nodes, or consumes first node if tag is an empty string.
     * @param      {Lexer} - A Lexical tokenizing object supporting methods found in {@link Lexer}
     * @param      {boolean}  OPENED       The opened
     * @param      {boolean}  IGNORE_TEXT_TILL_CLOSE_TAG  If `true`, parser will ignore all HTML syntax until the closing tag is found.
     * @return     {Promise}  
     * @private
     */
    parse(lex) {


        if (typeof (lex) == "string") lex = wind(lex);

        lex.IWS = false;

        return this.parseRunner(lex, false, false, null);
    }

    /******************************************* HOOKS ******************************************************************************************************************/

    endOfElementHook() { return this; }

    selfClosingTagHook(tag) {
        return [
            "area",
            "base", "br",
            "col", "command",
            "embed",
            "hr",
            "img", "input",
            "keygen",
            "link",
            "meta",
            "param",
            "source",
            "track",
            "wbr"].includes(tag);
    }

    ignoreTillHook(tag) {
        // Special character escaping tags.


        return ["script", "style", "pre"].includes(tag);
    }

    createHTMLNodeHook(tag, start) { return new HTMLNode(); }

    processInnerTextCharacterHook(lex) {
        return;
    }

    processAttributeHook(name, lex) { return { IGNORE: false, name, value: lex.slice() }; }

    processTextNodeHook(lex, IS_INNER_HTML) {
        if (!IS_INNER_HTML)
            return new TextNode(lex.slice());

        let t = lex.trim(1);

        //if (t.string_length > 0)
        return new TextNode(lex.slice());

        return null;
    }

    /**
        Deep Clone of Element
    */
    clone() {
        //@ts-ignore
        const clone = new this.constructor();

        clone.tag = this.tag;

        clone.parse(this.toString());

        return clone;
    }

    get innerHTML() {
        return this.innerToString();
    }

    set innerHTML(text) {

        this.fch = null;
        const lex = wind(text + "");
        lex.IWS = false;
        //if (text)
        this.parseRunner(lex, true, false, this.par);

        this.bubbleUpdate();
    }

    get innerText() {
        let str = "";
        for (let node = this.fch; node;
            //@ts-ignore
            (node = this.getNextChild(node))) {
            str += node.innerText;
        }
        return str;
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(v: string) {

        if (typeof v == "string") {
            this.setAttribute("value", v);
            this.bubbleUpdate();
        }
    }

    set innerText(e) { }

    get parentNode() {
        return this.par;
    }

    bubbleUpdate() {
        if (this.par)
            this.par.bubbleUpdate();
    }
}

ll.mixinTree(HTMLNode);


/**
 * Builds an HTML AST. 
 * @function
 * @param {string} html_string - A string containing HTML data.
 * @param {string} css_string - An existing CSSRootNode to merge with new `selectors` and `rules`.
 * @return {Promise} Returns a `Promise` that will return a new or existing CSSRootNode.
 * @memberof module:wick.core
 * @alias html
 */
const HTMLParser = (html_string, root = null) => (
    root = (!root || !(root instanceof HTMLNode))
        ? new HTMLNode()
        : root, root.parse(wind(html_string.replace(/\&lt;/g, "<").replace(/\&gt;/g, ">")))
);

export { HTMLNode, HTMLParser, TextNode };

let SERVER_SET = false;

HTMLParser.server = function () {

    if (SERVER_SET) return;

    SERVER_SET = true;

    if (typeof (global) !== "undefined") {
        //@ts-ignore
        global.HTMLElement = HTMLNode;
        //@ts-ignore
        global.TextNode = TextNode;
        //@ts-ignore
        global.Text = TextNode;

        const document = {
            createElementNS: function (ns, tag) {
                let node = new HTMLElement();
                //@ts-ignore
                node.tag = tag.toString().toLowerCase();
                return node;
            },
            createElement: function (tag) {
                let node = new HTMLElement();
                //@ts-ignore
                node.tag = tag.toString().toLowerCase();
                return node;
            },
            createTextNode: function (text) {
                let node = new TextNode(text);
                return node;
            }
        };
        //@ts-ignore
        document.head = document.createElement("head");
        //@ts-ignore
        document.body = document.createElement("body");

        Object.assign(global, {
            window: { document },
            document
        });
    }


    //@ts-ignore
    HTMLNode.prototype.attachShadow = function (mode, blah) {

        if (this.shadow)
            throw new Error(`InvalidStateError: Cannot attach a shadow DOM to an element that already has a shadow DOM`);

        if ([
            "article",
            "aside",
            "blockquote",
            "body",
            "div",
            "footer",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "header",
            "main",
            "nav",
            "p",
            "section",
            "span"
        ].includes(this.tag)) {
            this.shadow = new HTMLNode;
            this.shadow.tag = "SHADOW";
            this.shadow.parent = this;
            return this.shadow;
        } else {
            throw new Error(`NotSupportedError: Cannot attach a shadow DOM to a ${this.tag || "undefined"} element`);
        }
    };
    //@ts-ignore
    HTMLNode.prototype.replaceNode = function (newNode, oldNode) {
        if (oldNode.par == this) {
            ll.methods.parent_child.insertBefore.call(oldNode, newNode);
            oldNode.parent = null;
        }

        this.bubbleUpdate();

        return newNode;
    };

    //@ts-ignore
    HTMLNode.prototype.replaceWith = function (newNode) {
        return this.parent.replaceChild(newNode, this);
    };

    //@ts-ignore
    HTMLNode.prototype.insertBefore = function (newNode, oldNode) {
        if (oldNode && oldNode.par == this)
            this.addChild(newNode, oldNode);
        else
            this.addChild(newNode, oldNode);

    };

    //@ts-ignore
    HTMLNode.prototype.replaceChild = function (newNode, oldNode) {

        if (oldNode.par == this) {
            ll.methods.parent_child.insertAfter.call(oldNode, newNode);
            oldNode.parent = null;
        }

        this.bubbleUpdate();

        return newNode;
    };

    //@ts-ignore
    HTMLNode.prototype.hasChildNodes = function () {
        return !!this.fch;
    };

    //@ts-ignore
    HTMLNode.prototype.previousSibling = function () {
        return this.pre;
    };

    //@ts-ignore
    HTMLNode.prototype.nextSibling = function () {
        return this.nxt;
    };

    //@ts-ignore
    /*
    HTMLNode.prototype.childNodes = function () {
        return new Proxy(this, {
            get: function (obj, prop) {

                if (!isNaN(<number>prop)) {
                    return obj.children[prop];
                }

                if (prop == "length") {
                    return this.noc;
                }
            }
        });
    };
    */
    //@ts-ignore
    HTMLNode.prototype.getStyleObject = function () {
        return {};
    };
    //@ts-ignore
    HTMLNode.prototype.addEventListener = function (event, func) {
        event = event + "";
        if (!this.__events__)
            this.__events__ = new Map();

        if (!this.__events__.has(event))
            this.__events__.set(event, new Set);

        this.__events__.get(event).add(func);
    };
    //@ts-ignore
    HTMLNode.prototype.removeEventListener = function (event, func) {
        event = event + "";
        if (!this.__events__) return;
        if (this.__events__.has(event))
            this.__events__.get(event).delete(func);
    };
    //@ts-ignore
    HTMLNode.prototype.runEvent = HTMLNode.prototype.dispatchEvent = function (event_name, event_object) {

        event_object.target = this;

        if (this.__events__ && this.__events__.has(event_name + ""))
            for (const funct of this.__events__.get(event_name + "").values())
                funct(event_object);

        this.bubbleUpdate();
    };
    //@ts-ignore
    HTMLNode.prototype.contains = function (otherNode) {
        let node = otherNode;
        while (node.par) {
            if (node.par == this)
                return true;
            node = node.par;
        }
        return false;
    };
    //@ts-ignore
    HTMLNode.prototype.appendChild = function (child) {
        this.addChild(child);
    };


};

export default HTMLParser;
/**
 * Returns a valid tag name identifier or an empty string, 
 * along with a Lexer position at the next non-whitespace
 * object after the tag identifier. 
 * @param lex - A Lexer object
 * @returns 
 */
function parseTagName(lex: Lexer) {

    const pk = lex.copy();

    pk.IGNORE_WHITE_SPACE = false;

    while (!pk.END && (pk.ty == pk.types.id || pk.tx == "-" || pk.tx == "_"))
        pk.next();


    const tag_name = ((pk.off > lex.off) ? pk.slice(lex) : "").toLowerCase().trim();


    pk.IGNORE_WHITE_SPACE = true;

    pk.tl = 0;
    pk.next();

    return { tag_name, parse_head: pk };
}

