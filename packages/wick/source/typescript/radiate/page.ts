import URI from '@candlelib/uri';
import { ComponentElement, WickRTComponent } from '../runtime/component.js';
import { hydrateComponentElements } from '../runtime/html.js';
import { Element } from './element.js';

export const enum PageType {
    WICK_PAGE,
    WICK_MODAL,

    WICK_TRANSITIONING_MODAL,
    STANDARD
}

/**
 * Page visualization of the data that model contains.
 */
export class PageView {

    url: URI;
    eles: Element[];
    finalizing_view;
    type: PageType;
    component: WickRTComponent;
    ele: ComponentElement;
    ele_backer: HTMLElement;
    CONNECTED: boolean;
    SHOULD_CLOSE: boolean;
    style: any;
    reply: any;

    page_component_name: string;

    constructor(URL: URI, app_page: ComponentElement) {

        //Initialize the app_page
        this.page_component_name = app_page.classList[0];
        this.url = URL;
        this.eles = [];
        this.finalizing_view = null;
        this.type = PageType.STANDARD;
        this.ele = app_page;
        this.component = null;
        this.ele_backer = null;
        this.CONNECTED = false;
        this.SHOULD_CLOSE = false;
        this.style = null;

        this.init_components();
    }

    init_components() {

        for (const comp of hydrateComponentElements([this.ele]))
            comp.initialize(null).connect();


        this.component = this.ele.wick_component;

        //Only gather radiate elements that are direct children of the 
        //app node to reduce the complexity of transitioning between 
        //pages.

        const radiate_elements: ComponentElement[] = <any>

            Array.from(this.ele.querySelectorAll(`[radiate=${this.page_component_name}]`)).
                filter(ele => ele.parentElement == this.ele);

        for (const ele of radiate_elements)
            this.eles.push(new Element(ele, this));

    }

    destroy() {
        //for (const element of this.eles)
        //    element.destroy();

        this.eles = null;
        this.ele = null;
    }

    finalizeDisconnect() {

        if (this.CONNECTED) return;

        for (const ele of this.eles)
            ele.finalizeDisconnect();

        if (this.ele.parentElement)
            this.ele.parentElement.removeChild(this.ele);

        if (this.style && this.style.parentElement)
            this.style.parentElement.removeChild(this.style);
    }

    primeDisconnect() {

        this.CONNECTED = false;

        for (const element of this.eles)
            element.disconnectComponents();
    }

    getElement(id: string) {
        return this.eles.find((e) => e.id == id);
    }

    connect(
        app_element: HTMLElement,
        wurl: URI,
        prev_page: PageView = null
    ) {

        if (this.style && !this.style.parentElement)
            document.head.appendChild(this.style);

        this.CONNECTED = true;

        if (app_element.firstChild)
            app_element.insertBefore(this.ele, app_element.firstChild);
        else
            app_element.appendChild(this.ele);

        for (const element of this.eles) {

            let contemporary = (prev_page && element.ele.id)
                ? prev_page.getElement(element.id)
                : null;

            element.loadComponents(wurl, contemporary);
        }
    }
    up(data, src) {
        for (const element of this.eles)
            element.down(data, src);
    }
    transitionOut(transition) {
        this.component.transitionOut(0, 0, false, transition);
    }

    transitionIn(transition) {
        this.component.transitionIn(0, 0, false, transition);
    }

    setType(type, router) {
        this.type = type || "normal";

        if (type == "modal") {

            if (!this.ele_backer) {

                this.ele_backer = document.createElement("div");

                this.ele_backer.classList.add("modal_backer");

                this.ele.insertBefore(this.ele_backer, this.ele.firstChild);

                this.ele_backer.addEventListener("click", (e) => {

                    if (e.target == this.ele_backer) {
                        router.closeModal();
                    }
                });
            }
        }
    }
}
