import glow from '@candlelib/glow';
import { Logger } from "@candlelib/log";
import URI from '@candlelib/uri';
import Wick, { gatherWickElements } from '../../entry/wick-runtime.js';
import { Observable } from '../index.js';
import { ComponentElement } from '../runtime/component/component.js';
import { Element } from "./element.js";
import { Page, PageType } from "./page.js";

type GlowAnimation = typeof glow;

const async_function = (async function () { }).constructor;

const URL_HOST = { wurl: <URI | null>null };

export {
    Page as PageView,
    Element
};

const logger = Logger.get("radiate").activate();

/** @namespace Router */

/**
 * Returns the `<modal>` element from the document DOM, or creates and 
 * appends a new one to `<body>`.
 */
function getModalContainer(router: Router): HTMLElement {

    let modal_container = document.getElementsByTagName("radiate-modals")[0];

    if (!modal_container) {

        modal_container = document.createElement("radiate-modals");

        var dom_app = document.getElementById("app");

        if (dom_app)
            dom_app.appendChild(modal_container);
        else
            document.body.appendChild(modal_container);

        modal_container.addEventListener("click", (e) => {
            if (e.target == modal_container) {
                router.closeModal();
            }
        });
    }

    return <any>modal_container;
}

/** 
 * Responsible for loading pages dynamically, handling the transition of 
 * page components, and monitoring and reacting to URL changes
 */
export class Router {

    pages: Map<string, Page>;
    elements: any;
    component_constructors: any;
    models_constructors: any;
    current_url: any;
    current_query: any;
    current_view: Page | null;
    finalizing_pages: Page[];
    prev: any;
    IGNORE_NAVIGATION: boolean;
    glow: GlowAnimation;
    wick: typeof Wick;
    modal_stack: Page[];
    prev_url: URI | null;

    model: Observable<{
        uri: URI | null;
    }>;

    /**
     * Constructs the object.
     */
    constructor(wick: typeof Wick) {

        //Initialize CSS + Conflagrate Parsers

        this.pages = new Map;

        this.elements = {};

        this.component_constructors = null;

        this.models_constructors = null;

        this.current_url = null;

        this.current_query = null;

        this.current_view = null;

        this.IGNORE_NAVIGATION = false;

        this.finalizing_pages = [];

        this.prev = null;

        this.prev_url = null;

        this.glow = glow;

        this.wick = wick;

        wick.rt.context.api.router = {

            default: null,

            page_uir: null,

            setHashSilently: (string: string) => {
                history.replaceState(null, "", document.location.pathname + '#' + string);
                this.current_url.hash = string;
            },

            setHash: (string: string) => {
                document.location.hash = string;
            },

            getHash: (): string => {
                return document.location.hash;
            },

            setLocation: (string: string) => {

                let url = new URI(string);

                if (!url.host) {
                    url.host = URI.GLOBAL.host;
                    url.port = URI.GLOBAL.port;
                    if (!url.protocol)
                        url.protocol = URI.GLOBAL.protocol;
                }

                this.parseURL(url);
            }
        };

        wick.rt.context.processLink = (temp: HTMLElement) => {
            if (!temp.onclick) temp.onclick = (e: MouseEvent) => {

                let link: HTMLAnchorElement = <any>e.currentTarget;

                if (link.origin !== location.origin) return;

                e.preventDefault();

                //TODO: allow preloading of pages and modals

                history.pushState({}, "ignored title", link.href);


                if (window)
                    window.onpopstate?.(<any>e);
            };
        };

        /* */
        this.modal_stack = [];

        window.onpopstate = (e: PopStateEvent = <any>{}) => {

            if (this.IGNORE_NAVIGATION) {
                this.IGNORE_NAVIGATION = false;
                return;
            }

            if (e.state && e.state.modal_state) {
                this.parseURL(e.state.modal_url);
            } else {
                this.parseURL(document.location.toString());
            }
        };
    }

    finalizePageDisconnects() {

        for (const page of this.finalizing_pages)

            page.finalizeDisconnect();

        this.finalizing_pages.length = 0;
    }


    closeModal(data = {}) {

        let top = this.modal_stack.length - 1;

        let modal = this.modal_stack[top];

        modal.SHOULD_CLOSE = true;

        if (modal.reply)
            modal.reply(data);

        modal.reply = null;

        let next_modal = this.modal_stack[top - 1];

        if (next_modal)
            return this.loadPage(next_modal);


        if (this.prev_url)

            return this.parseURL(this.prev_url.toString(), this.prev_url);

        return new URI(this.current_url);
    }

    /*
        This function will parse a URL and determine what Page needs to 
        be loaded into the current view.
    */
    async parseURL(
        location: string | URI,
        wurl: URI = new URI(location),
        pending_modal_reply = null
    ) {

        let
            url = wurl.toString(),

            IS_SAME_URL = (
                (this.current_url + "") == (wurl + "")
            ),

            page = null;

        if ((this.pages.has(wurl.path))) {

            page = <Page>this.pages.get(wurl.path);

            page.reply = pending_modal_reply;

            if (
                IS_SAME_URL
                &&
                this.current_view == page
                &&
                this.modal_stack.length == 0

            ) {

                URL_HOST.wurl = wurl;

                if (wurl.hash && wurl.hash != document.location.hash) {
                    document.location.hash = wurl.hash;
                    logger.log("hash updated");
                }

                return;
            }

        } else if (location) {

            try {

                const html = await wurl.fetchText();

                const DOM = (new DOMParser()).parseFromString(html, "text/html");

                page = await this.loadNewPage(wurl, DOM, pending_modal_reply);

            } catch (e) {
                logger.warn(
                    `Unable to process response for request made to: ${wurl}. Response: ${e}. Error Received: ${e}`
                );
            }
        }

        if (page)
            this.loadPage(page, wurl, IS_SAME_URL);
    }

    /**
        Creates a new iframe object that acts as a modal that will sit ontop of everything else.
    */
    loadNonWickPage(URL: URI) {

        const

            url_string = URL.toString(),

            iframe = document.createElement("iframe"),

            page = new Page(URL, <ComponentElement><any>iframe);

        iframe.src = url_string;

        iframe.classList.add("modal", "comp_wrap");

        page.type = PageType.WICK_MODAL;

        this.pages.set(url_string, page);

        return page;
    }
    /**
        Takes the DOM of another page and strips it, looking for 
        elements to use to integrate into the SPA system.
        If it is unable to find these elements, then it will pass the DOM 
        to loadNonWickPage to handle wrapping the page body into a wick app element.
    */


    /**
     * Loads pages from server, or from local cache, and sends it to the page parser.
     * @param {String} url - The URL id of the cached page to load.
     * @param {String} query -
     * @param {Bool} IS_SAME_PAGE -
     */
    async loadPage(
        page: Page,
        wurl: string | URI = new URI(document.location.href),
        IS_SAME_PAGE = false
    ) {

        if (typeof wurl == "string")
            wurl = new URI(wurl);

        //Update the radiate API for components
        this.wick.rt.context.api.router.page_url = wurl;

        URL_HOST.wurl = wurl;

        let transition = this.glow.createTransition(true);

        let app_ele = document.getElementById("app");

        if (!app_ele)
            throw ("App element not found");

        let finalizing_pages: Page[] = this.finalizing_pages;

        let current_view = this.current_view;

        if (page.type == PageType.WICK_MODAL || page.type == PageType.WICK_TRANSITIONING_MODAL) {

            page.SHOULD_CLOSE = false;

            // Replace the URL with the previous calling URL to prevent subsequent 
            // attempts of navigation to the modal resource.

            let u = new URL(this.prev_url?.toString() ?? this.current_url.toString());

            u.hash = `modal://${wurl + ""}`;

            history.replaceState({
                modal_state: true,
                modal_url: wurl.toString()
            }, "ignored title", u.toString());

            //trace modal stack and see if the modal already exists
            if (IS_SAME_PAGE)
                return;

            let FORCE_CLOSE = (page.type == PageType.WICK_TRANSITIONING_MODAL);

            this.modal_stack = this.modal_stack.reduce((r, a) => {

                if ((!(FORCE_CLOSE || a.SHOULD_CLOSE))) {
                    r.push(a);
                } else if (a !== page) {
                    a.primeDisconnect();
                    finalizing_pages.push(a);
                    a.transitionOut(transition);
                }
                return r;
            }, <Page[]>[]);

            this.modal_stack.push(page);

            if (page.type != PageType.WICK_TRANSITIONING_MODAL) {

                page.connect(getModalContainer(this), wurl);

                page.transitionIn(transition);

                await transition.asyncPlay();

                this.finalizePageDisconnects();

                return;
            }


        } else {
            this.prev_url = wurl;
            this.current_view = page;
            this.current_url = new URI(wurl);

            for (const modal of this.modal_stack) {

                modal.primeDisconnect();

                modal.transitionOut(transition);

                finalizing_pages.push(modal);
            }

            this.modal_stack.length = 0;
        }

        if (current_view && current_view != page) {

            //Set all components 

            current_view.primeDisconnect();

            page.connect(app_ele, wurl, current_view);

            current_view.transitionOut(transition);

            finalizing_pages.push(current_view);

            page.transitionIn(transition);

        } else if (!current_view) {
            page.connect(app_ele, wurl);

            page.transitionIn(transition);
        }

        await transition.asyncPlay();

        page.transitionComplete();

        this.finalizePageDisconnects();

        for (const anchor of Array.from(document.querySelectorAll("a")))
            this.wick.rt.context.processLink(anchor);
    }

    /**
     * 
     * @param url - URI object
     * @param DOM - The DOM object from the iframe page.
     * @param pending_modal_reply 
     * @returns 
     */
    async loadNewPage(
        url: string | URI = new URI("", true),
        DOM: Document,
        pending_modal_reply = null) {

        // At this point, the whether the DOM is the actually document our it is an imported
        // source, the components have not been initialized through the wick loader. This 
        // will need to be done one way or another for all this to work. 

        if (typeof url == "string")
            url = new URI(url);

        //look for the app section.

        /* 
            App elements: There should only be one. 
        */
        let app_source: ComponentElement = <ComponentElement>DOM.getElementById("app");

        var dom_app = document.getElementById("app");

        /**
          If there is no <app> element within the DOM, then we must handle this 
          case carefully. This likely indicates a page delivered from the same 
          origin that has not been converted to work with the Wick system. The 
          entire contents of the page can be wrapped into a <iframe>, that will 
          be could set as a modal on top of existing pages.
        */
        if (!app_source) {
            logger.warn("Page does not have an <app> element!");
            return this.loadNonWickPage(url);
        }

        if (app_source && dom_app) {

            var page: Page | null = null;

            gatherWickElements(<HTMLElement><any>DOM);

            if (document == DOM) {
                // APP_PAGE Element is used as a stage for all element containers
                var app_page: ComponentElement = <ComponentElement>document.createElement(dom_app.tagName);

                app_page.classList.add(...dom_app.classList.toString().split(" "));

                // Move all elements into app page
                app_page.append(...Array.from(app_source.childNodes));

                dom_app.appendChild(app_page);

                dom_app.classList.remove(...dom_app.classList.toString().split(" "));

                page = new Page(url, app_page);

                const wick_style = DOM.getElementById("wick-app-style");

                if (wick_style)
                    page.style = wick_style;

            } else {

                // Gather an initialize the pages wick-init-script (if present) and the 
                // 
                const wick_script = DOM.getElementById("wick-component-script");

                if (wick_script)
                    await (async_function("wick", wick_script.innerHTML))(this.wick);

                await this.wick.init_module_promise;

                const wick_style = DOM.getElementById("wick-app-style");

                page = new Page(url, app_source);

                if (wick_style)
                    page.style = wick_style.cloneNode(true);
            }

            if (app_source.classList.contains("modal") || pending_modal_reply) {

                page.setType(PageType.WICK_MODAL, this);

                page.reply = pending_modal_reply;

                /*
                    If the DOM is the same element as the actual document, 
                    then we shall rebuild the existing <app> element, clearing 
                    it of it's contents.
                */
                if (DOM == document && dom_app) {
                    let new_app = document.createElement("app");
                    document.body.replaceChild(new_app, dom_app);
                    dom_app = new_app;
                }
            } else if (app_source.dataset.modal == "transition") {
                page.setType(PageType.WICK_TRANSITIONING_MODAL, this);
            }

            /**
                If the page should not be reused, as in cases where the server 
                does all the rendering for a dynamic page and we're just 
                presenting the results, then having NO_BUFFER set to true will 
                cause the linker to not save the page to the hash table of 
                existing pages, forcing a request to the server every time 
                the page is visited.
            */
            let NO_BUFFER = false;

            if (app_source.dataset.no_buffer == "true")
                NO_BUFFER = true;

            if (!NO_BUFFER) this.pages.set(url.path, page);

            return page;
        }
        return null;
    }

}
