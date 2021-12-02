//@ts-ignore
import glow from '@candlelib/glow';
import URI from '@candlelib/uri';
import { Logger } from "@candlelib/log";
import Wick, { gatherWickElements } from '../../entry/wick-runtime.js';
import { ComponentElement } from '../runtime/component.js';
import { Element } from "./element.js";
import { PageType, PageView } from "./page.js";

type GlowAnimation = typeof glow;

const async_function = (async function () { }).constructor;

const URL_HOST = { wurl: <URI | null>null };

export {
    PageView,
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

    pages: any;
    elements: any;
    component_constructors: any;
    models_constructors: any;
    current_url: any;
    current_query: any;
    current_view: PageView | null;
    finalizing_pages: any;
    prev: any;
    IGNORE_NAVIGATION: boolean;
    glow: GlowAnimation;
    wick: typeof Wick;
    modal_stack: PageView[];
    prev_url: URI | null;

    /**
     * Constructs the object.
     */
    constructor(wick: typeof Wick) {

        //Initialize CSS + Conflagrate Parsers

        this.pages = {};

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

    finalizePageDisconnects(pages: PageView[] = this.finalizing_pages) {

        for (const page of pages)

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

            IS_SAME_PAGE = (this.current_url == url),

            page = null;

        if ((page = this.pages[wurl.path])) {

            page.reply = pending_modal_reply;

            if (
                IS_SAME_PAGE
                &&
                this.current_view == page

            ) {

                URL_HOST.wurl = wurl;

                logger.log("missing same-page resolution");

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
            this.loadPage(page, wurl, IS_SAME_PAGE);
    }

    /**
        Creates a new iframe object that acts as a modal that will sit ontop of everything else.
    */
    loadNonWickPage(URL: URI) {

        const

            url_string = URL.toString(),

            iframe = document.createElement("iframe"),

            page = new PageView(URL, <ComponentElement><any>iframe);

        iframe.src = url_string;

        iframe.classList.add("modal", "comp_wrap");

        page.type = PageType.WICK_MODAL;

        this.pages[url_string] = page;

        return this.pages[url_string];
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
        page: PageView,
        wurl: string | URI = new URI(document.location.href),
        IS_SAME_PAGE = false
    ) {

        if (typeof wurl == "string")
            wurl = new URI(wurl);

        URL_HOST.wurl = wurl;

        let transition = this.glow.createTransition();

        let app_ele = document.getElementById("app");

        if (!app_ele)
            throw ("App element not found");

        let finalizing_pages: PageView[] = [];

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
                    a.transitionOut(transition.out);
                }
                return r;
            }, <PageView[]>[]);

            this.modal_stack.push(page);

            this.current_view = null;

            if (page.type != PageType.WICK_TRANSITIONING_MODAL) {
                page.connect(getModalContainer(this), wurl);
                page.transitionIn(transition.in);

                transition.asyncPlay().then(() => { this.finalizePageDisconnects(finalizing_pages); });

                return;
            }


        } else {
            this.prev_url = wurl;
            this.current_view = page;
            this.current_url = wurl.toString();

            for (const modal of this.modal_stack) {

                modal.primeDisconnect();

                modal.transitionOut(transition.out);

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

        this.finalizePageDisconnects(finalizing_pages);

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
            console.warn("Page does not have an <app> element!");
            return this.loadNonWickPage(url);
        }

        if (app_source && dom_app) {

            var page: PageView | null = null;

            gatherWickElements(<HTMLElement><any>DOM);

            if (document == DOM) {
                // APP_PAGE Element is used as a stage for all element containers
                var app_page: ComponentElement = <ComponentElement>document.createElement(dom_app.tagName);

                app_page.classList.add(...dom_app.classList.toString().split(" "));

                // Move all elements into app page
                app_page.append(...Array.from(app_source.childNodes));

                dom_app.appendChild(app_page);

                dom_app.classList.remove(...dom_app.classList.toString().split(" "));

                page = new PageView(url, app_page);

                const wick_style = DOM.getElementById("wick-app-style");

                if (wick_style)
                    page.style = wick_style;

            } else {

                // Gather an initialize the pages wick-init-script (if present) and the 
                // 
                const wick_script = DOM.getElementById("wick-component-script");

                if (wick_script)
                    await (async_function("wick", wick_script.innerHTML))(this.wick);

                const wick_style = DOM.getElementById("wick-app-style");

                page = new PageView(url, app_source);

                if (wick_style)
                    page.style = wick_style.cloneNode(true);
            }

            if (app_source.dataset.modal == "true" || pending_modal_reply) {

                page.setType(PageType.WICK_MODAL, this);
                let modal: ComponentElement = <ComponentElement>document.createElement("radiate-modal");
                modal.innerHTML = app_source.innerHTML;
                app_source.innerHTML = "";
                app_source = modal;

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

            if (!NO_BUFFER) this.pages[url.path] = page;



            return page;
        }
        return null;
    }

}
