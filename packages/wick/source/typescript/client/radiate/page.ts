import { Transition } from '@candlelib/glow';
import URI from '@candlelib/uri';
import { Environment, envIs } from '../../common/env.js';
import { ComponentElement, WickRTComponent } from '../runtime/component/component.js';
import { hydrateComponentElements } from '../runtime/component/html.js';
import { rt } from '../runtime/runtime.js';
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
export class Page {

    url: URI;
    eles: Element[];
    type: PageType;
    component: WickRTComponent | null;
    ele: ComponentElement | null;
    ele_backer: HTMLElement | null;
    CONNECTED: boolean;
    SHOULD_CLOSE: boolean;
    style: any;
    reply: any;
    title?: HTMLTitleElement;
    page_component_name: string;

    constructor(URL: URI, app_page: ComponentElement, title?: HTMLTitleElement) {

        app_page.classList.add("radiate-page");

        //Initialize the app_page
        this.page_component_name = app_page.classList[0];
        this.url = URL;
        this.eles = [];
        this.type = PageType.STANDARD;
        this.ele = app_page;
        this.component = null;
        this.ele_backer = null;
        this.CONNECTED = false;
        this.SHOULD_CLOSE = false;
        this.style = null;
        this.title = title;
        this.init_components();
    }

    init_components() {

        if (this.ele) {
            for (const comp of hydrateComponentElements([this.ele])) {
                if (comp) {
                    try {
                        comp.initialize();
                    } catch (e) {
                        console.error(e);
                    }

                    if (envIs(Environment.WORKSPACE))
                        rt.addRootComp(comp);
                }
            }


            this.component = this.ele.wick_component;

            //Only gather radiate elements that are direct children of the 
            //app node to reduce the complexity of matching 
            //transitioning between pages.

            const radiate_elements: ComponentElement[] = <any>

                Array.from(this.ele.querySelectorAll(`[radiate=${this.page_component_name}]`)).
                    filter(ele => ele.parentElement == this.ele);

            for (const ele of radiate_elements)
                this.eles.push(new Element(ele, this));

        }
    }

    destroy() {
        //for (const element of this.eles)
        //    element.destroy();

        this.eles = [];
        this.ele = null;
    }

    finalizeDisconnect() {

        if (this.CONNECTED) return;

        if (this.ele) {


            for (const ele of this.eles)
                ele.finalizeDisconnect();

            if (this.ele.parentElement)
                this.ele.parentElement.removeChild(this.ele);

            if (this.style && this.style.parentElement)
                this.style.parentElement.removeChild(this.style);
        }
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
        prev_page: Page | null = null
    ) {

        if (this.style && !this.style.parentElement)
            document.head.appendChild(this.style);

        if (this.title)
            document.title = this.title.innerText;

        if (this.ele) {

            this.ele.classList.add('radiate-init', "radiate-hide");

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
    }
    up(data: any, src: any) {
        for (const element of this.eles)
            element.down(data, src);
    }

    transitionStart() {
        if (this.ele)
            this.ele.classList.remove('radiate-hide');
    }

    transitionOut(transition: Transition) {
        if (this.component) {
            this.component.transitionOut(0, 0, false, transition);
        }
    }

    transitionIn(transition: Transition) {
        if (this.component)
            this.component.transitionIn(0, 0, false, transition);

        if (this.ele)
            this.ele.classList.remove('radiate-init');
    }

    transitionComplete() {
        if (this.component)
            this.component.transitionInEnd();
    }

    setType(type: PageType, router: any) {

        this.type = type || PageType.STANDARD;

        if (type == PageType.WICK_MODAL) {
            if (this.ele)
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
