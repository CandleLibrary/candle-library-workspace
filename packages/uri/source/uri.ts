let fetch_reference = (typeof window !== "undefined") ? window.fetch : null;

const uri_reg_ex = /(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:\/\/))?(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:([^\<\>\:\?\[\]\@\/\#\b\s]*)?)?\@)?(?:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|((?:\[[0-9a-f]{1,4})+(?:\:[0-9a-f]{0,4}){2,7}\])|([^\<\>\:\?\[\]\@\/\#\b\s\.]{2,}(?:\.[^\<\>\:\?\[\]\@\/\#\b\s]*)*))?(?:\:(\d+))?((?:[^\?\[\]\#\s\b]*)+)?(?:\?([^\[\]\#\s\b]*))?(?:\#([^\#\s\b]*))?/i;
const root_reg = /^\/|^\w+\:|^\\\\/;
const relative_regex = /^(\.+\/)|^w/;
const double_forward_regex = /\/\//g;

const isPOSIX = (() => {
    return process.platform !== "win32";
})();

const STOCK_LOCATION = {
    protocol: "",
    host: "",
    port: "",
    path: "",
    hash: "",
    query: "",
    search: "",
    hostname: "",
    pathname: ""
};

const fetch_not_found_error_message = `'fetch' function is not defined`;

function getCORSModes(uri: URI) {
    const IS_CORS = (URI.GLOBAL.host !== uri.host && !!uri.host);
    return {
        IS_CORS,
        mode: IS_CORS ? "cors" : "same-origin", // CORs not allowed
        credentials: IS_CORS ? "omit" : "include",
    };
}

function fetchLocalText(uri: URI, m = "cors"): Promise<string> {

    return new Promise((res, rej) => {

        if (!fetch_reference) throw new Error(fetch_not_found_error_message);

        fetch_reference(uri + "", <RequestInit>Object.assign({
            method: "GET",
        }, getCORSModes(uri))).then(r => {

            if (r.status < 200 || r.status > 299)
                r.text().then(rej);
            else
                r.text().then(res);
        }).catch(e => rej(e));
    });
}

function fetchLocalJSON(uri: URI, m = "cors"): Promise<object> {
    return new Promise((res, rej) => {

        if (!fetch_reference) throw new Error(fetch_not_found_error_message);

        fetch_reference(uri + "", <RequestInit>Object.assign({
            method: "GET"
        }, getCORSModes(uri))).then(r => {
            if (r.status < 200 || r.status > 299)
                r.json().then(rej);
            else
                r.json().then(res).catch(rej);
        }).catch(e => rej(e));
    });
}

function fetchLocalBuffer(uri: URI, m = "cors"): Promise<ArrayBuffer> {
    return new Promise((res, rej) => {

        if (!fetch_reference) throw new Error(fetch_not_found_error_message);

        fetch_reference(uri + "", <RequestInit>Object.assign({
            method: "GET"
        }, getCORSModes(uri))).then(r => {
            if (r.status < 200 || r.status > 299)
                r.text().then(rej);
            else
                r.arrayBuffer().then(res).catch(rej);
        }).catch(e => rej(e));
    });
}

function submitForm(uri: URI, form_data: any, m = "same-origin") {
    return new Promise((res, rej) => {
        var form;

        if (form_data instanceof FormData)
            form = form_data;
        else {
            form = new FormData();
            for (let name in form_data)
                form.append(name, form_data[name] + "");
        }

        if (!fetch_reference) throw new Error(fetch_not_found_error_message);

        fetch_reference(uri + "", <RequestInit>Object.assign({
            method: "POST",
            body: form
        }, getCORSModes(uri))).then(r => {
            if (r.status < 200 || r.status > 299)
                r.text().then(rej);
            else
                r.json().then(res);
        }).catch(e => e.text().then(rej));
    });
}

function submitJSON(uri: URI, json_data: any) {
    const data = JSON.stringify(json_data);
    return new Promise((res, rej) => {

        if (!fetch_reference) throw new Error(fetch_not_found_error_message);

        fetch_reference(uri + "", <RequestInit>Object.assign({
            method: "POST",
            body: data,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }, getCORSModes(uri))).then(r => {
            if (r.status < 200 || r.status > 299)
                r.json().then(rej);
            else
                r.json().then(res);
        }).catch(e => e.text().then(rej));
    });
}

function toWindowsPath(path: string): string {
    return path.replace(/\//g, "\\");
}

function toPosixPath(path: string): string {
    return path.replace(/\\/g, "/");
}

/**
 *  Encapsulates a URI string and provides methods to manipulate the URI segments and send and retrieve data.
 * @type {URI}
 */
class URI {
    /**
     * @deprecated
     */

    static polyfill: (dir?: string) => Promise<void>;

    /**
     * Prepares URI to operate in a NodeJS environment.
     * 
     * Call before using any IO methods. 
     */
    static server: (dir?: string) => Promise<void>;

    static simulate: () => void;
    /**
     * A Global URI object that points to the current execution environment location.
     */
    static GLOBAL: URI;

    /**
     * Cache for resolved resources
     */
    static RC: Map<string, any>;

    /**
     * URI protocol segment
     */
    protocol: string;

    /**
     * Username segment
     */
    user: string;

    /**
     * Password segment
     */
    pwd: string;

    /**
     * Hostname segment
     */
    host: string;

    /**
     * Network port number segment
     */
    port: number;

    /**
     * Resource path segment
     */
    path: string;

    /**
     * Query segment
     */
    query: string;

    /**
     * Hash segment
     */
    hash: string;

    /**
     * Map of the query data
     */
    map: Map<string, any> | null;

    /** 
     * Allows simulated resources to be added as a key value pair, were the key is a URI string and the value is string data.
     * 
     * Fetch requests to matching URI will return the value string as a reply.
     */
    static addResource: (n: string, v: string) => void;

    /**
     * Resolves a URI relative to an original uri. If the environment is NodeJS, 
     * then node_module resolution may be used if the relative path
     * does not begin with a ./ or ../.
     * @param {URI | string} URL_or_url_new 
     * @param {URI | string} URL_or_url_original 
     */
    static resolveRelative(
        URL_or_url_new: URI | string,
        URL_or_url_original: URI | string
            = (URI.GLOBAL)
                ? URI.GLOBAL
                : (typeof document != "undefined" && typeof document.location != "undefined")
                    ? document.location.toString()
                    : ""
    ): URI | null {
        const
            URL_old = new URI(URL_or_url_original),
            URL_new = new URI(URL_or_url_new);

        if (!(URL_old + "") || !(URL_new + "")) return null;

        if (URL_new.IS_RELATIVE) {

            let old = URL_old.path.split("/").slice(0, -1);
            let nw = URL_new.path.split("/");

            for (let i = 0; i < nw.length; i++) {
                switch (nw[i].replace(/\.\.+/g, "..")) {
                    case ".": old.splice(old.length - 1, 0);
                        break;
                    case "..":
                        old.splice(old.length - 1, 1);
                        break;
                    default:
                        old.push(nw[i]);
                }
            }

            URL_new.path = old.join("/").replace(/\/\//g, "/");
        }
        return URL_new;
    }

    /**
     * Fetch resource using the Fetch API 
     * 
     * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
     */
    async fetch(init?: RequestInit): Promise<Response> {
        return fetch_reference ? fetch_reference(this + "", init) : createResponse("", this + "");
    }


    /**
     * Add a protocol handler to work with fetch requests. 
     */
    static addProtocolHandler() {

    }

    /**
     * Create new URI object.
     * @param {URI | string | Location} [uri=""] A string or another {URI} object that will populate the URI segment properties. 
     * @param {boolean} [USE_LOCATION=false] If the uri argument is blank or {undefined} then URI will pulled from the document's location.
     */
    constructor(uri: string | URI | Location = "", USE_LOCATION = false) {

        this.protocol = "";
        this.user = "";
        this.pwd = "";
        this.host = "";
        this.port = 0;
        this.path = "";
        this.query = "";
        this.hash = "";
        this.map = null;

        let
            IS_STRING = true,
            IS_LOCATION = false,
            location = (typeof (document) !== "undefined") ? document.location : STOCK_LOCATION;

        if (typeof (Location) !== "undefined" && uri instanceof Location) {
            location = uri;
            uri = "";
            IS_LOCATION = true;
        }

        if ((!uri || typeof (uri) != "string") && !(<unknown>uri instanceof URI)) {
            IS_STRING = false;

            IS_LOCATION = true;

            if (URI.GLOBAL && USE_LOCATION)
                return URI.GLOBAL;
        }


        if (uri instanceof URI) {
            this.protocol = uri.protocol;
            this.user = uri.user;
            this.pwd = uri.pwd;
            this.host = uri.host;
            this.port = uri.port;
            this.path = toPosixPath(uri.path.replace(double_forward_regex, "/"));
            this.query = uri.query;
            this.hash = uri.hash;
        } else if (IS_STRING) {
            let part = (<string>uri).match(uri_reg_ex);

            //If the complete string is not matched than we are dealing with something other 
            //than a pure URI. Thus, no object is returned. 
            if (!part || part[0] !== uri) return new URI("localhost");

            this.protocol = part[1] || ((USE_LOCATION) ? location.protocol : "");
            this.user = part[2] || "";
            this.pwd = part[3] || "";
            this.host = part[4] || part[5] || part[6] || ((USE_LOCATION) ? location.hostname : "");
            this.port = parseInt(part[7]) || ((USE_LOCATION) ? parseInt(location.port) : 0);
            this.path = toPosixPath((part[8] || ((USE_LOCATION) ? location.pathname : "")).replace(double_forward_regex, "/"));
            this.query = part[9] || ((USE_LOCATION) ? location.search.slice(1) : "");
            this.hash = part[10] || ((USE_LOCATION) ? location.hash.slice(1) : "");

        } else if (IS_LOCATION && location) {
            this.protocol = location.protocol.replace(/\:/g, "");
            this.host = location.hostname;
            this.port = parseInt(location.port);
            this.path = toPosixPath(location.pathname.replace(double_forward_regex, "/"));
            this.hash = location.hash.slice(1);
            this.query = location.search.slice(1);
            this._getQuery_();

            if (USE_LOCATION) {
                URI.GLOBAL = this;
                return URI.GLOBAL;
            }
        }
        this._getQuery_();
    }

    /**
     * Pulls query string info into this.map
     * @private
     */
    private _getQuery_() {
        if (this.query) {
            const data = this.query
                .split(/(?<!\\)\&/g)
                .map(s => s.split("="));

            //@ts-ignore
            this.map = new Map<string, string>(data);
        }
    }
    /**
     * Create new URI with the path changed to match the argument
     * 
     * @param path - New path 
     * @returns {URI}
     */
    setPath(path: string): URI {

        this.path = path;

        return this;
    }
    /**
    *  Changes the document's location to match the URI.
    */
    setLocation() {
        history.replaceState({}, "replaced state", `${this}`);
    }

    async DOES_THIS_EXIST() { return true; }

    toString() {
        let str = [];

        if (this.host) {

            if (this.protocol)
                str.push(`${this.protocol}://`);

            str.push(`${this.host}`);
        }

        if (this.port)
            str.push(`:${this.port}`);

        if (this.path) {
            const path = `${this.IS_RELATIVE || this.IS_ROOT ? "" : "/"}${this.path}`.replace(/\/\//g, "/");

            if (isPOSIX)
                str.push(toPosixPath(path));
            else
                str.push(toWindowsPath(path));
        }

        if (this.query)
            str.push(((this.query[0] == "?" ? "" : "?") + this.query));

        if (this.hash)
            str.push("#" + this.hash);


        return str.join("");
    }

    /**
     * Pulls data stored in query string into an object an returns that.
     * @param  {string}  class_name  The class name
     * @return {any}  The data.
     */
    getData(): any {
        const data: any = {};
        if (this.map)
            for (const [key, val] of this.map.entries()) {
                if (!val)
                    data[key] = true;
                else
                    data[key] = val;
            }

        return data;
    }

    /**
     * Sets the data in the query string. Wick data is added after a second `?` character in the query field, 
     * and appended to the end of any existing data.
     * 
     * @param {any}  data An object with prop_name/value pairs that will be inserted into the query string.
    */
    setData(data: any) {

        const query_string = [];

        for (const name in data) {
            const val = data[name];
            if (typeof val == "boolean") {
                if (val) query_string.push(name);
            } else
                query_string.push(`${name}=${val.toString()}`);
        }

        this.query = (query_string.length > 0 ? "?" + query_string.join("&") : "").replace(/\ +/g, "%20");

        return this;
    }


    /**
     * Fetch a text string representation of the remote resource using HTTP. 
     * Just uses path component of URI. Must be from the same origin.
     * @return     {Promise}  A promise object that resolves to a string of the fetched value.
     */
    fetchText(): Promise<string> {

        return fetchLocalText(this).then(res => (URI.RC.set(this.path, res), res));
    }

    /**
     * Fetch a JSON object representation of the remote resource. 
     * Just uses path component of URI. Must be from the same origin.
     * @return     {Promise}  A promise object that resolves to a JavaScript object of the fetched value.
     */
    fetchJSON(): Promise<object> {

        return fetchLocalJSON(this).then(res => (URI.RC.set(this.path, res), res));
    }

    /**
     * Fetch an ArrayBuffer representation of the remote resource. 
     * Just uses path component of URI. Must be from the same origin.
     * @return     {Promise}  A promise object that resolves to an ArrayBuffer of the fetched value.
     */
    fetchBuffer(): Promise<ArrayBuffer> {

        return fetchLocalBuffer(this).then(res => (URI.RC.set(this.path, res), res));
    }

    submitForm(form_data: any) {
        return submitForm(this, form_data);
    }

    submitJSON(json_data: any, mode: any) {
        return submitJSON(this, json_data);
    }

    /**
     * @deprecated Goes to the current URI.
     */
    goto() {
        return;
        //let uri = this.toString();
        //history.pushState({}, "ignored title", uri);
        //window.onpopstate();
        //URI.GLOBAL = this;
    }

    /**
     * Name of the file plus the extension in the path
     * @readonly
     */
    get file() {
        return this.path.split("/").pop() ?? "";
    }

    /**
     * Name of the filename minus the extension in the path
     * of the URI path
     * @readonly
     */
    get filename(): string {
        return this.file.split(".").shift() ?? "";
    }

    /**
     * Directory segment of the path.
     * @readonly
     */
    get dir(): string {
        return (this.path.split("/").slice(0, -1).join("/") + "/").replace(/\/\//g, "/");
    }

    /**
    * Alias of path property
    * @readonly
    */
    get pathname(): string {
        return this.path;
    }

    /**
     * Alias of URI~toString()
     * @readonly
     */
    get href(): string {
        return this.toString();
    }

    /**
    * Portion of the path following the last [\.]
    * if such a segment exists within the path.
    * @readonly
    */
    get ext(): string {
        const m = this.file.match(/\.([^\.]*)$/);
        return m ? m[1] : "";
    }

    set ext(ext) {

        ext = "." + ext.replace(/\./g, "");

        const current_ext = this.ext;

        if (current_ext)
            this.path = this.path.replace("." + current_ext, ext);
        else this.path += ext;
    }

    /**
     * Alias of URI~query
     * @readonly
     */
    get search(): string {
        return this.query;
    }

    /**
     * True if the path portion of the URI is a relative path. 
     * 
     * Path must begin with `../` or `./` to be considered relative.
     * 
     * @readonly
     */
    get IS_RELATIVE(): boolean {

        return relative_regex.test(this.path);
    }

    /**
     * True if the path segment begins with root patterns
     * 
     * examples
     * 
     * - Windows Drive : `C:...` `c:...` `a:...`
     * - UNC Path : `\\...`
     * - Posix Root:` /...`
     */
    get IS_ROOT(): boolean {
        return !!root_reg.test(this.path);
    }

    static getEXEURL(imp: ImportMeta): URI {

        let str = imp.url ?? "";

        const exe_url = new URI(str);

        if (exe_url.protocol == "file") {
            exe_url.protocol = "";
        } else if (exe_url.protocol != "")
            return exe_url;

        return new URI(exe_url);
    }
    static getCWDURL(): URI { return URI.GLOBAL; }

    /**
     * Returns a new URI that has a relative
     * path from this URI to the goal location.
     */
    getRelativeTo(goal: string | URI): URI {

        const to = new URI(goal);

        /* Find root direct in source. This is
           this is the first directory with the 
           same name in both paths from right
           to left.
        */
        const pathA = this.dir.split("/").filter(s => !!s && s !== ".");
        const pathB = to.dir.split("/").filter(s => !!s && s !== ".");
        let indiceA = 0, indiceB = 0, max = pathA.length - 1;

        for (let j = pathA.length - 1; j >= 0; j--) {
            for (let i = pathB.length - 1; i >= 0; i--) {
                let id = i + 1, jd = j + 1, length = 0;
                while (--id >= 0 && --jd >= 0 && pathB[id] == pathA[jd]) length++;
                if (length > 0 && length <= max && (j == 0 || to.IS_RELATIVE)) {
                    max = length;
                    indiceA = j + 1;
                    indiceB = i + 1;
                }
            }
        }

        // If common name found then replace all elements in pathA with
        // ../ that proceed this common name. Remove all elements in pathB
        // that proceed common name. 
        const new_path =
            pathA.slice(indiceA).map(_ => "..")
                .concat(pathB.slice(indiceB))
                .concat(to.file).join("/");
        to.path = new_path;


        return to;
    }

    /**
     * Compares the path of the given uri with its own path.
     * If own path is absolute then returns true if the arg uri path is an leading substring of 
     * this path. 
     */
    isSUBDIRECTORY_OF(candidate_parent: URI): boolean {

        if (candidate_parent.IS_RELATIVE) return false;

        const own_path = (
            this.IS_RELATIVE
                ? URI.resolveRelative(this, candidate_parent) || new URI
                : this
        )
            .dir.split("/").slice(0, -1),
            candidate_path = candidate_parent.dir.split("/").slice(0, -1);

        if (candidate_path.length >= own_path.length) return false;

        for (let i = 0; i < candidate_path.length; i++)
            if (candidate_path[i] !== own_path[i]) return false;

        return true;
    }
}
/**
 * The fetched resource cache.
 */
URI.RC = new Map();

/**
 * The Default Global URI object. 
 */
URI.GLOBAL = (typeof location != "undefined") ? new URI(location) : new URI;


let SIMDATA: any = null;

/** Replaces the fetch actions with functions that simulate network fetches. Resources are added by the user to a Map object. */
URI.simulate = function () {
    SIMDATA = new Map;
    //@ts-ignore
    URI.prototype.fetchText = async d => ((d = this.toString()), SIMDATA.get(d)) ? SIMDATA.get(d) : "";
    //@ts-ignore
    URI.prototype.fetchJSON = async d => ((d = this.toString()), SIMDATA.get(d)) ? JSON.parse(SIMDATA.get(d).toString()) : {};
};

URI.addResource = (n, v) => (n && v && (SIMDATA || (SIMDATA = new Map())) && SIMDATA.set(n.toString(), v.toString));

type URLPolyfilledGlobal = {
    document: {
        location: URI;
    };
    location: URI;

    fetch: (uri: string, data: any) => Promise<any>;

};

let POLYFILLED = false;

URI.server = (
    typeof globalThis["process"] == "undefined" ?
        async () => { }
        :
        async function (root_dir?: string) {

            root_dir = root_dir || process.cwd() + "/";

            try {
                const fsr = await import("fs");
                const fs = fsr.promises;
                const path = (await import("path"));
                const http = (await import("http"));

                if (typeof (global) !== "undefined" && !POLYFILLED) {



                    POLYFILLED = true;


                    URI.GLOBAL = new URI(root_dir);

                    const
                        //@ts-ignore
                        g: URLPolyfilledGlobal = <unknown>global;

                    g.document = g.document || <URLPolyfilledGlobal>{};
                    g.document.location = URI.GLOBAL;
                    g.location = URI.GLOBAL;

                    const cached = URI.resolveRelative;

                    URI.resolveRelative = function (new_url, old_url = URI.GLOBAL) {

                        let
                            URL_old = new URI(old_url),
                            URL_new = new URI(new_url);

                        if (!URL_new.IS_RELATIVE && !URL_new.IS_ROOT) {

                            //Attempt to resolve the file from the node_modules directories.

                            /**
                             * This uses the classical node_modules lookup.
                             * 
                             * TODO handle resolution of modules with a more general method. 
                             * See yarn Plug'n'Play: https://yarnpkg.com/features/pnp
                             */

                            const
                                base_path = URL_old.path.split("/").filter(s => s !== ".."),
                                new_path = URL_new + "";

                            let i = base_path.length;

                            while (i-- >= 1) {
                                try {
                                    var search_path;


                                    if (base_path[i] == "node_modules")
                                        search_path = new URI([...base_path.slice(0, i + 1), new_path].join("/"));
                                    else {

                                        search_path = new URI([...base_path.slice(0, i + 1), "node_modules", new_path].join("/"));
                                    }

                                    const stats = fsr.statSync(search_path + "");

                                    if (stats)
                                        return new URI(search_path + "");

                                } catch (e) {
                                    //Suppress errors - Don't really care if there is no file found. That can be handled by the consumer.
                                }
                            }

                            return URL_new;
                        }

                        return cached(URL_new, URL_old);
                    };

                    /**
                     * Global `fetch` polyfill - basic support
                     */
                    fetch_reference = g.fetch = <any>(
                        async (uri: string, data: ResponseInit & { IS_CORS: boolean; }): Promise<Response> => {

                            if (data?.IS_CORS) { // HTTP Fetch
                                return new Promise((res, rej) => {
                                    try {

                                        http.get(uri, data, req => {

                                            let body = "";

                                            req.setEncoding('utf8');

                                            req.on("data", d => {
                                                body += d;
                                            });

                                            req.on("end", () => res(createResponse(body, uri + "")));
                                        });
                                    } catch (e) {
                                        rej(e);
                                    }
                                });


                            } else { //FileSystem Fetch
                                try {
                                    let
                                        p = path.resolve(process.cwd(), "" + uri);

                                    const body = await fs.readFile(p);

                                    return createResponse(body, uri + "");
                                } catch (err) {
                                    throw err;
                                }
                            }
                        });

                    URI.prototype.DOES_THIS_EXIST = async function () {
                        if (!this.IS_RELATIVE)
                            return !!(await fs.stat(this.toString()).catch(e => false));
                        return false;
                    };
                }
            } catch (e) {
                console.error("Unable to load URI.server. Is this package running on a browser?");
                return;
            }
        });

Object.freeze(URI.RC);

Object.seal(URI);

export default URI;

function createResponse(body: string | Buffer, url: string): Response {
    return {
        get type() { return <ResponseType>"basic"; },
        get ok() { return true; },
        get bodyUsed() { return true; },
        get redirected() { return false; },
        get status() { return 200; },
        get statusText() { return "200"; },
        get headers() { return <any>null; },
        //@ts-ignore
        get body() { return Uint8Array.from(body); },
        get trailer() { return (async () => null)(); },

        get url() { return url; },

        clone() { return createResponse(body, url); },

        formData: () => <any>null,

        text: async () => body instanceof Buffer ? body.toString("utf8") : body,

        json: async () => JSON.parse(body instanceof Buffer ? body.toString("utf8") : body),

        arrayBuffer: async () => body instanceof Buffer ? body.buffer : Buffer.from(body),

        //blob: async () => Uint8Array.from(body instanceof Buffer ? body : Buffer.from(body)),

    };
}
