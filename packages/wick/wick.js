(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // ../uri/build/uri.js
  var fetch_reference = typeof window !== "undefined" ? window.fetch : null;
  var uri_reg_ex = /(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:\/\/))?(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:([^\<\>\:\?\[\]\@\/\#\b\s]*)?)?\@)?(?:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|((?:\[[0-9a-f]{1,4})+(?:\:[0-9a-f]{0,4}){2,7}\])|([^\<\>\:\?\[\]\@\/\#\b\s\.]{2,}(?:\.[^\<\>\:\?\[\]\@\/\#\b\s]*)*))?(?:\:(\d+))?((?:[^\?\[\]\#\s\b]*)+)?(?:\?([^\[\]\#\s\b]*))?(?:\#([^\#\s\b]*))?/i;
  var root_reg = /^\/|^\w+\:|^\\\\/;
  var relative_regex = /^(\.+\/)|^w/;
  var double_forward_regex = /\/\//g;
  var isPOSIX = (() => {
    if ("process" in globalThis)
      return process.platform !== "win32";
    return true;
  })();
  var STOCK_LOCATION = {
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
  var fetch_not_found_error_message = `'fetch' function is not defined`;
  function getCORSModes(uri) {
    const IS_CORS = URI.GLOBAL.host !== uri.host && !!uri.host;
    return {
      IS_CORS,
      mode: IS_CORS ? "cors" : "same-origin",
      credentials: IS_CORS ? "omit" : "include"
    };
  }
  function fetchLocalText(uri, m = "cors") {
    return new Promise((res, rej) => {
      if (!fetch_reference)
        throw new Error(fetch_not_found_error_message);
      fetch_reference(uri + "", Object.assign({
        method: "GET"
      }, getCORSModes(uri))).then((r) => {
        if (r.status < 200 || r.status > 299)
          r.text().then(rej);
        else
          r.text().then(res);
      }).catch((e) => rej(e));
    });
  }
  function fetchLocalJSON(uri, m = "cors") {
    return new Promise((res, rej) => {
      if (!fetch_reference)
        throw new Error(fetch_not_found_error_message);
      fetch_reference(uri + "", Object.assign({
        method: "GET"
      }, getCORSModes(uri))).then((r) => {
        if (r.status < 200 || r.status > 299)
          r.json().then(rej);
        else
          r.json().then(res).catch(rej);
      }).catch((e) => rej(e));
    });
  }
  function fetchLocalBuffer(uri, m = "cors") {
    return new Promise((res, rej) => {
      if (!fetch_reference)
        throw new Error(fetch_not_found_error_message);
      fetch_reference(uri + "", Object.assign({
        method: "GET"
      }, getCORSModes(uri))).then((r) => {
        if (r.status < 200 || r.status > 299)
          r.text().then(rej);
        else
          r.arrayBuffer().then(res).catch(rej);
      }).catch((e) => rej(e));
    });
  }
  function submitForm(uri, form_data, m = "same-origin") {
    return new Promise((res, rej) => {
      var form;
      if (form_data instanceof FormData)
        form = form_data;
      else {
        form = new FormData();
        for (let name2 in form_data)
          form.append(name2, form_data[name2] + "");
      }
      if (!fetch_reference)
        throw new Error(fetch_not_found_error_message);
      fetch_reference(uri + "", Object.assign({
        method: "POST",
        body: form
      }, getCORSModes(uri))).then((r) => {
        if (r.status < 200 || r.status > 299)
          r.text().then(rej);
        else
          r.json().then(res);
      }).catch((e) => e.text().then(rej));
    });
  }
  function submitJSON(uri, json_data) {
    const data = JSON.stringify(json_data);
    return new Promise((res, rej) => {
      if (!fetch_reference)
        throw new Error(fetch_not_found_error_message);
      fetch_reference(uri + "", Object.assign({
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      }, getCORSModes(uri))).then((r) => {
        if (r.status < 200 || r.status > 299)
          r.json().then(rej);
        else
          r.json().then(res);
      }).catch((e) => e.text().then(rej));
    });
  }
  function toWindowsPath(path) {
    return path.replace(/\//g, "\\");
  }
  function toPosixPath(path) {
    return path.replace(/\\/g, "/");
  }
  var URI = class {
    constructor(uri = "", USE_LOCATION = false) {
      this.protocol = "";
      this.user = "";
      this.pwd = "";
      this.host = "";
      this.port = 0;
      this.path = "";
      this.query = "";
      this.hash = "";
      this.map = null;
      let IS_STRING = true, IS_LOCATION = false, location2 = typeof document !== "undefined" ? document.location : STOCK_LOCATION;
      if (typeof Location !== "undefined" && uri instanceof Location) {
        location2 = uri;
        uri = "";
        IS_LOCATION = true;
      }
      if ((!uri || typeof uri != "string") && !(uri instanceof URI)) {
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
        let part = uri.match(uri_reg_ex);
        if (!part || part[0] !== uri)
          return new URI("localhost");
        this.protocol = part[1] || (USE_LOCATION ? location2.protocol : "");
        this.user = part[2] || "";
        this.pwd = part[3] || "";
        this.host = part[4] || part[5] || part[6] || (USE_LOCATION ? location2.hostname : "");
        this.port = parseInt(part[7]) || (USE_LOCATION ? parseInt(location2.port) : 0);
        this.path = toPosixPath((part[8] || (USE_LOCATION ? location2.pathname : "")).replace(double_forward_regex, "/"));
        this.query = part[9] || (USE_LOCATION ? location2.search.slice(1) : "");
        this.hash = part[10] || (USE_LOCATION ? location2.hash.slice(1) : "");
      } else if (IS_LOCATION && location2) {
        this.protocol = location2.protocol.replace(/\:/g, "");
        this.host = location2.hostname;
        this.port = parseInt(location2.port);
        this.path = toPosixPath(location2.pathname.replace(double_forward_regex, "/"));
        this.hash = location2.hash.slice(1);
        this.query = location2.search.slice(1);
        this._getQuery_();
        if (USE_LOCATION) {
          URI.GLOBAL = this;
          return URI.GLOBAL;
        }
      }
      this._getQuery_();
    }
    static resolveRelative(URL_or_url_new, URL_or_url_original = URI.GLOBAL ? URI.GLOBAL : typeof document != "undefined" && typeof document.location != "undefined" ? document.location.toString() : "") {
      const URL_old = new URI(URL_or_url_original), URL_new = new URI(URL_or_url_new);
      if (!(URL_old + "") || !(URL_new + ""))
        return null;
      if (URL_new.IS_RELATIVE) {
        let old = URL_old.path.split("/").slice(0, -1);
        let nw = URL_new.path.split("/");
        for (let i = 0; i < nw.length; i++) {
          switch (nw[i].replace(/\.\.+/g, "..")) {
            case ".":
              old.splice(old.length - 1, 0);
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
    async fetch(init) {
      return fetch_reference ? fetch_reference(this + "", init) : createResponse("", this + "");
    }
    static addProtocolHandler() {
    }
    _getQuery_() {
      if (this.query) {
        const data = this.query.split(/(?<!\\)\&/g).map((s) => s.split("="));
        this.map = new Map(data);
      }
    }
    setPath(path) {
      this.path = path;
      return this;
    }
    setLocation() {
      history.replaceState({}, "replaced state", `${this}`);
    }
    async DOES_THIS_EXIST() {
      return true;
    }
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
        str.push((this.query[0] == "?" ? "" : "?") + this.query);
      if (this.hash)
        str.push("#" + this.hash);
      return str.join("");
    }
    getData() {
      const data = {};
      if (this.map)
        for (const [key, val] of this.map.entries()) {
          if (!val)
            data[key] = true;
          else
            data[key] = val;
        }
      return data;
    }
    setData(data) {
      const query_string = [];
      for (const name2 in data) {
        const val = data[name2];
        if (typeof val == "boolean") {
          if (val)
            query_string.push(name2);
        } else
          query_string.push(`${name2}=${val.toString()}`);
      }
      this.query = (query_string.length > 0 ? "?" + query_string.join("&") : "").replace(/\ +/g, "%20");
      return this;
    }
    fetchText() {
      return fetchLocalText(this).then((res) => (URI.RC.set(this.path, res), res));
    }
    fetchJSON() {
      return fetchLocalJSON(this).then((res) => (URI.RC.set(this.path, res), res));
    }
    fetchBuffer() {
      return fetchLocalBuffer(this).then((res) => (URI.RC.set(this.path, res), res));
    }
    submitForm(form_data) {
      return submitForm(this, form_data);
    }
    submitJSON(json_data, mode) {
      return submitJSON(this, json_data);
    }
    goto() {
      return;
    }
    get file() {
      return this.path.split("/").pop() ?? "";
    }
    get filename() {
      return this.file.split(".").shift() ?? "";
    }
    get dir() {
      return (this.path.split("/").slice(0, -1).join("/") + "/").replace(/\/\//g, "/");
    }
    get pathname() {
      return this.path;
    }
    get href() {
      return this.toString();
    }
    get ext() {
      const m = this.file.match(/\.([^\.]*)$/);
      return m ? m[1] : "";
    }
    set ext(ext) {
      ext = "." + ext.replace(/\./g, "");
      const current_ext = this.ext;
      if (current_ext)
        this.path = this.path.replace("." + current_ext, ext);
      else
        this.path += ext;
    }
    get search() {
      return this.query;
    }
    get IS_RELATIVE() {
      return relative_regex.test(this.path);
    }
    get IS_ROOT() {
      return !!root_reg.test(this.path);
    }
    static getEXEURL(imp) {
      let str = imp.url ?? "";
      const exe_url = new URI(str);
      if (exe_url.protocol == "file") {
        exe_url.protocol = "";
      } else if (exe_url.protocol != "")
        return exe_url;
      return new URI(exe_url);
    }
    static getCWDURL() {
      return URI.GLOBAL;
    }
    getRelativeTo(goal) {
      const to = new URI(goal);
      const pathA = this.dir.split("/").filter((s) => !!s && s !== ".");
      const pathB = to.dir.split("/").filter((s) => !!s && s !== ".");
      let indiceA = 0, indiceB = 0, max = pathA.length - 1;
      for (let j = pathA.length - 1; j >= 0; j--) {
        for (let i = pathB.length - 1; i >= 0; i--) {
          let id = i + 1, jd = j + 1, length = 0;
          while (--id >= 0 && --jd >= 0 && pathB[id] == pathA[jd])
            length++;
          if (length > 0 && length <= max && (j == 0 || to.IS_RELATIVE)) {
            max = length;
            indiceA = j + 1;
            indiceB = i + 1;
          }
        }
      }
      const new_path = pathA.slice(indiceA).map((_) => "..").concat(pathB.slice(indiceB)).concat(to.file).join("/");
      to.path = new_path;
      return to;
    }
    isSUBDIRECTORY_OF(candidate_parent) {
      if (candidate_parent.IS_RELATIVE)
        return false;
      const own_path = (this.IS_RELATIVE ? URI.resolveRelative(this, candidate_parent) || new URI() : this).dir.split("/").slice(0, -1), candidate_path = candidate_parent.dir.split("/").slice(0, -1);
      if (candidate_path.length >= own_path.length)
        return false;
      for (let i = 0; i < candidate_path.length; i++)
        if (candidate_path[i] !== own_path[i])
          return false;
      return true;
    }
  };
  URI.RC = new Map();
  URI.GLOBAL = typeof location != "undefined" ? new URI(location) : new URI();
  var SIMDATA = null;
  URI.simulate = function() {
    SIMDATA = new Map();
    URI.prototype.fetchText = async (d) => (d = this.toString(), SIMDATA.get(d)) ? SIMDATA.get(d) : "";
    URI.prototype.fetchJSON = async (d) => (d = this.toString(), SIMDATA.get(d)) ? JSON.parse(SIMDATA.get(d).toString()) : {};
  };
  URI.addResource = (n, v) => n && v && (SIMDATA || (SIMDATA = new Map())) && SIMDATA.set(n.toString(), v.toString);
  var POLYFILLED = false;
  URI.server = typeof globalThis["process"] == "undefined" ? async () => {
  } : async function(root_dir) {
    root_dir = root_dir || process.cwd() + "/";
    try {
      const fsr = await import("fs");
      const fs = fsr.promises;
      const path = await import("path");
      const http = await import("http");
      if (typeof global !== "undefined" && !POLYFILLED) {
        POLYFILLED = true;
        URI.GLOBAL = new URI(root_dir);
        const g = global;
        g.document = g.document || {};
        g.document.location = URI.GLOBAL;
        g.location = URI.GLOBAL;
        const cached = URI.resolveRelative;
        URI.resolveRelative = function(new_url, old_url = URI.GLOBAL) {
          let URL_old = new URI(old_url), URL_new = new URI(new_url);
          if (!URL_new.IS_RELATIVE && !URL_new.IS_ROOT) {
            const base_path = URL_old.path.split("/").filter((s) => s !== ".."), new_path = URL_new + "";
            let i = base_path.length;
            while (i-- >= 1) {
              try {
                let search_path = "";
                if (base_path[i] == "node_modules")
                  search_path = [...base_path.slice(0, i + 1), new_path].join("/");
                else {
                  search_path = [...base_path.slice(0, i + 1), "node_modules", new_path].join("/");
                }
                const stats = fsr.statSync(search_path);
                if (stats)
                  return new URI(search_path);
              } catch (e) {
              }
            }
            return URL_new;
          }
          return cached(URL_new, URL_old);
        };
        fetch_reference = g.fetch = async (uri, data) => {
          if (data?.IS_CORS) {
            return new Promise((res, rej) => {
              try {
                http.get(uri, data, (req) => {
                  let body = "";
                  req.setEncoding("utf8");
                  req.on("data", (d) => {
                    body += d;
                  });
                  req.on("end", () => res(createResponse(body, uri + "")));
                });
              } catch (e) {
                rej(e);
              }
            });
          } else {
            try {
              let p = path.resolve(process.cwd(), "" + uri);
              const body = await fs.readFile(p);
              return createResponse(body, uri + "");
            } catch (err) {
              throw err;
            }
          }
        };
        URI.prototype.DOES_THIS_EXIST = async function() {
          if (!this.IS_RELATIVE)
            return !!await fs.stat(this.toString()).catch((e) => false);
          return false;
        };
      }
    } catch (e) {
      console.error("Unable to load URI.server. Is this package running on a browser?");
      return;
    }
  };
  Object.freeze(URI.RC);
  Object.seal(URI);
  var uri_default = URI;
  function createResponse(body, url) {
    return {
      get type() {
        return "basic";
      },
      get ok() {
        return true;
      },
      get bodyUsed() {
        return true;
      },
      get redirected() {
        return false;
      },
      get status() {
        return 200;
      },
      get statusText() {
        return "200";
      },
      get headers() {
        return null;
      },
      get body() {
        return Uint8Array.from(body);
      },
      get trailer() {
        return (async () => null)();
      },
      get url() {
        return url;
      },
      clone() {
        return createResponse(body, url);
      },
      formData: () => null,
      text: async () => body instanceof Buffer ? body.toString("utf8") : body,
      json: async () => JSON.parse(body instanceof Buffer ? body.toString("utf8") : body),
      arrayBuffer: async () => body instanceof Buffer ? body.buffer : Buffer.from(body)
    };
  }

  // source/typescript/types/plugin.ts
  var PLUGIN_TYPE;
  (function(PLUGIN_TYPE2) {
    PLUGIN_TYPE2["ELEMENT_RENDER"] = "element-render-hook";
    PLUGIN_TYPE2["STATIC_DATA_FETCH"] = "static-data-fetch";
    PLUGIN_TYPE2["TAG_PARSE"] = "element-render-hook";
    PLUGIN_TYPE2["TEST_HOOK"] = "test-hook";
  })(PLUGIN_TYPE || (PLUGIN_TYPE = {}));

  // source/typescript/plugin/plugin.ts
  var PluginError = class extends Error {
    get error_class() {
      return "plugin";
    }
  };
  var PluginTypeError = class extends PluginError {
    constructor(plugin) {
      if ("validateSpecifier" in plugin)
        super(`Could Not Load PluginSpec: Invalid type [${plugin?.type}]`);
      else
        super(`Could Not Load Plugin: Invalid type [${plugin?.type}]`);
    }
  };
  var PluginSpecifierError = class extends PluginError {
    constructor(plugin) {
      super("Could Not Load Plugin: Invalid Specifier type");
    }
  };
  var PluginSpecTypeError = class extends PluginError {
    constructor(plugin) {
      super(`Spec type [${plugin?.type}] is not a valid plugin type.`);
    }
  };
  var PluginValidationError = class extends PluginError {
    constructor(plugin) {
      super(`Spec type [${plugin?.type}] has an invalid or missing validationSpecifier function`);
    }
  };
  var PluginRequiresError = class extends PluginError {
    constructor(plugin) {
      if (!plugin.requires)
        super(`Missing requires object on spec ${plugin.type}`);
      else
        super(`Missing one or both of requirements clientHandler or serverHandler`);
    }
  };
  var PluginRecoverError = class extends PluginError {
    constructor(plugin) {
      super(`Missing defaultRecover function`);
    }
  };
  var PluginMissingRequirementError = class extends PluginError {
    constructor(plugin, requirement) {
      super(`Plugin ${plugin.type}::${plugin.specifier} missing requirement ${requirement}`);
    }
  };
  var PluginStore = class {
    static addSpec(plugin_spec) {
      if (typeof plugin_spec?.type != "string")
        throw new PluginTypeError(plugin_spec);
      let HAS_VALUE = false;
      for (const key in PLUGIN_TYPE)
        if (PLUGIN_TYPE[key] == plugin_spec?.type) {
          HAS_VALUE = true;
          break;
        }
      if (PLUGIN_TYPE[plugin_spec?.type] == void 0) {
        if (!HAS_VALUE)
          throw new PluginSpecTypeError(plugin_spec);
      }
      if (!("validateSpecifier" in plugin_spec) || typeof plugin_spec.validateSpecifier("test-123") !== "boolean")
        throw new PluginValidationError(plugin_spec);
      if (!Array.isArray(plugin_spec.requires) || !plugin_spec.requires.includes("clientHandler") && !plugin_spec.requires.includes("serverHandler"))
        throw new PluginRequiresError(plugin_spec);
      if (typeof plugin_spec.defaultRecover != "function")
        throw new PluginRecoverError(plugin_spec);
      PluginStore.specs.set(plugin_spec.type, plugin_spec);
    }
    constructor() {
      this.plugins = new Map();
    }
    addPlugin(plugin) {
      if (typeof plugin?.type != "string" || !PluginStore.specs.has(plugin?.type))
        throw new PluginTypeError(plugin);
      const spec = PluginStore.specs.get(plugin.type);
      if (typeof plugin.specifier != "string" || !spec.validateSpecifier(plugin.specifier))
        throw new PluginSpecifierError(plugin);
      for (const requirement of spec.requires)
        if (!(requirement in plugin))
          throw new PluginMissingRequirementError(plugin, requirement);
      if (!this.plugins.has(plugin.type))
        this.plugins.set(plugin.type, new Map());
      this.plugins.get(plugin.type).set(plugin.specifier, plugin);
    }
    getPlugin(type, selector) {
      if (this.plugins.has(type)) {
        const plugin_class = this.plugins.get(type);
        if (plugin_class.has(selector)) {
          return plugin_class.get(selector);
        }
      }
      return null;
    }
    hasPlugin(type, selector) {
      if (this.plugins.has(type)) {
        const plugin_class = this.plugins.get(type);
        return plugin_class.has(selector);
      }
      return false;
    }
    async runClientPlugin(context, type, selector, ...args) {
      const plugin = this.getPlugin(type, selector);
      if (plugin)
        try {
          return await plugin.clientHandler(context, ...args);
        } catch (e) {
          console.log(e);
        }
      return await PluginStore.specs.get(type).defaultRecover("clientHandler", selector, ...args);
    }
    async runServerPlugin(context, type, selector, ...args) {
      const plugin = this.getPlugin(type, selector);
      if (plugin)
        try {
          return await plugin.clientHandler(context, ...args);
        } catch (e) {
          console.log(e);
        }
      return await PluginStore.specs.get(type).defaultRecover("serverHandler", selector, ...args);
    }
  };
  PluginStore.specs = new Map();

  // source/typescript/compiler/common/context.ts
  var CachedPresets = null;
  var DefaultPresets = {
    options: {
      USE_SHADOW: false,
      USE_SHADOWED_STYLE: false,
      CACHE_URL: false,
      GENERATE_SOURCE_MAPS: false,
      REMOVE_DEBUGGER_STATEMENTS: true,
      THROW_ON_ERRORS: true,
      INCLUDE_SOURCE_URI: false,
      url: {
        glow: "@candlelib/glow",
        wick: "@candlelib/wick",
        wickrt: "@candlelib/wick"
      }
    }
  };
  var _Context = class {
    constructor(user_presets = {}) {
      user_presets = Object.assign({}, DefaultPresets, user_presets);
      user_presets.options = Object.assign({}, DefaultPresets.options, user_presets.options);
      user_presets.options.url = Object.assign({}, DefaultPresets.options.url, (user_presets.options || {}).url || {});
      this.url = new uri_default();
      this.document = typeof document != "undefined" ? document : {};
      this.window = typeof window != "undefined" ? window : {};
      this.wrapper = null;
      this.options = user_presets.options;
      this.api = {};
      this.models = {};
      this.globals = {};
      this.test_rig_sources = new Map();
      this.component_class = new Map();
      this.component_class_string = new Map();
      this.components = new Map();
      this.named_components = new Map();
      this.repo = new Map();
      this.styles = new Map();
      this.css_cache = new Map();
      this.plugins = new PluginStore();
      this.integrate_new_options(user_presets);
      this.template_data = new WeakMap();
      this.active_template_data = null;
      this.processLink = (_) => _;
      CachedPresets = this;
    }
    integrate_new_options(user_presets) {
      this.verifyOptions(user_presets);
      this.addRepoData(user_presets);
      this.loadModelData(user_presets);
      this.loadSchemeData(user_presets);
      this.loadAPIObjects(user_presets);
    }
    loadAPIObjects(user_presets) {
      if (user_presets.api) {
        for (const name2 in user_presets.api)
          this.addAPIObject(name2, user_presets.api[name2]);
      }
    }
    verifyOptions(user_presets) {
      const options = user_presets.options;
      for (const cn in options)
        if (typeof options[cn] != typeof DefaultPresets.options[cn])
          throw new ReferenceError(`Unrecognized preset ${cn}`);
    }
    loadSchemeData(user_presets) {
      const d = user_presets.schemes;
    }
    loadModelData(user_presets) {
      let c = user_presets.models;
      if (c)
        for (const cn in c)
          this.models[cn] = c[cn];
    }
    addRepoData(user_presets) {
      for (const [hash, url] of user_presets.repo || [])
        this.repo.set(url, {
          hash,
          url,
          module: null
        });
    }
    async getDataSource(uri) {
      const uri_str = uri + "";
      if (uri_str in this.api)
        return this.api[uri_str].default;
      let value = void 0;
      if (await uri.DOES_THIS_EXIST()) {
        switch (uri.ext) {
          case "json":
            value = uri.fetchJSON();
            break;
        }
      }
      this.api[uri_str] = {
        hash: uri_str,
        default: value
      };
      return this.getDataSource(uri);
    }
    addAPIObject(name2, obj) {
      if (name2 in this.api)
        return;
      this.api[name2] = {
        hash: name2,
        default: obj
      };
    }
    copy() {
      const obj = {};
      for (let a in this) {
        if (a == "components")
          obj.components = this.components;
        else if (typeof this[a] == "object")
          obj[a] = Object.assign({}, this[a]);
        else if (Array.is(this[a]))
          obj[a] = this[a].slice();
        else
          obj[a] = this[a];
      }
      const context = new _Context(obj);
      context.processLink = this.processLink.bind(this);
      return context;
    }
    assignGlobals(globals) {
      if (typeof globals == "object") {
        this.globals = Object.assign({}, globals);
      }
    }
  };
  var Context = _Context;
  Context.global = { get v() {
    return CachedPresets;
  }, set v(e) {
  } };
  var ModuleType;
  (function(ModuleType2) {
    ModuleType2[ModuleType2["local"] = 0] = "local";
  })(ModuleType || (ModuleType = {}));

  // ../spark/build/library/spark.js
  var caller = typeof window == "object" && window?.requestAnimationFrame ? window.requestAnimationFrame : (f) => {
    setTimeout(f, 5);
  };
  var perf = typeof performance == "undefined" ? { now: () => Date.now() } : performance;
  var Spark = class {
    constructor() {
      this.update_queue_a = [];
      this.update_queue_b = [];
      this.update_queue = this.update_queue_a;
      this.queue_switch = 0;
      this.callback = this.update.bind(this);
      if (typeof window !== "undefined" && window.addEventListener) {
        window.addEventListener("load", () => {
          caller(this.callback);
        });
      } else {
        this.callback = this.update.bind(this);
        caller(this.callback);
      }
      this.frame_time = perf.now();
      this.SCHEDULE_PENDING = false;
      this.ACTIVE_UPDATE = false;
    }
    queueUpdate(object, time_start = 1, time_end = 0, NOW = false) {
      if (NOW && this.ACTIVE_UPDATE) {
        if (object._SCHD_ == 1)
          return;
        if (this.queue_switch == 1)
          this.update_queue_a.push(object);
        else
          this.update_queue_b.push(object);
      } else {
        const IsInt = typeof object._SCHD_ == "number";
        if (IsInt && object._SCHD_ > 0)
          if (this.SCHEDULE_PENDING)
            return;
          else
            return caller(this.callback);
        object._SCHD_ = (time_start & 65535 | time_end << 16) << 1;
        this.update_queue.push(object);
        this.frame_time = perf.now() | 0;
        if (!this.SCHEDULE_PENDING) {
          this.SCHEDULE_PENDING = true;
          caller(this.callback);
        }
      }
    }
    removeFromQueue(object) {
      if (object._SCHD_) {
        for (let i = 0, l = this.update_queue.length; i < l; i++)
          if (this.update_queue[i] === object) {
            this.update_queue.splice(i, 1);
            object._SCHD_ = 0;
            if (l == 1)
              this.SCHEDULE_PENDING = false;
            return;
          }
      }
    }
    update() {
      this.SCHEDULE_PENDING = false;
      this.ACTIVE_UPDATE = true;
      const uq = this.update_queue, time = perf.now() | 0, diff = Math.ceil(time - this.frame_time) | 1, step_ratio = diff * 0.06;
      this.frame_time = time;
      if (this.queue_switch == 0)
        this.update_queue = this.update_queue_b, this.queue_switch = 1;
      else
        this.update_queue = this.update_queue_a, this.queue_switch = 0;
      for (let i = 0, l = uq.length, o = uq[0]; i < uq.length; o = uq[++i]) {
        let schd = o._SCHD_ >> 1, timestart = (schd & 65535) - diff, timeend = schd >> 16 & 65535;
        o._SCHD_ = 0;
        if (timestart > 0) {
          this.queueUpdate(o, timestart, timeend);
          continue;
        }
        timestart = 0;
        if (timeend > 0)
          this.queueUpdate(o, timestart, timeend - diff);
        try {
          o.scheduledUpdate(step_ratio, diff);
        } catch (e) {
          this.handleError(e);
        }
      }
      this.ACTIVE_UPDATE = false;
      uq.length = 0;
    }
    handleError(e) {
      console.log("Spark: Error encountered");
      console.error(e);
    }
    async sleep(timeout = 1) {
      return new Promise((res) => {
        this.queueUpdate({
          scheduledUpdate: () => res(1)
        }, timeout);
      });
    }
  };
  var spark = new Spark();
  var spark_default = spark;

  // source/typescript/types/binding.ts
  var BINDING_VARIABLE_TYPE;
  (function(BINDING_VARIABLE_TYPE2) {
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["UNDECLARED"] = 0] = "UNDECLARED";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["INTERNAL_VARIABLE"] = 1] = "INTERNAL_VARIABLE";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["ATTRIBUTE_VARIABLE"] = 2] = "ATTRIBUTE_VARIABLE";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["MODEL_VARIABLE"] = 4] = "MODEL_VARIABLE";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["MODEL_DIRECT"] = 512] = "MODEL_DIRECT";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["TEMPLATE_CONSTANT"] = 1024] = "TEMPLATE_CONSTANT";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["TEMPLATE_INITIALIZER"] = 2048] = "TEMPLATE_INITIALIZER";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["CURE_TEST"] = 4096] = "CURE_TEST";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["CONFIG_GLOBAL"] = 8192] = "CONFIG_GLOBAL";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["GLOBAL_VARIABLE"] = 8] = "GLOBAL_VARIABLE";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["METHOD_VARIABLE"] = 16] = "METHOD_VARIABLE";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["CONST_INTERNAL_VARIABLE"] = 32] = "CONST_INTERNAL_VARIABLE";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["MODULE_MEMBER_VARIABLE"] = 64] = "MODULE_MEMBER_VARIABLE";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["MODULE_VARIABLE"] = 128] = "MODULE_VARIABLE";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["MODULE_NAMESPACE_VARIABLE"] = 256] = "MODULE_NAMESPACE_VARIABLE";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["CONSTANT_DATA_SOURCE"] = 16384] = "CONSTANT_DATA_SOURCE";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["DYNAMIC_DATA_SOURCE"] = 32768] = "DYNAMIC_DATA_SOURCE";
    BINDING_VARIABLE_TYPE2[BINDING_VARIABLE_TYPE2["DIRECT_ACCESS"] = 208] = "DIRECT_ACCESS";
  })(BINDING_VARIABLE_TYPE || (BINDING_VARIABLE_TYPE = {}));
  var BINDING_FLAG;
  (function(BINDING_FLAG2) {
    BINDING_FLAG2[BINDING_FLAG2["DEFAULT_BINDING_STATE"] = 1] = "DEFAULT_BINDING_STATE";
    BINDING_FLAG2[BINDING_FLAG2["FROM_PARENT"] = 2] = "FROM_PARENT";
    BINDING_FLAG2[BINDING_FLAG2["FROM_PRESETS"] = 4] = "FROM_PRESETS";
    BINDING_FLAG2[BINDING_FLAG2["FROM_OUTSIDE"] = 8] = "FROM_OUTSIDE";
    BINDING_FLAG2[BINDING_FLAG2["ALLOW_EXPORT_TO_PARENT"] = 16] = "ALLOW_EXPORT_TO_PARENT";
    BINDING_FLAG2[BINDING_FLAG2["ALLOW_UPDATE_FROM_CHILD"] = 32] = "ALLOW_UPDATE_FROM_CHILD";
    BINDING_FLAG2[BINDING_FLAG2["ALLOW_UPDATE_FROM_MODEL"] = 64] = "ALLOW_UPDATE_FROM_MODEL";
    BINDING_FLAG2[BINDING_FLAG2["WRITTEN"] = 128] = "WRITTEN";
  })(BINDING_FLAG || (BINDING_FLAG = {}));
  var STATIC_BINDING_STATE;
  (function(STATIC_BINDING_STATE2) {
    STATIC_BINDING_STATE2[STATIC_BINDING_STATE2["UNCHECKED"] = 0] = "UNCHECKED";
    STATIC_BINDING_STATE2[STATIC_BINDING_STATE2["TRUE"] = 1] = "TRUE";
    STATIC_BINDING_STATE2[STATIC_BINDING_STATE2["FALSE"] = 2] = "FALSE";
    STATIC_BINDING_STATE2[STATIC_BINDING_STATE2["STATIC_CONSTANT"] = 4] = "STATIC_CONSTANT";
    STATIC_BINDING_STATE2[STATIC_BINDING_STATE2["STATIC_RUNTIME"] = 8] = "STATIC_RUNTIME";
  })(STATIC_BINDING_STATE || (STATIC_BINDING_STATE = {}));
  var STATIC_RESOLUTION_TYPE;
  (function(STATIC_RESOLUTION_TYPE2) {
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["UNDEFINED"] = 0] = "UNDEFINED";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["CONSTANT_STATIC"] = 1] = "CONSTANT_STATIC";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["WITH_MODEL"] = 2] = "WITH_MODEL";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["WITH_MODULE"] = 4] = "WITH_MODULE";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["WITH_PARENT"] = 8] = "WITH_PARENT";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["WITH_GLOBAL"] = 16] = "WITH_GLOBAL";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["WITH_VARIABLE"] = 32] = "WITH_VARIABLE";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["STATIC_WITH_PARENT"] = 9] = "STATIC_WITH_PARENT";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["STATIC_WITH_MODULE"] = 5] = "STATIC_WITH_MODULE";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["STATIC_WITH_MODEL"] = 3] = "STATIC_WITH_MODEL";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["STATIC_WITH_GLOBAL"] = 17] = "STATIC_WITH_GLOBAL";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["STATIC_WITH_VARIABLE"] = 33] = "STATIC_WITH_VARIABLE";
    STATIC_RESOLUTION_TYPE2[STATIC_RESOLUTION_TYPE2["INVALID"] = 255] = "INVALID";
  })(STATIC_RESOLUTION_TYPE || (STATIC_RESOLUTION_TYPE = {}));

  // source/typescript/types/errors.ts
  var WickComponentErrorCode;
  (function(WickComponentErrorCode2) {
    WickComponentErrorCode2[WickComponentErrorCode2["FAILED_TO_FETCH_RESOURCE"] = 0] = "FAILED_TO_FETCH_RESOURCE";
    WickComponentErrorCode2[WickComponentErrorCode2["SYNTAX_ERROR_DURING_PARSE"] = 1] = "SYNTAX_ERROR_DURING_PARSE";
  })(WickComponentErrorCode || (WickComponentErrorCode = {}));

  // source/typescript/types/hook.ts
  var HOOK_TYPE;
  (function(HOOK_TYPE2) {
    HOOK_TYPE2[HOOK_TYPE2["READ"] = 1] = "READ";
    HOOK_TYPE2[HOOK_TYPE2["WRITE"] = 2] = "WRITE";
    HOOK_TYPE2[HOOK_TYPE2["READONLY"] = 1] = "READONLY";
    HOOK_TYPE2[HOOK_TYPE2["WRITE_ONLY"] = 2] = "WRITE_ONLY";
    HOOK_TYPE2[HOOK_TYPE2["READ_WRITE"] = 3] = "READ_WRITE";
  })(HOOK_TYPE || (HOOK_TYPE = {}));
  var HOOK_SELECTOR;
  (function(HOOK_SELECTOR2) {
    HOOK_SELECTOR2["ELEMENT_SELECTOR_STRING"] = "esl";
    HOOK_SELECTOR2["WATCHED_FRAME_METHOD_CALL"] = "wfm";
    HOOK_SELECTOR2["METHOD_CALL"] = "mc";
    HOOK_SELECTOR2["IMPORT_FROM_CHILD"] = "ifc";
    HOOK_SELECTOR2["EXPORT_TO_CHILD"] = "etc";
    HOOK_SELECTOR2["IMPORT_FROM_PARENT"] = "ifp";
    HOOK_SELECTOR2["EXPORT_TO_PARENT"] = "etp";
    HOOK_SELECTOR2["INPUT_VALUE"] = "imp";
    HOOK_SELECTOR2["CHECKED_VALUE"] = "chk";
    HOOK_SELECTOR2["CONTAINER_USE_IF"] = "cui";
    HOOK_SELECTOR2["CONTAINER_USE_EMPTY"] = "cue";
  })(HOOK_SELECTOR || (HOOK_SELECTOR = {}));
  var ProcessedHookType;
  (function(ProcessedHookType2) {
    ProcessedHookType2[ProcessedHookType2["INITIALIZE"] = 0] = "INITIALIZE";
    ProcessedHookType2[ProcessedHookType2["ASYNC_INITIALIZE"] = 1] = "ASYNC_INITIALIZE";
    ProcessedHookType2[ProcessedHookType2["VAR_UPDATE"] = 2] = "VAR_UPDATE";
    ProcessedHookType2[ProcessedHookType2["DESTROY"] = 4] = "DESTROY";
  })(ProcessedHookType || (ProcessedHookType = {}));

  // source/typescript/types/html.ts
  var htmlState;
  (function(htmlState2) {
    htmlState2[htmlState2["IS_ROOT"] = 1] = "IS_ROOT";
    htmlState2[htmlState2["EXTERNAL_COMPONENT"] = 2] = "EXTERNAL_COMPONENT";
    htmlState2[htmlState2["IS_COMPONENT"] = 4] = "IS_COMPONENT";
    htmlState2[htmlState2["IS_SLOT_REPLACEMENT"] = 8] = "IS_SLOT_REPLACEMENT";
    htmlState2[htmlState2["IS_INTERLEAVED"] = 16] = "IS_INTERLEAVED";
  })(htmlState || (htmlState = {}));

  // source/typescript/types/wick_ast.ts
  var HTMLNodeClass;
  (function(HTMLNodeClass2) {
    HTMLNodeClass2[HTMLNodeClass2["HTML_NODE"] = 1048576] = "HTML_NODE";
    HTMLNodeClass2[HTMLNodeClass2["HTML_ELEMENT"] = 2097152] = "HTML_ELEMENT";
  })(HTMLNodeClass || (HTMLNodeClass = {}));
  var HTMLNodeType;
  (function(HTMLNodeType2) {
    HTMLNodeType2[HTMLNodeType2["WickBinding"] = 1233125376] = "WickBinding";
    HTMLNodeType2[HTMLNodeType2["HTML_IMPORT"] = 1244659712] = "HTML_IMPORT";
    HTMLNodeType2[HTMLNodeType2["HTMLAttribute"] = 1250951168] = "HTMLAttribute";
    HTMLNodeType2[HTMLNodeType2["HTMLText"] = 1259339776] = "HTMLText";
    HTMLNodeType2[HTMLNodeType2["ERROR"] = 1266679808] = "ERROR";
    HTMLNodeType2[HTMLNodeType2["HTML_Element"] = 1278214144] = "HTML_Element";
    HTMLNodeType2[HTMLNodeType2["HTML_TEXT"] = 1286602752] = "HTML_TEXT";
    HTMLNodeType2[HTMLNodeType2["HTML_TT"] = 1294991360] = "HTML_TT";
    HTMLNodeType2[HTMLNodeType2["HTML_I"] = 1303379968] = "HTML_I";
    HTMLNodeType2[HTMLNodeType2["HTML_B"] = 1311768576] = "HTML_B";
    HTMLNodeType2[HTMLNodeType2["HTML_BIG"] = 1320157184] = "HTML_BIG";
    HTMLNodeType2[HTMLNodeType2["HTML_SMALL"] = 1328545792] = "HTML_SMALL";
    HTMLNodeType2[HTMLNodeType2["HTML_EM"] = 1336934400] = "HTML_EM";
    HTMLNodeType2[HTMLNodeType2["HTML_STRONG"] = 1345323008] = "HTML_STRONG";
    HTMLNodeType2[HTMLNodeType2["HTML_DFN"] = 1353711616] = "HTML_DFN";
    HTMLNodeType2[HTMLNodeType2["HTML_CODE"] = 1362100224] = "HTML_CODE";
    HTMLNodeType2[HTMLNodeType2["HTML_SAMP"] = 1370488832] = "HTML_SAMP";
    HTMLNodeType2[HTMLNodeType2["HTML_KBD"] = 1378877440] = "HTML_KBD";
    HTMLNodeType2[HTMLNodeType2["HTML_VAR"] = 1387266048] = "HTML_VAR";
    HTMLNodeType2[HTMLNodeType2["HTML_CITE"] = 1395654656] = "HTML_CITE";
    HTMLNodeType2[HTMLNodeType2["HTML_ABBR"] = 1404043264] = "HTML_ABBR";
    HTMLNodeType2[HTMLNodeType2["HTML_ACRONYM"] = 1412431872] = "HTML_ACRONYM";
    HTMLNodeType2[HTMLNodeType2["HTML_SUP"] = 1420820480] = "HTML_SUP";
    HTMLNodeType2[HTMLNodeType2["HTML_SPAN"] = 1429209088] = "HTML_SPAN";
    HTMLNodeType2[HTMLNodeType2["HTML_BDO"] = 1437597696] = "HTML_BDO";
    HTMLNodeType2[HTMLNodeType2["HTML_BR"] = 1445986304] = "HTML_BR";
    HTMLNodeType2[HTMLNodeType2["HTML_BODY"] = 1454374912] = "HTML_BODY";
    HTMLNodeType2[HTMLNodeType2["HTML_ADDRESS"] = 1462763520] = "HTML_ADDRESS";
    HTMLNodeType2[HTMLNodeType2["HTML_DIV"] = 1471152128] = "HTML_DIV";
    HTMLNodeType2[HTMLNodeType2["HTML_A"] = 1479540736] = "HTML_A";
    HTMLNodeType2[HTMLNodeType2["HTML_MAP"] = 1487929344] = "HTML_MAP";
    HTMLNodeType2[HTMLNodeType2["HTML_AREA"] = 1496317952] = "HTML_AREA";
    HTMLNodeType2[HTMLNodeType2["HTML_LINK"] = 1504706560] = "HTML_LINK";
    HTMLNodeType2[HTMLNodeType2["HTML_IMG"] = 1513095168] = "HTML_IMG";
    HTMLNodeType2[HTMLNodeType2["HTML_OBJECT"] = 1521483776] = "HTML_OBJECT";
    HTMLNodeType2[HTMLNodeType2["HTML_PARAM"] = 1529872384] = "HTML_PARAM";
    HTMLNodeType2[HTMLNodeType2["HTML_HR"] = 1538260992] = "HTML_HR";
    HTMLNodeType2[HTMLNodeType2["HTML_P"] = 1546649600] = "HTML_P";
    HTMLNodeType2[HTMLNodeType2["HTML_H1"] = 1555038208] = "HTML_H1";
    HTMLNodeType2[HTMLNodeType2["HTML_H2"] = 1563426816] = "HTML_H2";
    HTMLNodeType2[HTMLNodeType2["HTML_H3"] = 1571815424] = "HTML_H3";
    HTMLNodeType2[HTMLNodeType2["HTML_H4"] = 1580204032] = "HTML_H4";
    HTMLNodeType2[HTMLNodeType2["HTML_H5"] = 1588592640] = "HTML_H5";
    HTMLNodeType2[HTMLNodeType2["HTML_H6"] = 1596981248] = "HTML_H6";
    HTMLNodeType2[HTMLNodeType2["HTML_PRE"] = 1605369856] = "HTML_PRE";
    HTMLNodeType2[HTMLNodeType2["HTML_Q"] = 1613758464] = "HTML_Q";
    HTMLNodeType2[HTMLNodeType2["HTML_BLOCKQUOTE"] = 1622147072] = "HTML_BLOCKQUOTE";
    HTMLNodeType2[HTMLNodeType2["HTML_INS"] = 1630535680] = "HTML_INS";
    HTMLNodeType2[HTMLNodeType2["HTML_DEL"] = 1638924288] = "HTML_DEL";
    HTMLNodeType2[HTMLNodeType2["HTML_DL"] = 1647312896] = "HTML_DL";
    HTMLNodeType2[HTMLNodeType2["HTML_DT"] = 1655701504] = "HTML_DT";
    HTMLNodeType2[HTMLNodeType2["HTML_DD"] = 1664090112] = "HTML_DD";
    HTMLNodeType2[HTMLNodeType2["HTML_OL"] = 1672478720] = "HTML_OL";
    HTMLNodeType2[HTMLNodeType2["HTML_UL"] = 1680867328] = "HTML_UL";
    HTMLNodeType2[HTMLNodeType2["HTML_LI"] = 1689255936] = "HTML_LI";
    HTMLNodeType2[HTMLNodeType2["HTML_FORM"] = 1697644544] = "HTML_FORM";
    HTMLNodeType2[HTMLNodeType2["HTML_LABEL"] = 1706033152] = "HTML_LABEL";
    HTMLNodeType2[HTMLNodeType2["HTML_INPUT"] = 1714421760] = "HTML_INPUT";
    HTMLNodeType2[HTMLNodeType2["HTML_SELECT"] = 1722810368] = "HTML_SELECT";
    HTMLNodeType2[HTMLNodeType2["HTML_OPTGROUP"] = 1731198976] = "HTML_OPTGROUP";
    HTMLNodeType2[HTMLNodeType2["HTML_OPTION"] = 1739587584] = "HTML_OPTION";
    HTMLNodeType2[HTMLNodeType2["HTML_TEXTAREA"] = 1747976192] = "HTML_TEXTAREA";
    HTMLNodeType2[HTMLNodeType2["HTML_FIELDSET"] = 1756364800] = "HTML_FIELDSET";
    HTMLNodeType2[HTMLNodeType2["HTML_LEGEND"] = 1764753408] = "HTML_LEGEND";
    HTMLNodeType2[HTMLNodeType2["HTML_BUTTON"] = 1773142016] = "HTML_BUTTON";
    HTMLNodeType2[HTMLNodeType2["HTML_TABLE"] = 1781530624] = "HTML_TABLE";
    HTMLNodeType2[HTMLNodeType2["HTML_CAPTION"] = 1789919232] = "HTML_CAPTION";
    HTMLNodeType2[HTMLNodeType2["HTML_THEAD"] = 1798307840] = "HTML_THEAD";
    HTMLNodeType2[HTMLNodeType2["HTML_TFOOT"] = 1806696448] = "HTML_TFOOT";
    HTMLNodeType2[HTMLNodeType2["HTML_TBODY"] = 1815085056] = "HTML_TBODY";
    HTMLNodeType2[HTMLNodeType2["HTML_COLGROUP"] = 1823473664] = "HTML_COLGROUP";
    HTMLNodeType2[HTMLNodeType2["HTML_COL"] = 1831862272] = "HTML_COL";
    HTMLNodeType2[HTMLNodeType2["HTML_TR"] = 1840250880] = "HTML_TR";
    HTMLNodeType2[HTMLNodeType2["HTML_TH"] = 1848639488] = "HTML_TH";
    HTMLNodeType2[HTMLNodeType2["HTML_TD"] = 1857028096] = "HTML_TD";
    HTMLNodeType2[HTMLNodeType2["HTML_HEAD"] = 1865416704] = "HTML_HEAD";
    HTMLNodeType2[HTMLNodeType2["HTML_TITLE"] = 1873805312] = "HTML_TITLE";
    HTMLNodeType2[HTMLNodeType2["HTML_BASE"] = 1882193920] = "HTML_BASE";
    HTMLNodeType2[HTMLNodeType2["HTML_META"] = 1890582528] = "HTML_META";
    HTMLNodeType2[HTMLNodeType2["HTML_STYLE"] = 1898971136] = "HTML_STYLE";
    HTMLNodeType2[HTMLNodeType2["HTML_SCRIPT"] = 1907359744] = "HTML_SCRIPT";
    HTMLNodeType2[HTMLNodeType2["HTML_NOSCRIPT"] = 1915748352] = "HTML_NOSCRIPT";
    HTMLNodeType2[HTMLNodeType2["HTML_HTML"] = 1924136960] = "HTML_HTML";
    HTMLNodeType2[HTMLNodeType2["HTML_SVG"] = 1932525568] = "HTML_SVG";
    HTMLNodeType2[HTMLNodeType2["HTML_BINDING_ELEMENT"] = 1932525568] = "HTML_BINDING_ELEMENT";
    HTMLNodeType2[HTMLNodeType2["CompiledBinding"] = 1937768448] = "CompiledBinding";
    HTMLNodeType2[HTMLNodeType2["ComponentVariableDeclaration"] = 1946157056] = "ComponentVariableDeclaration";
    HTMLNodeType2[HTMLNodeType2["MARKDOWN"] = 1957691392] = "MARKDOWN";
  })(HTMLNodeType || (HTMLNodeType = {}));
  var HTMLNodeTypeLU;
  (function(HTMLNodeTypeLU2) {
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["WickBinding"] = 1233125376] = "WickBinding";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_IMPORT"] = 1244659712] = "HTML_IMPORT";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTMLAttribute"] = 1250951168] = "HTMLAttribute";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTMLText"] = 1259339776] = "HTMLText";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["ERROR"] = 1266679808] = "ERROR";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_Element"] = 1278214144] = "HTML_Element";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_TEXT"] = 1286602752] = "HTML_TEXT";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_TT"] = 1294991360] = "HTML_TT";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_I"] = 1303379968] = "HTML_I";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_B"] = 1311768576] = "HTML_B";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_BIG"] = 1320157184] = "HTML_BIG";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_SMALL"] = 1328545792] = "HTML_SMALL";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_EM"] = 1336934400] = "HTML_EM";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_STRONG"] = 1345323008] = "HTML_STRONG";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_DFN"] = 1353711616] = "HTML_DFN";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_CODE"] = 1362100224] = "HTML_CODE";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_SAMP"] = 1370488832] = "HTML_SAMP";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_KBD"] = 1378877440] = "HTML_KBD";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_VAR"] = 1387266048] = "HTML_VAR";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_CITE"] = 1395654656] = "HTML_CITE";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_ABBR"] = 1404043264] = "HTML_ABBR";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_ACRONYM"] = 1412431872] = "HTML_ACRONYM";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_SUP"] = 1420820480] = "HTML_SUP";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_SPAN"] = 1429209088] = "HTML_SPAN";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_BDO"] = 1437597696] = "HTML_BDO";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_BR"] = 1445986304] = "HTML_BR";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_BODY"] = 1454374912] = "HTML_BODY";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_ADDRESS"] = 1462763520] = "HTML_ADDRESS";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_DIV"] = 1471152128] = "HTML_DIV";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_A"] = 1479540736] = "HTML_A";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_MAP"] = 1487929344] = "HTML_MAP";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_AREA"] = 1496317952] = "HTML_AREA";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_LINK"] = 1504706560] = "HTML_LINK";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_IMG"] = 1513095168] = "HTML_IMG";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_OBJECT"] = 1521483776] = "HTML_OBJECT";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_PARAM"] = 1529872384] = "HTML_PARAM";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_HR"] = 1538260992] = "HTML_HR";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_P"] = 1546649600] = "HTML_P";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_H1"] = 1555038208] = "HTML_H1";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_H2"] = 1563426816] = "HTML_H2";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_H3"] = 1571815424] = "HTML_H3";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_H4"] = 1580204032] = "HTML_H4";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_H5"] = 1588592640] = "HTML_H5";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_H6"] = 1596981248] = "HTML_H6";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_PRE"] = 1605369856] = "HTML_PRE";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_Q"] = 1613758464] = "HTML_Q";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_BLOCKQUOTE"] = 1622147072] = "HTML_BLOCKQUOTE";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_INS"] = 1630535680] = "HTML_INS";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_DEL"] = 1638924288] = "HTML_DEL";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_DL"] = 1647312896] = "HTML_DL";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_DT"] = 1655701504] = "HTML_DT";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_DD"] = 1664090112] = "HTML_DD";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_OL"] = 1672478720] = "HTML_OL";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_UL"] = 1680867328] = "HTML_UL";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_LI"] = 1689255936] = "HTML_LI";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_FORM"] = 1697644544] = "HTML_FORM";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_LABEL"] = 1706033152] = "HTML_LABEL";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_INPUT"] = 1714421760] = "HTML_INPUT";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_SELECT"] = 1722810368] = "HTML_SELECT";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_OPTGROUP"] = 1731198976] = "HTML_OPTGROUP";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_OPTION"] = 1739587584] = "HTML_OPTION";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_TEXTAREA"] = 1747976192] = "HTML_TEXTAREA";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_FIELDSET"] = 1756364800] = "HTML_FIELDSET";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_LEGEND"] = 1764753408] = "HTML_LEGEND";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_BUTTON"] = 1773142016] = "HTML_BUTTON";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_TABLE"] = 1781530624] = "HTML_TABLE";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_CAPTION"] = 1789919232] = "HTML_CAPTION";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_THEAD"] = 1798307840] = "HTML_THEAD";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_TFOOT"] = 1806696448] = "HTML_TFOOT";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_TBODY"] = 1815085056] = "HTML_TBODY";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_COLGROUP"] = 1823473664] = "HTML_COLGROUP";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_COL"] = 1831862272] = "HTML_COL";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_TR"] = 1840250880] = "HTML_TR";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_TH"] = 1848639488] = "HTML_TH";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_TD"] = 1857028096] = "HTML_TD";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_HEAD"] = 1865416704] = "HTML_HEAD";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_TITLE"] = 1873805312] = "HTML_TITLE";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_BASE"] = 1882193920] = "HTML_BASE";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_META"] = 1890582528] = "HTML_META";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_STYLE"] = 1898971136] = "HTML_STYLE";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_SCRIPT"] = 1907359744] = "HTML_SCRIPT";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_NOSCRIPT"] = 1915748352] = "HTML_NOSCRIPT";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_HTML"] = 1924136960] = "HTML_HTML";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_SVG"] = 1932525568] = "HTML_SVG";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["HTML_BINDING_ELEMENT"] = 1932525568] = "HTML_BINDING_ELEMENT";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["CompiledBinding"] = 1937768448] = "CompiledBinding";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["ComponentVariableDeclaration"] = 1946157056] = "ComponentVariableDeclaration";
    HTMLNodeTypeLU2[HTMLNodeTypeLU2["MARKDOWN"] = 1957691392] = "MARKDOWN";
  })(HTMLNodeTypeLU || (HTMLNodeTypeLU = {}));

  // source/typescript/runtime/global.ts
  var rt = (() => {
    let glow = null;
    return {
      async loadGlow(glow_url = "@candlelib/glow") {
        glow = (await import(glow_url)).default;
        return glow;
      },
      root_components: [],
      get glow() {
        return glow;
      },
      get p() {
        return rt.context;
      },
      get C() {
        return WickRTComponent;
      },
      router: null,
      context: null,
      rC: (component) => (rt.context.component_class.set(component.name, component), component),
      gC: (component_name) => rt.context.component_class.get(component_name),
      templates: new Map(),
      OVERRIDABLE_onComponentCreate(component_instance) {
      },
      OVERRIDABLE_onComponentMetaChange() {
      },
      setPresets: (preset_options) => {
        if (rt.context) {
          if (preset_options)
            rt.context.integrate_new_options(preset_options);
        } else {
          const context = new Context(preset_options);
          rt.context = context;
        }
        return rt.context;
      },
      init: null,
      addAPI(obj) {
        for (const name2 in obj)
          rt.context.api[name2] = { default: obj[name2] };
      }
    };
  })();

  // source/typescript/runtime/container.ts
  function getColumnRow(index, offset, set_size) {
    const adjusted_index = index - offset * set_size;
    const row = Math.floor(adjusted_index / set_size);
    const col = index % set_size;
    return { row, col };
  }
  function createTransition(val) {
    if (!rt.glow) {
      const trs = { add: () => null, addEventListener: (n, v) => v() };
      return {
        in: trs,
        out: trs,
        play: () => null,
        addEventListener: (n, v) => {
          v();
        }
      };
    } else
      return rt.glow.createTransition(val);
  }
  var TRANSITION;
  (function(TRANSITION2) {
    TRANSITION2[TRANSITION2["OUT"] = 0] = "OUT";
    TRANSITION2[TRANSITION2["IN"] = 1] = "IN";
    TRANSITION2[TRANSITION2["ARRANGE"] = 2] = "ARRANGE";
  })(TRANSITION || (TRANSITION = {}));
  var component_attributes_default = [[[]]];
  var WickContainer = class {
    constructor(component_constructors, component_attributes, element, parent_comp, null_elements = []) {
      this.comp_constructors = component_constructors;
      this.comp_attributes = component_attributes || component_attributes_default;
      this.activeComps = [];
      this.dom_comp = [];
      this.filters = [];
      this.comps = [];
      this.dom_dn = [];
      this.dom_up = [];
      this.evaluators = Array(component_constructors.length);
      this.transition_list = [];
      this._SCHD_ = 0;
      this.shift_amount = 1;
      this.limit = Infinity;
      this.offset = 0;
      this.offset_diff = 0;
      this.offset_fractional = 0;
      this.scrub_velocity = 0;
      this.drag = 0.5;
      this.trs_ascending = null;
      this.trs_descending = null;
      this.USE_NULL_ELEMENT = false;
      this.NULL_ELEMENT_DISCONNECTED = false;
      this.UPDATE_FILTER = false;
      this.DOM_UP_APPENDED = false;
      this.DOM_DN_APPENDED = false;
      this.AUTO_SCRUB = false;
      this.LOADED = false;
      this.SCRUBBING = false;
      this.container = null;
      this.parent = parent_comp;
      this.filter = null;
      this.sort = null;
      this.first_dom_element = null;
      this.last_dom_element = null;
      this.components_pending_removal = [];
      this.ele = element;
      if (null_elements.length > 0 || this.ele.tagName == "NULL") {
        this.USE_NULL_ELEMENT = true;
        if (null_elements.length > 0) {
          this.NULL_ELEMENT_DISCONNECTED = true;
          this.ele.parentElement.removeChild(this.ele);
          this.first_dom_element = null_elements[0];
          this.last_dom_element = null_elements[null_elements.length - 1];
          for (const comp of hydrateComponentElements(null_elements)) {
            comp.par = parent_comp;
            comp.connect();
            this.activeComps.push(comp);
            this.comps.push(comp);
            this.dom_comp.push(comp);
          }
        }
      } else {
        if (this.ele.tagName == "TABLE") {
          if (this.ele.firstElementChild && this.ele.firstElementChild.tagName == "TBODY")
            this.ele = this.ele.firstElementChild;
        }
        if (this.ele.childElementCount > 0) {
          for (const comp of hydrateComponentElements(Array.from(this.ele.children))) {
            comp.par = parent_comp;
            comp.connect();
            this.activeComps.push(comp);
            this.comps.push(comp);
            this.dom_comp.push(comp);
          }
        }
      }
    }
    destructor() {
      this.filter_new_items();
      if (this.container && this.container.OBSERVABLE)
        this.container.unsubscribe(this);
    }
    sd(container) {
      if (!container)
        return;
      if (container.OBSERVABLE) {
        const ctr = container;
        ctr.subscribe(this);
      } else {
        if (Array.isArray(container))
          this.filter_new_items(container);
        else
          this.filter_new_items(container.data);
      }
      this.setLoadedFlag();
    }
    onModelUpdate(container) {
      this.filter_new_items(container.data);
    }
    setLoadedFlag() {
      if (!this.LOADED)
        this.LOADED = true;
    }
    forceMount() {
      const active_window_size = this.limit, offset = this.offset, min = Math.min(offset + this.offset_diff, offset) * this.shift_amount, max = Math.max(offset + this.offset_diff, offset) * this.shift_amount + active_window_size, output_length = this.activeComps.length;
      let i = min;
      this.ele.innerHTML = "";
      this.dom_comp.length = 0;
      while (i < max && i < output_length) {
        const node = this.activeComps[i++];
        this.dom_comp.push(node);
        this.append(node);
      }
    }
    scrub(scrub_delta, SCRUBBING = true) {
      const w_data = this.getWindowData();
      if (w_data.limit == 0) {
        this.SCRUBBING = false;
        return;
      }
      if (!this.SCRUBBING)
        this.arrangeScrub(w_data, this.activeComps);
      this.SCRUBBING = true;
      if (this.AUTO_SCRUB && !SCRUBBING && scrub_delta != Infinity) {
        this.scrub_velocity = 0;
        this.AUTO_SCRUB = false;
      }
      let delta_offset = scrub_delta + this.offset_fractional;
      if (scrub_delta !== Infinity) {
        if (Math.abs(delta_offset) > 1) {
          if (delta_offset > 0) {
            delta_offset = delta_offset % 1;
            this.offset_fractional = delta_offset;
            this.scrub_velocity = scrub_delta;
            if (this.offset < this.max)
              this.trs_ascending.step(1);
            this.offset++;
            this.offset_diff = 1;
            this.mutateDOM(this.getWindowData(), null, this.activeComps, true).step(1).issueStopped();
            this.arrangeScrub(w_data, this.activeComps);
          } else {
            delta_offset = delta_offset % 1;
            this.offset_fractional = delta_offset;
            this.scrub_velocity = scrub_delta;
            if (this.offset >= 1)
              this.trs_descending.step(1);
            this.offset--;
            this.offset_diff = -1;
            this.mutateDOM(this.getWindowData(), null, this.activeComps, true).step(1).issueStopped();
            this.arrangeScrub(w_data, this.activeComps);
          }
        }
        if (delta_offset > 0) {
          if (this.offset + delta_offset >= this.max - 1)
            delta_offset = 0;
          if (!this.DOM_UP_APPENDED) {
            for (let i = 0; i < this.dom_up.length; i++) {
              this.append(this.dom_up[i]);
              this.dom_up[i].index = -1;
              this.dom_comp.push(this.dom_up[i]);
            }
            this.DOM_UP_APPENDED = true;
          }
          this.trs_ascending.play(delta_offset);
        } else {
          if (this.offset < 1)
            delta_offset = 0;
          if (!this.DOM_DN_APPENDED) {
            for (let i = 0; i < this.dom_dn.length; i++) {
              this.append(this.dom_dn[i], this.dom_comp[0].ele);
              this.dom_dn[i].index = -1;
            }
            this.dom_comp = this.dom_dn.concat(this.dom_comp);
            this.DOM_DN_APPENDED = true;
          }
          this.trs_descending.step(-delta_offset);
        }
        this.offset_fractional = delta_offset;
        this.scrub_velocity = scrub_delta;
        return true;
      } else {
        if (Math.abs(this.scrub_velocity) > 1e-4) {
          const sign = Math.sign(this.scrub_velocity);
          if (Math.abs(this.scrub_velocity) < 0.1)
            this.scrub_velocity = this.drag * 0.2 * sign;
          if (Math.abs(this.scrub_velocity) > 0.5)
            this.scrub_velocity = this.drag * sign;
          this.AUTO_SCRUB = true;
          let dist = this.scrub_velocity * (1 / (-this.drag + 1));
          let nearest = this.offset + this.offset_fractional + dist;
          nearest = this.scrub_velocity > 0 ? Math.min(this.max, Math.ceil(nearest)) : Math.max(0, Math.floor(nearest));
          let nearest_dist = nearest - (this.offset + this.offset_fractional);
          let drag = Math.abs(1 - 1 / (nearest_dist / this.scrub_velocity));
          this.drag = drag;
          this.scrub_velocity = this.scrub_velocity;
          this.SCRUBBING = true;
          spark_default.queueUpdate(this);
          return true;
        } else {
          this.offset += Math.round(this.offset_fractional);
          this.scrub_velocity = 0;
          this.offset_fractional = 0;
          this.mutateDOM(this.getWindowData(), null, this.activeComps, true).step(1).issueStopped();
          this.SCRUBBING = false;
          return false;
        }
      }
    }
    arrangeScrub(w_data, output = this.activeComps) {
      let { limit, offset, output_length, active_window_start } = w_data, active_window_size = this.limit;
      if (active_window_size > 0) {
        this.shift_amount = Math.max(1, Math.min(active_window_size, this.shift_amount));
        let i = 0, oa = 0;
        const ein = [], shift_points = Math.ceil(output_length / this.shift_amount);
        this.max = shift_points - 1;
        offset = Math.max(0, Math.min(shift_points - 1, offset));
        this.trs_ascending = createTransition(false);
        this.trs_descending = createTransition(false);
        this.dom_dn.length = 0;
        this.dom_up.length = 0;
        this.DOM_UP_APPENDED = false;
        this.DOM_DN_APPENDED = false;
        while (i < active_window_start - this.shift_amount)
          output[i++].index = -2;
        while (i < active_window_start) {
          this.dom_dn.push(output[i]);
          const { row, col } = getColumnRow(i, offset - 1, this.shift_amount);
          output[i].transitionIn(row, col, true, this.trs_descending);
          output[i++].index = -2;
        }
        while (i < active_window_start + active_window_size && i < output_length) {
          if (oa < this.shift_amount && ++oa) {
            const { row, col } = getColumnRow(i, offset + 1, this.shift_amount);
            output[i].transitionOut(row, col, true, this.trs_descending);
          } else {
            const { row, col } = getColumnRow(i, offset + 1, this.shift_amount);
            output[i].transitionIn(row, col, false, this.trs_ascending);
          }
          if (i >= active_window_start + active_window_size - this.shift_amount) {
            const { row, col } = getColumnRow(i, offset - 1, this.shift_amount);
            output[i].transitionOut(row, col, true, this.trs_descending);
          } else {
            const { row, col } = getColumnRow(i, offset - 1, this.shift_amount);
            output[i].arrange(row, col, this.trs_descending);
          }
          output[i].index = i;
          ein.push(output[i++]);
        }
        while (i < active_window_start + active_window_size + this.shift_amount && i < output_length) {
          this.dom_up.push(output[i]);
          const { row, col } = getColumnRow(i, offset + 1, this.shift_amount);
          output[i].transitionIn(row, col, false, this.trs_ascending);
          output[i++].index = -3;
        }
        while (i < output_length)
          output[i++].index = -3;
        output = ein;
        output_length = ein.length;
      } else {
        this.max = 0;
        this.limit = 0;
      }
    }
    addTransitioningComp(comp, TYPE, DESCENDING, row, col) {
      this.transition_list.push({
        comp,
        TYPE,
        DESCENDING,
        row,
        col
      });
    }
    getWindowData(output = this.activeComps) {
      const limit = this.limit, offset = this.offset, output_length = output.length, active_window_start = Math.max(0, offset * this.shift_amount), upper_bound = Math.min(active_window_start + limit, output_length), direction = Math.sign(this.offset_diff), DESCENDING = direction < 0;
      return {
        limit,
        offset,
        output_length,
        active_window_start,
        upper_bound,
        direction,
        DESCENDING
      };
    }
    arrange(w_data, output = this.activeComps, transition = createTransition()) {
      const { limit, offset, output_length, active_window_start, upper_bound, DESCENDING } = w_data;
      let i = 0;
      while (i < active_window_start && i < output_length) {
        if (output[i].CONNECTED) {
          const { row, col } = getColumnRow(i, offset, this.shift_amount);
          this.addTransitioningComp(output[i], 0, DESCENDING, row, col);
          this.components_pending_removal.push(output[i]);
        }
        i++;
      }
      while (i < upper_bound) {
        const { row, col } = getColumnRow(i, offset, this.shift_amount);
        if (output[i].CONNECTED)
          this.addTransitioningComp(output[i], 2, DESCENDING, row, col);
        else
          this.addTransitioningComp(output[i], 1, DESCENDING, row, col);
        i++;
      }
      while (i < output_length) {
        if (output[i].CONNECTED) {
          const { row, col } = getColumnRow(i, offset, this.shift_amount);
          this.addTransitioningComp(output[i], 0, DESCENDING, row, col);
          this.components_pending_removal.push(output[i]);
        }
        i++;
      }
    }
    updateRefs(w_data, output) {
      const { limit, offset, output_length, active_window_start, upper_bound, direction } = w_data;
      this.ele.style.position = this.ele.style.position;
      if (this.USE_NULL_ELEMENT && this.NULL_ELEMENT_DISCONNECTED && upper_bound - active_window_start == 0) {
        this.dom_comp[0].ele.parentElement.insertBefore(this.ele, this.dom_comp[0].ele);
        this.NULL_ELEMENT_DISCONNECTED = false;
      }
      this.dom_comp.length = 0;
      for (let i = active_window_start; i < upper_bound; i++)
        this.dom_comp.push(output[i]);
      if (this.USE_NULL_ELEMENT && this.dom_comp.length > 0) {
        this.first_dom_element = this.dom_comp[0].ele;
        this.last_dom_element = this.dom_comp[this.dom_comp.length - 1].ele;
      }
    }
    append(appending_comp, append_before_ele) {
      if (this.USE_NULL_ELEMENT) {
        if (!this.NULL_ELEMENT_DISCONNECTED) {
          appending_comp.appendToDOM(this.ele.parentElement, this.ele, false);
          this.ele.parentElement.removeChild(this.ele);
          this.first_dom_element = appending_comp.ele;
          this.last_dom_element = appending_comp.ele;
          this.NULL_ELEMENT_DISCONNECTED = true;
        } else {
          if (!append_before_ele) {
            append_before_ele = this.last_dom_element;
            this.last_dom_element = appending_comp.ele;
            appending_comp.appendToDOM(this.parent.ele, append_before_ele, true);
          } else {
            appending_comp.appendToDOM(this.parent.ele, append_before_ele);
          }
        }
      } else {
        appending_comp.appendToDOM(this.ele, append_before_ele);
      }
    }
    appendToDOM(w_data, output) {
      const { limit, offset, output_length, active_window_start } = w_data;
      let j = active_window_start;
      let upper_bound = Math.min(active_window_start + limit, output_length);
      let i = Math.min(active_window_start, output_length);
      while (i < upper_bound)
        output[i].index = i++;
      for (let i2 = 0; i2 < this.dom_comp.length && j < upper_bound; i2++) {
        const as = this.dom_comp[i2];
        while (j < upper_bound && output[j].CONNECTED)
          j++;
        while (j < as.index && j < upper_bound) {
          const os = output[j];
          os.index = -1;
          this.append(os, as.ele);
          j++;
        }
      }
      while (j < upper_bound) {
        this.append(output[j]);
        output[j].index = -1;
        j++;
      }
      return j;
    }
    removeFromDOM() {
      for (const component of this.components_pending_removal)
        component.removeFromDOM();
      this.components_pending_removal.length = 0;
    }
    mutateDOM(w_data, transition, output = this.activeComps, NO_TRANSITION = false) {
      let OWN_TRANSITION = false;
      if (!transition)
        transition = createTransition(), OWN_TRANSITION = true;
      this.arrange(w_data, output, transition);
      this.appendToDOM(w_data, output);
      this.updateRefs(w_data, output);
      this.primeTransitions(transition);
      if (OWN_TRANSITION) {
        if (!rt.glow || NO_TRANSITION) {
          this.removeFromDOM();
        } else {
          transition.asyncPlay().then(this.removeFromDOM.bind(this));
        }
      }
      return transition;
    }
    primeTransitions(transition) {
      for (const { TYPE, row, col, DESCENDING, comp } of this.transition_list)
        switch (TYPE) {
          case 1:
            comp.transitionIn(row, col, DESCENDING, transition);
            break;
          case 0:
            comp.transitionOut(row, col, DESCENDING, transition);
            break;
          case 2:
            comp.arrange(row, col, transition);
            break;
        }
      this.transition_list.length = 0;
    }
    limitExpressionUpdate(transition) {
      this.mutateDOM(this.getWindowData(), transition);
      this.offset_diff = 0;
    }
    filterExpressionUpdate(transition) {
      this.updateFilter();
      this.limitExpressionUpdate(transition);
    }
    updateFilter() {
      this.activeComps.length = 0;
      if (this.filter) {
        for (const comp of this.comps) {
          if (!this.filter(comp.container_model)) {
            if (comp.CONNECTED) {
              this.components_pending_removal.push(comp);
            }
          } else {
            this.activeComps.push(comp);
          }
        }
      } else {
        this.activeComps.push(...this.comps);
      }
      if (this.sort)
        this.activeComps.sort(this.sort);
      this.UPDATE_FILTER = false;
      return this.activeComps;
    }
    setFilter(value) {
      if (typeof value == "function")
        this.filter = value;
    }
    setSort(value) {
      if (typeof value == "function")
        this.sort = value;
    }
    updateScrub(value) {
      if (typeof value == "number" && value != 0)
        this.scrub(value);
      else if (value === null && this.SCRUBBING) {
        this.AUTO_SCRUB = true;
        this.scheduledUpdate();
      }
    }
    updateLimit(value) {
      let numeric = parseInt(value.toString());
      if (numeric) {
        numeric = Math.max(0, numeric);
        if (this.limit != numeric) {
          this.limit = numeric;
          spark_default.queueUpdate(this);
        }
      } else {
        this.limit = Infinity;
        spark_default.queueUpdate(this);
      }
    }
    updateShift(value) {
      if (typeof value == "number" && this.shift_amount != value) {
        this.shift_amount = value;
        spark_default.queueUpdate(this);
      }
    }
    updateOffset(value) {
      if (typeof value == "number" && this.offset != value) {
        this.offset = value;
        spark_default.queueUpdate(this);
      }
    }
    scheduledUpdate() {
      if (this.SCRUBBING) {
        if (!this.AUTO_SCRUB) {
          this.SCRUBBING = false;
          return;
        }
        if (Math.abs(this.scrub_velocity) > 1e-4) {
          if (this.scrub(this.scrub_velocity)) {
            this.scrub_velocity *= this.drag;
            let pos = this.offset + this.scrub_velocity;
            if (pos < 0 || pos > this.max)
              this.scrub_velocity = 0;
            spark_default.queueUpdate(this);
          }
        } else {
          this.scrub_velocity = 0;
          this.scrub(Infinity);
          this.SCRUBBING = false;
        }
      } else {
        this.filterExpressionUpdate();
      }
    }
    filter_new_items(new_items = []) {
      const transition = createTransition();
      if (new_items.length == 0) {
        const sl = this.activeComps.length;
        if (this.USE_NULL_ELEMENT && this.NULL_ELEMENT_DISCONNECTED)
          this.first_dom_element.parentElement.insertBefore(this.first_dom_element, this.ele);
        for (let i = 0; i < sl; i++) {
          const { row, col } = getColumnRow(i, this.offset, this.shift_amount);
          this.addTransitioningComp(this.activeComps[i], 0, false, row, col);
        }
        this.comps.length = 0;
        this.activeComps.length = 0;
        this.primeTransitions(transition);
        if (!this.SCRUBBING)
          transition.play();
      } else {
        const exists = new Map(new_items.map((e) => [e, true])), out = [];
        for (let i = 0, l = this.activeComps.length; i < l; i++)
          if (exists.has(this.activeComps[i].container_model))
            exists.set(this.activeComps[i].container_model, false);
        for (let i = 0, l = this.comps.length; i < l; i++)
          if (!exists.has(this.comps[i].container_model)) {
            this.addTransitioningComp(this.comps[0], 0, false, -1, -1);
            this.comps[i].index = -1;
            this.comps.splice(i, 1);
            l--;
            i--;
          } else
            exists.set(this.comps[i].container_model, false);
        exists.forEach((v, k) => {
          if (v)
            out.push(k);
        });
        if (out.length > 0) {
          this._add(out, transition);
        } else {
          for (let i = 0, j = 0, l = this.activeComps.length; i < l; i++, j++) {
            if (this.activeComps[i]._TRANSITION_STATE_) {
              if (j !== i) {
                const { row, col } = getColumnRow(i, this.offset, this.shift_amount);
                this.activeComps[i].arrange(row, col, transition);
              }
            } else
              this.activeComps.splice(i, 1), i--, l--;
          }
        }
        this.scheduledUpdate();
      }
    }
    addEvaluator(evaluator, index) {
      this.evaluators[index] = evaluator;
    }
    _add(items, transition) {
      let OWN_TRANSITION = false, cstr_l = this.comp_constructors.length;
      if (!transition)
        OWN_TRANSITION = true;
      for (const item of items) {
        let component = null;
        if (item instanceof WickRTComponent) {
          component = item;
        } else {
          for (let j = 0; j < cstr_l; j++) {
            const evaluator = this.evaluators[j];
            if (j == cstr_l - 1 || evaluator && evaluator(item)) {
              component = new this.comp_constructors[j](null, null, [this.parent]);
              component.hydrate().initialize(item);
              component.disconnect();
              const attrib_list = this.comp_attributes[j];
              if (attrib_list)
                for (const [key, value] of attrib_list) {
                  if (!key)
                    continue;
                  if (key == "class")
                    component.ele.classList.add(...value.split(" "));
                  else
                    component.ele.setAttribute(key, value);
                }
              component.container_model = item;
              break;
            }
          }
        }
        if (component) {
          component.par = this.parent;
          this.comps.push(component);
        }
      }
      if (OWN_TRANSITION)
        this.filterExpressionUpdate(transition);
    }
  };

  // source/typescript/runtime/html.ts
  function* getComponentNames(ele) {
    const len = ele.classList.length;
    for (let i = 0; i < len; i++)
      if (String_Is_Wick_Hash_ID(ele.classList[i]))
        yield ele.classList[i];
  }
  var comp_name_regex = /W[_\$a-zA-Z0-9]+/;
  function String_Is_Wick_Hash_ID(str) {
    return !!str.match(comp_name_regex);
  }
  function Element_Is_Wick_Component(ele) {
    return ele && ele.hasAttribute("w:c") && [...getComponentNames(ele)].length > 0;
  }
  function Element_Is_Wick_Template(ele) {
    return ele && ele.tagName == "TEMPLATE" && ele.hasAttribute("w:c") && String_Is_Wick_Hash_ID(ele.id + "");
  }
  function hydrateComponentElements(pending_component_elements) {
    const components = [];
    for (const hydrate_candidate of pending_component_elements) {
      components.push(hydrateComponentElement(hydrate_candidate));
    }
    return components;
  }
  function hydrateComponentElement(hydrate_candidate, parent_chain = [], existing_comp) {
    let names = getComponentNames(hydrate_candidate), affinity = 0;
    const u = void 0;
    let first_comp = null;
    for (const component_name of names) {
      const comp_class = rt.gC(component_name);
      if (comp_class) {
        if (!first_comp && existing_comp) {
          first_comp = existing_comp;
          parent_chain = parent_chain.concat(first_comp);
          affinity++;
        } else {
          let comp = new comp_class(hydrate_candidate, u, parent_chain, u, u, affinity++);
          comp.hydrate();
          parent_chain = parent_chain.concat(comp);
          if (!first_comp)
            first_comp = comp;
        }
      } else
        console.warn(`WickRT :: Could not find component data for ${component_name}`);
    }
    return first_comp;
  }
  function hydrateContainerElement(ele, parent, null_elements = []) {
    const comp_constructors = ele.getAttribute("w:ctr").split(" ").map((name2) => parent.context.component_class.get(name2)), comp_attributes = (ele.getAttribute("w:ctr-atr") ?? "").split(":").map((e) => e.split(";").map((e2) => e2.split("=")));
    if (comp_constructors.length < 1)
      throw new Error(`Could not find component class for ${name} in component ${parent.name}`);
    const ctr = new WickContainer(comp_constructors, comp_attributes, ele, parent, null_elements);
    parent.ctr.push(ctr);
  }

  // source/typescript/runtime/component.ts
  var DATA_DIRECTION;
  (function(DATA_DIRECTION2) {
    DATA_DIRECTION2[DATA_DIRECTION2["DOWN"] = 1] = "DOWN";
    DATA_DIRECTION2[DATA_DIRECTION2["UP"] = 2] = "UP";
  })(DATA_DIRECTION || (DATA_DIRECTION = {}));
  var ComponentFlag;
  (function(ComponentFlag2) {
    ComponentFlag2[ComponentFlag2["CONNECTED"] = 1] = "CONNECTED";
    ComponentFlag2[ComponentFlag2["TRANSITIONED_IN"] = 2] = "TRANSITIONED_IN";
    ComponentFlag2[ComponentFlag2["DESTROY_AFTER_TRANSITION"] = 4] = "DESTROY_AFTER_TRANSITION";
  })(ComponentFlag || (ComponentFlag = {}));
  var WickRTComponent = class {
    constructor(existing_element = null, wrapper = null, parent_chain = [], default_model_name = "", context = rt.context, element_affinity = 0) {
      this.name = this.constructor.name;
      this.ele = null;
      this.ci = 0;
      this.ch = [];
      this.elu = [];
      this.ctr = [];
      this.pui = [];
      this.nui = [];
      this.model = null;
      this.call_set = new Map();
      this.binding_call_set = [];
      this.updated_attributes = new Set();
      this.update_state = 0;
      this.active_flags = 0;
      this.call_depth = 0;
      this.affinity = element_affinity;
      this.ALLOW_UPDATE = false;
      this.CONNECTED = false;
      this.INITIALIZED = false;
      this.TRANSITIONED_IN = false;
      this.DESTROY_AFTER_TRANSITION = false;
      this.up = this.updateParent;
      this.spm = this.syncParentMethod;
      this.pup = this.updateFromChild;
      this.ufp = this.updateFromParent;
      this._SCHD_ = 0;
      this.polling_id = -1;
      this.context = context;
      const parent = parent_chain[parent_chain.length - 1];
      if (parent)
        parent.addChild(this);
      if (default_model_name) {
        if (!context.models[default_model_name])
          context.models[default_model_name] = {};
        this.model = context.models[default_model_name];
      }
      this.wrapper = wrapper;
      if (existing_element) {
        this.integrateElement(existing_element, parent_chain.concat(this));
      } else
        this.ele = this.createElement(context, [this]);
      this.ele.setAttribute("wrt:c", this.name);
    }
    initialize(model = this.model) {
      if (this.INITIALIZED)
        return;
      this.INITIALIZED = true;
      this.ALLOW_UPDATE = true;
      for (const child of this.ch)
        child.initialize();
      this.model = model;
      this.init(this);
      this.async_init();
      this.setModel(model);
      return this;
    }
    hydrate() {
      const context = this.context, wrapper = this.wrapper;
      if (wrapper) {
        this.ele.appendChild(this.wrapper.ele);
        this.wrapper.setModel({ comp: this });
      } else if (context.wrapper && this.name !== context.wrapper.name) {
        this.wrapper = new (context.component_class.get(context.wrapper.name))({ comp: this });
        this.ele.appendChild(this.wrapper.ele);
      }
      try {
        this.c();
      } catch (e) {
        console.error(e);
      }
      rt.OVERRIDABLE_onComponentCreate(this);
      for (const child of this.ch)
        child.hydrate();
      return this;
    }
    destructor() {
      if (this.model)
        this.setModel(null);
      if (this.wrapper)
        this.wrapper.destructor();
      if (this.par)
        this.par.removeChild(this);
      this.removeCSS();
    }
    removeChild(cp) {
      if (cp.par == this) {
        this.ch = this.ch.filter((c) => c !== cp);
        cp.par = null;
      }
    }
    addChild(cp) {
      for (const ch of this.ch)
        if (ch == cp)
          continue;
      cp.par = this;
      this.ch.push(cp);
    }
    connect() {
      this.CONNECTED = true;
      this.ALLOW_UPDATE = true;
      for (const child of this.ch)
        child.connect();
      this.onModelUpdate();
    }
    disconnect() {
      for (const child of this.ch)
        child.disconnect();
      this.ALLOW_UPDATE = false;
      this.CONNECTED = false;
    }
    ce() {
      if (rt.templates.has(this.name)) {
        const template = rt.templates.get(this.name);
        if (template) {
          const doc = template.content.cloneNode(true), ele = doc.firstElementChild;
          this.integrateElement(ele);
          return ele;
        }
      }
      throw new Error("WickRT :: NO template element for component: " + this.name);
    }
    removeCSS() {
      const cache = this.context.css_cache.get(this.name);
      if (cache) {
        cache.count--;
        if (cache.count <= 0) {
          cache.css_ele.parentElement.removeChild(cache.css_ele);
          this.context.css_cache.delete(this.name);
        }
      }
    }
    setCSS(style_string = this.getCSS()) {
      if (style_string) {
        if (!this.context.css_cache.has(this.name)) {
          const { window: { document: document2 }, css_cache } = this.context, css_ele = document2.createElement("style");
          css_ele.innerHTML = style_string;
          document2.head.appendChild(css_ele);
          css_cache.set(this.name, { css_ele, count: 1 });
        } else
          this.context.css_cache.get(this.name).count++;
        this.ele.classList.add(this.name);
      }
    }
    appendToDOM(parent_element, other_element = null, INSERT_AFTER = false) {
      this.connecting();
      this.connect();
      if (other_element) {
        if (!INSERT_AFTER)
          other_element.parentElement.insertBefore(this.ele, other_element);
        else {
          if (other_element.nextElementSibling)
            other_element.parentElement.insertBefore(this.ele, other_element.nextElementSibling);
          else
            other_element.parentElement.appendChild(this.ele);
        }
      } else {
        parent_element.appendChild(this.ele);
      }
      this.connected();
    }
    removeFromDOM() {
      if (this.CONNECTED == false)
        return;
      this.disconnecting();
      if (this.ele && this.ele.parentElement)
        this.ele.parentElement.removeChild(this.ele);
      this.disconnect();
      this.disconnected();
    }
    oTI(row, col, DESCENDING, trs) {
    }
    oTO(row, col, DESCENDING, trs) {
    }
    aRR(row, col, trs) {
    }
    onTransitionOutEnd() {
      if (!this.TRANSITIONED_IN) {
        this.removeFromDOM();
        if (this.DESTROY_AFTER_TRANSITION)
          this.destructor();
        this.DESTROY_AFTER_TRANSITION = false;
      }
      this.out_trs = null;
      return false;
    }
    transitionOut(row, col, DESCENDING, transition = null, DESTROY_AFTER_TRANSITION = false) {
      for (const ch of this.ch)
        ch.transitionOut(row, col, DESCENDING, transition, false);
      this.DESTROY_AFTER_TRANSITION = DESTROY_AFTER_TRANSITION;
      this.TRANSITIONED_IN = false;
      let transition_time = 0;
      if (transition) {
        this.oTO(row, col, DESCENDING, transition.out);
        transition.addEventListener("stopped", this.onTransitionOutEnd.bind(this));
        try {
          transition_time = transition.out_duration;
        } catch (e) {
          console.log(e);
        }
      } else if (!this.out_trs)
        this.onTransitionOutEnd();
      transition_time = Math.max(transition_time, 0);
      return transition_time;
    }
    se(index, ele) {
      if (!this.elu[index])
        this.elu[index] = [];
      this.elu[index].push(ele);
    }
    re(index, ele) {
      if (!this.elu[index])
        return;
      this.elu[index] = this.elu[index].filter((e) => e != ele);
    }
    arrange(row, col, trs) {
      this.aRR(row, col, trs.in);
    }
    transitionIn(row, col, DESCENDING, trs) {
      for (const ch of this.ch)
        ch.transitionIn(row, col, DESCENDING, trs);
      try {
        this.oTI(row, col, DESCENDING, trs.in);
        this.TRANSITIONED_IN = true;
      } catch (e) {
        console.log(e);
      }
    }
    setModel(model) {
      if (this.model && model != this.model) {
        if (this.polling_id >= 0) {
          clearInterval(this.polling_id);
          this.polling_id = -1;
        }
        if (this.model.unsubscribe)
          this.model.unsubscribe(this);
        this.model = null;
      }
      if (model) {
        this.model = model;
        if (typeof model.subscribe == "function") {
          model.subscribe(this);
        } else {
          if (this.polling_id < 0)
            this.polling_id = setInterval(this.onModelUpdate.bind(this), 1e3 / 15);
          this.onModelUpdate(model);
        }
      }
    }
    removeModel() {
      this.setModel(null);
    }
    onModelUpdate(model = this.model, flags = BINDING_FLAG.ALLOW_UPDATE_FROM_MODEL | BINDING_FLAG.DEFAULT_BINDING_STATE) {
      if (!this.ALLOW_UPDATE)
        return;
      if (model) {
        this.update(model, flags);
        this.updateChildrenWithModel(model);
      }
    }
    updateChildrenWithModel(model) {
      for (const child of this.ch)
        child.onModelUpdate(model, BINDING_FLAG.ALLOW_UPDATE_FROM_MODEL | BINDING_FLAG.FROM_PARENT | BINDING_FLAG.DEFAULT_BINDING_STATE);
    }
    update(data, flags = 1, IMMEDIATE = false) {
      if (!this.ALLOW_UPDATE)
        return;
      for (const name2 in data) {
        const val = data[name2];
        if (typeof val !== "undefined" && this.nlu) {
          const index = this.nlu[name2];
          if (flags && (index >>> 24 & flags) == flags)
            this.ua(index & 16777215, val);
        }
      }
      for (const [call_id, args] of this.clearActiveCalls())
        this.lookup_function_table[call_id].call(this, ...args);
      if (IMMEDIATE)
        this.scheduledUpdate(0, 0);
    }
    ua(attribute_index, attribute_value, RETURN_PREVIOUS_VAL = false) {
      const comp = this;
      const prev_val = comp[attribute_index];
      if (attribute_value !== prev_val) {
        comp[attribute_index] = attribute_value;
        if (!this.call_set.has(attribute_index) && this.lookup_function_table[attribute_index]) {
          this.lookup_function_table[attribute_index].call(this, this.call_depth);
        }
      }
      return RETURN_PREVIOUS_VAL ? prev_val : comp[attribute_index];
    }
    fua(attribute_index, attribute_value, RETURN_PREVIOUS_VAL = false) {
      const comp = this;
      const prev_val = comp[attribute_index];
      if (!this.call_set.has(attribute_index) && this.lookup_function_table[attribute_index])
        this.call_set.set(attribute_index, [this.active_flags, this.call_depth]);
      comp[attribute_index] = attribute_value;
      spark_default.queueUpdate(this, 0, 0, true);
      return RETURN_PREVIOUS_VAL ? prev_val : comp[attribute_index];
    }
    u(flags, call_depth = this.call_depth) {
      const pending_function_indices = this.updated_attributes.values();
      this.updated_attributes.clear();
      for (const index of pending_function_indices) {
        if (this.lookup_function_table[index])
          this.call_set.set(index, [flags, call_depth]);
      }
      spark_default.queueUpdate(this);
    }
    check(...ids) {
      const comp = this;
      for (const id of ids)
        if (typeof comp[id] == "undefined")
          return false;
      return true;
    }
    syncParentMethod(this_index, parent_method_index, child_index) {
      this.ci = child_index;
      this.pui[this_index] = this.par["u" + parent_method_index];
    }
    updateFromParent(local_index, attribute_value, flags) {
      if (flags >> 24 == this.ci + 1)
        return;
      this.active_flags |= BINDING_FLAG.FROM_PARENT;
      this.ua(local_index, attribute_value);
    }
    updateParent(data) {
      if (this.par)
        this.updateFromChild.call(this.par, data);
    }
    updateFromChild(data) {
      for (const key in data) {
        const val = data[key];
        if (typeof val !== "undefined" && this.nlu) {
          const index = this.nlu[key];
          if (index >>> 24 & BINDING_FLAG.ALLOW_UPDATE_FROM_CHILD) {
            let cd = this.call_depth;
            this.call_depth = 0;
            this.ua(index & 16777215, val);
            this.call_depth = cd;
          }
        }
      }
    }
    scheduledUpdate(step_ratio, diff) {
      this.call_depth = 1;
      for (const [calls_id, depth] of this.clearActiveBindingCalls()) {
        this.lookup_function_table[calls_id].call(this, depth);
        this.call_depth = 0;
        this.active_flags = 0;
      }
      for (const [call_id, args] of this.clearActiveCalls()) {
        this.lookup_function_table[call_id].call(this, ...args);
        this.call_depth = 0;
        this.active_flags = 0;
      }
    }
    clearActiveBindingCalls() {
      if (this.binding_call_set.length == 0)
        return [];
      const data = this.binding_call_set.slice();
      this.binding_call_set.length = 0;
      return data;
    }
    clearActiveCalls() {
      if (this.call_set.size == 0)
        return [];
      const data = [...this.call_set.entries()];
      this.call_set.clear();
      return data;
    }
    runActiveCalls() {
    }
    call(pending_function_index, call_depth = 0) {
      for (const [index] of this.binding_call_set)
        if (index == pending_function_index)
          return;
      this.lookup_function_table[pending_function_index].call(this, call_depth);
    }
    c() {
    }
    init(c) {
    }
    async_init() {
    }
    onMounted() {
    }
    getCSS() {
      return "";
    }
    integrateElement(ele, component_chain = [this]) {
      let sk = 0, PROCESS_CHILDREN = true;
      let scope_component = this;
      if (!this.ele) {
        ele.classList.add(this.name);
        this.ele = ele;
        ele.wick_component = this;
        if (ele.hasAttribute("w:ctr")) {
          ({ sk, PROCESS_CHILDREN } = process_container(ele, scope_component, sk, PROCESS_CHILDREN));
        }
      } else {
        if (ele.hasAttribute("w:own")) {
          if (+(ele.getAttribute("w:own") || -1) != this.affinity)
            return 0;
        }
        if (ele.tagName == "W-E") {
          const child = ele.children[0];
          this.integrateElement(child, component_chain);
          if (ele.hasAttribute("w:u"))
            this.se(parseInt(ele.getAttribute("w:u") || "0"), child);
          ele.replaceWith(child);
          return 0;
        } else if (ele.tagName == "W-B") {
          const text = document.createTextNode(ele.innerHTML);
          ele.replaceWith(text);
          if (ele.hasAttribute("w:u"))
            this.se(parseInt(ele.getAttribute("w:u") || "0"), text);
          ele = text;
          return 0;
        } else {
          if (ele.tagName == "A")
            rt.context.processLink(ele);
          if (ele.hasAttribute("w:o")) {
            this.par.se(+ele.hasAttribute("w:o"), ele);
            iterateElementChildren(ele, this.par, component_chain);
            return 0;
          } else if (ele.hasAttribute("w:r")) {
            const index = +(ele.getAttribute("w:r") || -1), lu_index = index % 50, comp_index = index / 50 | 0;
            scope_component = component_chain[comp_index];
            scope_component.se(lu_index, ele);
          }
          if (ele.hasAttribute("w:ctr"))
            ({ sk, PROCESS_CHILDREN } = process_container(ele, scope_component, sk, PROCESS_CHILDREN));
          else if (ele.hasAttribute("w:c") && this.ele !== ele) {
            hydrateComponentElement(ele, component_chain);
            PROCESS_CHILDREN = false;
          }
        }
      }
      if (ele.hasAttribute("w:u"))
        this.se(parseInt(ele.getAttribute("w:u") || "0"), ele);
      if (PROCESS_CHILDREN)
        iterateElementChildren(ele, scope_component, component_chain);
      return sk;
    }
    ue(element_index, data) {
      for (let ele of this.elu[element_index] ?? []) {
        if (data instanceof HTMLElement) {
          this.re(element_index, ele);
          this.se(element_index, data);
          if (ele.parentElement)
            ele.parentElement.replaceChild(data, ele);
          continue;
        } else if (!(ele instanceof Text)) {
          let node = new Text();
          this.re(element_index, ele);
          this.se(element_index, node);
          if (ele.parentElement)
            ele.parentElement.replaceChild(node, ele);
          ele = node;
        }
        ;
        ele.data = data;
      }
    }
    sa(ele_index, attribute_name, attribute_value) {
      for (const ele of this.elu[ele_index] ?? []) {
        if (attribute_name == "value")
          ele.value = attribute_value;
        else
          ele.setAttribute(attribute_name, attribute_value);
      }
    }
    al(ele_index, event_specifier, listener_function, REQUIRES_THIS_BINDING = false) {
      for (const ele of this.elu[ele_index] ?? []) {
        const fn = REQUIRES_THIS_BINDING ? listener_function.bind(this) : listener_function;
        ele.addEventListener(event_specifier, fn);
      }
    }
    makeElement(ele_obj, name_space = "") {
      const temp_ele = document.createElement("div");
      temp_ele.innerHTML = ele_obj;
      return temp_ele.firstElementChild;
    }
    createElement(context, parent_chain) {
      const ele = this.ce();
      hydrateComponentElement(ele, parent_chain, this);
      this.integrateElement(ele, parent_chain);
      return ele;
    }
    connecting() {
    }
    connected() {
    }
    disconnecting() {
    }
    disconnected() {
    }
  };
  function process_container(ele, scope_component, sk, PROCESS_CHILDREN) {
    const null_count = parseInt(ele.getAttribute("null") || "0") || 0, null_elements = [];
    if (null_count > 0) {
      let prev = ele;
      for (let i = 0; i < null_count; i++) {
        null_elements.push(prev.nextElementSibling);
        prev = null_elements[i];
      }
    }
    hydrateContainerElement(ele, scope_component, null_elements);
    sk = null_count;
    PROCESS_CHILDREN = false;
    return { sk, PROCESS_CHILDREN };
  }
  function iterateElementChildren(ele, scope_component, component_chain) {
    let skip_count = 0;
    for (const child of Array.from(ele.children) || []) {
      if (skip_count-- > 0)
        continue;
      skip_count = scope_component.integrateElement(child, component_chain);
    }
  }

  // source/typescript/runtime/load_modules.ts
  async function loadModules(incoming_options, extant_presets) {
    for (const [id, url] of incoming_options?.repo ?? []) {
      if (!extant_presets.api[id]) {
        try {
          const uri = new uri_default(url);
          const mod = await import(uri + "");
          extant_presets.api[id] = {
            default: mod.default ?? null,
            module: mod
          };
        } catch (e) {
          console.warn(new Error(`Could not load module ${url}`));
          console.error(e);
        }
      }
    }
  }

  // source/typescript/runtime/observable/base.ts
  var _SealedProperty_ = (object, name2, value) => Object.defineProperty(object, name2, { value, configurable: false, enumerable: false, writable: true });
  var _FrozenProperty_ = (object, name2, value) => Object.defineProperty(object, name2, { value, configurable: false, enumerable: false, writable: false });
  var ObservableBase = class {
    constructor() {
      _SealedProperty_(this, "OBSERVABLE", true);
      _SealedProperty_(this, "_SCHD_", 0);
      _SealedProperty_(this, "_cv_", []);
      _SealedProperty_(this, "fv", null);
      _SealedProperty_(this, "par", null);
      _SealedProperty_(this, "prop_name", "");
      _SealedProperty_(this, "observers", []);
    }
    destroy() {
      var view = this.fv;
      while (view) {
        let nx = view.nx;
        view.unsetModel();
        view = nx;
      }
      this._cv_ = null;
    }
    setHook(prop_name, data) {
      return data;
    }
    getHook(prop_name, data) {
      return data;
    }
    scheduleUpdate(changed_value) {
      if (this.par)
        this.par.scheduleUpdate();
      if (this.observers.length == 0)
        return;
      if (changed_value)
        this._cv_.push(changed_value);
      spark_default.queueUpdate(this);
    }
    subscribe(view) {
      if (this.observers.indexOf(view) >= 0)
        return false;
      this.observers.push(view);
      view.onModelUpdate(this);
      return true;
    }
    unsubscribe(view) {
      if (this.observers.indexOf(view) >= 0) {
        this.observers.splice(this.observers.indexOf(view), 1);
        return true;
      }
      return false;
    }
    scheduledUpdate(step) {
      this.updateViews();
    }
    updateViews() {
      for (const view of this.observers)
        view.onModelUpdate(this);
      return;
    }
    toJSON(host) {
      return JSON.stringify(this, null, "	");
    }
    set(data) {
      return false;
    }
  };

  // source/typescript/runtime/observable/scheme_constructor.ts
  var SchemeConstructor = class {
    constructor() {
      this.start_value = void 0;
    }
    parse(value) {
      return value;
    }
    verify(value, result) {
      result.valid = true;
    }
    filter(id, filters) {
      for (let i = 0, l = filters.length; i < l; i++)
        if (id === filters[i])
          return true;
      return false;
    }
    string(value) {
      return value + "";
    }
  };

  // source/typescript/runtime/observable/container_base.ts
  var EmptyFunction = () => {
  };
  var ObservableContainerBase = class extends ObservableBase {
    constructor(data = []) {
      super();
      _SealedProperty_(this, "source", null);
      _SealedProperty_(this, "first_link", null);
      _SealedProperty_(this, "pin", EmptyFunction);
      _SealedProperty_(this, "next", null);
      _SealedProperty_(this, "prev", null);
      _SealedProperty_(this, "_filters_", null);
      this.validator = new SchemeConstructor();
      return this;
    }
    setByIndex(index, m) {
    }
    getByIndex(index, value) {
    }
    destroy() {
      this._filters_ = null;
      if (this.source) {
        this.source.__unlink__(this);
      }
      super.destroy();
    }
    get length() {
      return 0;
    }
    set length(e) {
    }
    __defaultReturn__(USE_ARRAY) {
      return this;
    }
    push(...item) {
      item.forEach((item2) => {
        if (item2 instanceof Array)
          item2.forEach((i) => {
            this.insert(i);
          });
        else
          this.insert(item2);
      });
    }
    get(term, __return_data__) {
      let out = null;
      term = this.getHook("term", term);
      let USE_ARRAY = __return_data__ === null ? false : true;
      if (term) {
        if (__return_data__) {
          out = __return_data__;
        } else {
          if (!this.source)
            USE_ARRAY = false;
          out = this.__defaultReturn__(USE_ARRAY);
          out.__setFilters__(term);
        }
      } else
        out = __return_data__ ? __return_data__ : this.__defaultReturn__(USE_ARRAY);
      if (!term)
        this.__getAll__(out);
      else {
        let terms = term;
        if (!Array.isArray(term))
          terms = [term];
        terms = terms.map((t) => this.validator.parse(t));
        this.__get__(terms, out);
      }
      return out;
    }
    set(item) {
      this.insert(item);
      return false;
    }
    insert(item) {
      item = this.setHook("", item);
      let add_list = this.fv ? [] : null;
      let out_data = false;
      if (Array.isArray(item)) {
        for (let i = 0; i < item.length; i++)
          if (this.__insertSub__(item[i], out_data, add_list))
            out_data = true;
      } else if (item)
        out_data = this.__insertSub__(item, out_data, add_list);
      if (out_data) {
        if (this.par)
          this.par.scheduleUpdate(this.prop_name);
        this.scheduleUpdate();
      }
      return out_data;
    }
    __insertSub__(item, out, add_list) {
      var identifier = this._gI_(item);
      if (identifier !== void 0) {
        if (item && typeof item == "object" && !(item instanceof ObservableBase) && this.model) {
          item = new this.model.constructor(item);
          item.par = this;
        }
        out = this.__insert__(item, add_list);
      }
      return out;
    }
    delete(term, from_root = false) {
      this.remove(term);
    }
    remove(term, from_root = false, __FROM_SOURCE__ = false) {
      if (!__FROM_SOURCE__ && this.source) {
        if (!term)
          return this.source.remove(this._filters_);
        else
          return this.source.remove(term);
      }
      let out_container = [];
      if (!term)
        this.__removeAll__();
      else {
        let terms = Array.isArray(term) ? term : [term];
        terms = terms.map((t) => t instanceof ObservableBase ? t : this.validator.parse(t));
        this.__remove__(terms, out_container);
      }
      if (out_container.length > 0) {
        if (out_container && out_container.length > 0) {
          this.updateViews();
          this.scheduleUpdate();
        }
      }
      return out_container;
    }
    cull(items) {
      let hash_table = {};
      let existing_items = this.__getAll__([]);
      let loadHash = (item) => {
        if (item instanceof Array)
          return item.forEach((e) => loadHash(e));
        let identifier = this._gI_(item);
        if (identifier !== void 0)
          hash_table[identifier] = item;
      };
      loadHash(items);
      for (let i = 0; i < existing_items.lenth; i++) {
        let e_item = existing_items[i];
        if (!existing_items[this._gI_(e_item)])
          this.__remove__(e_item);
      }
      this.insert(items);
    }
    __setFilters__(term) {
      if (!this._filters_)
        this._filters_ = [];
      if (Array.isArray(term))
        this._filters_ = this._filters_.concat(term.map((t) => this.validator.parse(t)));
      else
        this._filters_.push(this.validator.parse(term));
    }
    __filterIdentifier__(identifier, filters) {
      if (filters.length > 0) {
        return this.validator.filter(identifier, filters);
      }
      return true;
    }
    _gIf_(item, term) {
      let t = this._gI_(item, this._filters_);
    }
    _gI_(item, filters = null) {
      return item;
      let identifier;
      if (typeof item == "object" && this.key)
        identifier = item[this.key];
      else
        identifier = item;
      if (identifier && this.validator)
        identifier = this.validator.parse(identifier);
      if (filters && identifier)
        return this.__filterIdentifier__(identifier, filters) ? identifier : void 0;
      return identifier;
    }
    __insert__(item, add_list = this.fv ? [] : null) {
      return false;
    }
    __get__(item, __return_data__) {
      return __return_data__;
    }
    __getAll__(__return_data__) {
      return __return_data__;
    }
    __removeAll__() {
      return [];
    }
    __remove__(term, out_container = null) {
      return false;
    }
  };
  var proto = ObservableContainerBase.prototype;
  _SealedProperty_(proto, "model", null);
  _SealedProperty_(proto, "key", "");
  _SealedProperty_(proto, "validator", null);

  // source/typescript/runtime/observable/observable_array.ts
  var ArrayContainerProxySettings = {
    set: function(obj, prop, val) {
      if (prop in obj && obj[prop] == val)
        return true;
      let property = obj[prop];
      if (property && typeof property == "object")
        property.set(val);
      else
        obj[prop] = val;
      obj.scheduleUpdate(prop);
      return true;
    },
    get: function(obj, prop, val) {
      if (prop in obj)
        return obj[prop];
      if (!isNaN(prop))
        return obj.data[prop];
      let term = {};
      term[obj.key] = prop;
      return obj.get(prop, [])[0];
    }
  };
  var ObservableArray = class extends ObservableContainerBase {
    constructor(data = []) {
      super();
      if (data[0] && data[0].model) {
        if (data[0].model)
          this.model = data[0].model;
        data = data.slice(1);
      }
      this.data = [];
      if (Array.isArray(data) && data.length > 0)
        this.insert(data);
      return this.proxy;
    }
    destroy() {
      this.data = null;
      super.destroy();
    }
    get proxy() {
      return new Proxy(this, ArrayContainerProxySettings);
    }
    set proxy(v) {
    }
    get length() {
      return this.data.length;
    }
    set length(v) {
      let new_length = Math.min(Math.max(0, v), this.data.length);
      this.data.length = new_length;
      this.scheduleUpdate();
    }
    __defaultReturn__(USE_ARRAY) {
      return this;
    }
    __insert__(item, add_list) {
      this.data.push(item);
      if (add_list)
        add_list.push(item);
      return true;
    }
    getByIndex(i) {
      return this.data[i];
    }
    setByIndex(i, m) {
      this.data[i] = m;
    }
    __get__(term, return_data) {
      let terms = null;
      if (term)
        if (term instanceof Array)
          terms = term;
        else
          terms = [term];
      for (let i = 0, l = this.data.length; i < l; i++) {
        let obj = this.data[i];
        if (this._gI_(obj, terms)) {
          return_data.push(obj);
        }
      }
      return return_data;
    }
    __getAll__(return_data) {
      this.data.forEach((m) => {
        return_data.push(m);
      });
      return return_data;
    }
    __removeAll__() {
      let items = this.data.map((d) => d);
      this.data.length = 0;
      return items;
    }
    __remove__(term, out_container) {
      let result = false;
      term = term.map((t) => t instanceof ObservableBase ? this._gI_(t) : t);
      for (let i = 0, l = this.data.length; i < l; i++) {
        var obj = this.data[i];
        if (this._gI_(obj, term)) {
          result = true;
          this.data.splice(i, 1);
          l--;
          i--;
          out_container.push(obj);
          break;
        }
      }
      return result;
    }
    toJSON() {
      return JSON.stringify(this.data);
    }
    [Symbol.iterator]() {
      let i = -1;
      return {
        next: (done) => {
          if (i < this.data.length)
            return { value: this.data[++i], done: i == this.data.length };
          return { value: null, done: true };
        }
      };
    }
    remove(i) {
      if (i >= 0 && i < this.length) {
        this.data.splice(i, 1);
        this.scheduleUpdate();
      }
    }
    splice(i, remove_amount, ...items) {
      this.data.splice(i, remove_amount, ...items);
      this.scheduleUpdate();
    }
    sort(fn) {
      this.data.sort(fn);
      this.scheduleUpdate();
    }
    indexOf(object) {
      return this.data.indexOf(object);
    }
    pop() {
      const v = this.data.pop();
      this.scheduleUpdate();
      return v;
    }
    shift() {
      const v = this.data.shift();
      this.scheduleUpdate();
      return v;
    }
    filter(fn) {
      return this.data.filter(fn);
    }
    map(fn) {
      return this.data.map(fn);
    }
    concat(...items) {
      const new_data = [...this.data];
      for (const item of items) {
        if (item instanceof ObservableArray) {
          new_data.push(...item.data);
        } else if (Array.isArray(item))
          new_data.push(...item);
        else
          new_data.push(item);
      }
      return new_data;
    }
    reduce(fn, val) {
      this.data.reduce(fn, val);
    }
  };
  Object.freeze(ObservableArray);

  // source/typescript/runtime/observable/observable.ts
  var ObservableData = class extends ObservableBase {
    constructor(data) {
      super();
      _SealedProperty_(this, "prop_array", []);
      _SealedProperty_(this, "prop_offset", 0);
      _SealedProperty_(this, "look_up", {});
      if (data)
        for (let name2 in data)
          this.createProp(name2, data[name2]);
      return this;
    }
    get proxy() {
      return this;
    }
    set(data, prop_name = "") {
      if (typeof data == "undefined")
        return false;
      let out = false;
      for (let prop_name2 in data) {
        let index = this.look_up[prop_name2];
        if (index !== void 0) {
          let prop = this.prop_array[index];
          if (typeof prop == "object") {
            if (prop.set(data[prop_name2], true)) {
              this.scheduleUpdate();
              out = true;
            }
          } else if (prop !== data[prop_name2]) {
            this.prop_array[index] = data[prop_name2];
            this.scheduleUpdate();
            out = true;
          }
        } else {
          this.createProp(prop_name2, data[prop_name2]);
          out = true;
        }
      }
      return out;
    }
    createProp(name2, value) {
      let index = this.prop_offset++;
      this.look_up[name2] = index;
      switch (typeof value) {
        case "object":
          if (value) {
            if (Array.isArray(value))
              this.prop_array.push(new ObservableArray(value));
            else {
              if (value instanceof ObservableBase)
                this.prop_array.push(value);
              else
                this.prop_array.push(new Observable(value));
            }
            this.prop_array[index].prop_name = name2;
            this.prop_array[index].par = this;
            Object.defineProperty(this, name2, {
              configurable: false,
              enumerable: true,
              get: function() {
                return this.getHook(name2, this.prop_array[index]);
              },
              set: (v) => {
              }
            });
            break;
          }
        default:
          this.prop_array.push(value);
          Object.defineProperty(this, name2, {
            configurable: false,
            enumerable: true,
            get: function() {
              return this.getHook(name2, this.prop_array[index]);
            },
            set: function(value2) {
              let val = this.prop_array[index];
              if (val !== value2) {
                this.prop_array[index] = this.setHook(name2, value2);
                this.scheduleUpdate(name2);
              }
            }
          });
      }
      this.scheduleUpdate();
    }
    scheduleUpdate() {
      if (this.par && this.par instanceof ObservableArray)
        this.par.scheduleUpdate();
      super.scheduleUpdate();
    }
    toJSON(HOST = true) {
      let data = {};
      for (let name2 in this.look_up) {
        let index = this.look_up[name2];
        let prop = this.prop_array[index];
        if (prop) {
          if (prop instanceof ObservableBase)
            data[name2] = prop.toJSON(false);
          else
            data[name2] = prop;
        }
      }
      return HOST ? JSON.stringify(data) : data.toString();
    }
  };
  function Observable(data) {
    if (Array.isArray(data))
      return new ObservableArray(data);
    return new ObservableData(data);
  }

  // source/typescript/runtime/observable/observable_prototyped.ts
  function CreateSchemedProperty(object, scheme, schema_name, index) {
    if (object[schema_name])
      return;
    Object.defineProperty(object, schema_name, {
      configurable: false,
      enumerable: true,
      get: function() {
        return this.getHook(schema_name, this.prop_array[index]);
      },
      set: function(value) {
        let result = { valid: false };
        let val = scheme.parse(value);
        scheme.verify(val, result);
        if (result.valid && this.prop_array[index] != val) {
          this.prop_array[index] = this.setHook(schema_name, val);
          this.scheduleUpdate(schema_name);
          this._changed_ = true;
        }
      }
    });
  }
  function CreateModelProperty(object, model, schema_name, index) {
    Object.defineProperty(object, schema_name, {
      configurable: false,
      enumerable: true,
      get: function() {
        let m = this.prop_array[index];
        if (!m) {
          let address2 = this.address.slice();
          address2.push(index);
          m = new model(null, this.root, address2);
          m.par = this;
          m.prop_name = schema_name;
          m.MUTATION_ID = this.MUTATION_ID;
          this.prop_array[index] = m;
        }
        return this.getHook(schema_name, m);
      }
    });
  }
  var SchemedContainer = class extends ObservableArray {
    constructor(schema) {
      super(schema.self);
      if (schema.proto)
        for (let name2 in schema.proto)
          _SealedProperty_(this, name2, schema.proto[name2]);
    }
  };
  var ObservableScheme__ = class extends ObservableBase {
    constructor(data, _schema_ = null) {
      super();
      if (this.constructor === ObservableScheme__)
        this.constructor = class extends ObservableScheme__ {
        };
      if (!this.schema) {
        let schema = this.constructor.schema || _schema_;
        this.constructor.schema = schema;
        if (schema) {
          let __FinalConstructor__ = schema.__FinalConstructor__;
          let constructor = this.constructor;
          let prototype = constructor.prototype;
          if (!__FinalConstructor__) {
            let count = 0;
            let look_up = {};
            for (let schema_name in schema) {
              let scheme = schema[schema_name];
              if (schema_name == "self" && Array.isArray(scheme))
                return new SchemedContainer(schema, root, address);
              if (schema_name == "getHook") {
                prototype.getHook = scheme;
                continue;
              }
              if (schema_name == "setHook") {
                prototype.setHook = scheme;
                continue;
              }
              if (schema_name == "proto") {
                for (let name2 in schema.proto)
                  _SealedProperty_(prototype, name2, schema.proto[name2]);
                continue;
              }
              if (typeof scheme == "function") {
                CreateModelProperty(prototype, scheme, schema_name, count);
              } else if (typeof scheme == "object") {
                if (Array.isArray(scheme)) {
                  if (scheme[0] && scheme[0].container && scheme[0].schema)
                    CreateModelProperty(prototype, scheme[0], schema_name, count);
                  else if (scheme[0] instanceof ObservableContainerBase)
                    CreateModelProperty(prototype, scheme[0].constructor, schema_name, count);
                  else
                    CreateModelProperty(prototype, ObservableData, schema_name, count);
                } else if (scheme instanceof SchemeConstructor)
                  CreateSchemedProperty(prototype, scheme, schema_name, count);
                else {
                  CreateModelProperty(prototype, scheme.constructor, schema_name, count);
                }
              } else {
                console.warn(`Could not create property ${schema_name}.`);
                continue;
              }
              look_up[schema_name] = count;
              count++;
            }
            _SealedProperty_(prototype, "prop_offset", count);
            _SealedProperty_(prototype, "look_up", look_up);
            _SealedProperty_(prototype, "changed", false);
            Object.seal(constructor);
            schema.__FinalConstructor__ = constructor;
            return new schema.__FinalConstructor__(data);
          }
          _FrozenProperty_(prototype, "schema", schema);
        } else
          return new ObservableData(data);
      }
      Object.defineProperty(this, "prop_array", { value: new Array(this.prop_offset), enumerable: false, configurable: false, writable: true });
      if (data)
        this.set(data);
    }
    destroy() {
    }
    set(data) {
      if (!data)
        return false;
      this._changed_ = false;
      for (let prop_name in data) {
        let data_prop = data[prop_name];
        let index = this.look_up[prop_name];
        if (index !== void 0) {
          let prop = this[prop_name];
          if (typeof prop == "object") {
            if (prop.set(data_prop, true))
              this.scheduleUpdate(prop_name);
          } else {
            this[prop_name] = data_prop;
          }
        }
      }
      return this._changed_;
    }
    createProp() {
    }
  };
  ObservableScheme__.prototype.toJSON = ObservableData.prototype.toJSON;

  // source/typescript/entry/wick-runtime.ts
  var nop = (_) => true;
  var wick_root = function() {
    console.warn("Wick.rt is incapable of compiling components. Use the full Wick library instead. \n	 A placeholder component will be generated instead.");
    const d = {
      mount: nop,
      get pending() {
        return d;
      },
      class: function() {
        this.ele = document.createElement("div");
        this.ele.innerHTML = "Wick.rt is incapable of compiling components, a dummy component has been generated instead.";
      },
      createInstance: nop
    };
    return d;
  };
  var wick = Object.assign(wick_root, {
    rt,
    setWrapper: nop,
    init_module_promise: null,
    objects: {
      WickRTComponent,
      Context,
      Observable,
      ObservableArray,
      ObservableScheme(obj) {
        return new ObservableScheme__(obj);
      }
    },
    async appendPresets(presets_options) {
      wick.rt.setPresets(presets_options);
      wick.init_module_promise = loadModules(presets_options, wick.rt.context);
      return wick.init_module_promise;
    },
    async hydrate() {
      window.addEventListener("load", async () => {
        if (wick.init_module_promise)
          await wick.init_module_promise;
        const elements = gatherWickElements();
        for (const comp of hydrateComponentElements(elements)) {
          comp.initialize();
          comp.connect();
          rt.root_components.push(comp);
        }
      });
    },
    toString() {
      return;
      `
      __           _    _ _____ _____  _   __      _   
     / _|         | |  | |_   _/  __ | | / /     | |  
  ___| |___      _| |  | | | | | /  /| |/ / _ __| |_ 
 / __|  _  / / / |/| | | | | |    |    | '__| __|
| (__| |   V  V /  /  /_| |_| __/| |   |  | |_ 
 ___|_|   _/_(_)/  / ___/ ____/_| _/_|   __|
 `;
    }
  });
  globalThis["wick"] = wick;
  function gatherWickElements(dom = window.document.body) {
    const pending_elements_queue = [dom], pending_component_elements = [];
    while (pending_elements_queue.length > 0)
      for (const element of Array.from(pending_elements_queue.shift().children ?? []))
        if (element.nodeType == Node.ELEMENT_NODE)
          if (Element_Is_Wick_Template(element))
            rt.templates.set(element.id, element);
          else if (Element_Is_Wick_Component(element))
            pending_component_elements.push(element);
          else
            pending_elements_queue.push(element);
    return pending_component_elements;
  }
  var wick_runtime_default = wick;
})();
