import URI from '@candlelib/uri';
import { ComponentElement, WickRTComponent } from '../runtime/component.js';
import { PageView } from './page.js';

/**
 * Class for element.
 *
 * @class      Element (name)
 * 
 * Elements are the root scope for a set of components. 
 * If two pages share the same element name, then the element will remain mounted 
 * on the page as it transitions to the next. Elements are used to determine how 
 * one page transitions into another. 
 */
export class Element {

    id: any;
    component: WickRTComponent;
    interior_components: Map<string, WickRTComponent>;
    bubbled_elements: any;
    wraps: any;
    page: any;
    unique: boolean;
    ele: HTMLElement;

    /**
     * Constructs an Element.
     *
     * @param      {HTMLElement}  element  The HTMLElement that this Element will be bound to. 
     */
    constructor(element: ComponentElement, page: PageView | null = null) {

        this.id = element.id || element.classList[0];

        this.component = element.wick_component;

        this.bubbled_elements = null;

        this.wraps = [];

        this.page = page;

        this.interior_components = new Map;

        //The original element container.
        //this.parent_element = parent_element;

        //Content that is wrapped in an ele_wrap
        this.ele = element;

        if (element.dataset.unique)
            this.unique = !!element.dataset.unique;
        else
            this.unique = false;

        this.setComponents();
    }


    up(data, src) {
        //  this.page.up(data, src);
    }

    down(data: any, src: any) {
        this.component.update(data);
    }

    /**
     * Unmount any components that have CONNECTED set to false 
     * and are still mounted to DOM.
     */
    finalizeDisconnect() {
        //for (const comp of this.interior_components.filter(c => !c.CONNECTED && c.ele.parentElement))
        //    comp.removeFromDOM();

        //this.component.disconnect();
    }

    disconnectComponents() {
        //this.component.disconnect();

    }

    loadComponents(url: URI, outgoing_element: Element) {

        //for (let i = 0; i < this.interior_components.length; i++)
        //    this.interior_components[i].update({ mounted: true });

        let before = this.ele.firstChild;

        //Reinsert any components that have been replaced by wraps
        for (let i = 0; i < this.wraps.length; i++) {
            const wrap = this.wraps[i];
            if (wrap.parentElement) {
                const comp = this.interior_components[i];
                wrap.parentElement.replaceChild(wrap, comp.ele);
            }
        }

        // If there are any interior components that have matching ids
        // with the current components, replace the current components 
        // with the contemporary. This will should the effect of keeping
        // the contemporary Element->Page alive? 

        // Yes, allow the contemporary to be swapped with the local component
        // replacing the elements with the parent element. This is allowed
        // as long as the contemporary has the same component hash as the 
        // local one. 

        // the contemporary to be transferred to the local component.
        // the contemporary will still be removed. 

        if (outgoing_element) {

            const temp_ele = document.createElement("temp");
            for (const [id_hash, outgoing_comp] of outgoing_element.interior_components) {

                if (this.interior_components.has(id_hash)) {
                    console.log(outgoing_element.interior_components);
                    //Swap 
                    const
                        incoming_comp = <WickRTComponent>this.interior_components.get(id_hash),

                        incoming_parent = incoming_comp.par,

                        outgoing_parent = outgoing_comp.par,

                        outgoing_index = outgoing_parent.ch.indexOf(outgoing_comp),

                        incoming_index = incoming_parent.ch.indexOf(incoming_comp),

                        incoming_par_ele = incoming_comp.ele?.parentElement,

                        outgoing_par_ele = outgoing_comp.ele?.parentElement;

                    //Primary parent ele will be removed from document as it belongs to the
                    //outgoing `contemporary` Element
                    outgoing_par_ele.replaceChild(temp_ele, outgoing_comp.ele);

                    //Secondary parent ele will be removed from document as it belongs to the
                    //outgoing `contemporary` Element
                    incoming_par_ele.replaceChild(outgoing_comp.ele, incoming_comp.ele);

                    outgoing_par_ele.replaceChild(incoming_comp.ele, temp_ele);

                    outgoing_element.interior_components.set(id_hash, incoming_comp);

                    this.interior_components.set(id_hash, outgoing_comp);

                    incoming_parent.ch[incoming_index] = outgoing_comp;

                    outgoing_parent.ch[outgoing_index] = incoming_comp;

                    incoming_comp.par = incoming_parent;

                    outgoing_comp.par = outgoing_parent;


                    //TODO: Do Something to update component elements
                }
            }
        }
        //* /;
    }

    transitionOut(transition) {
        this.component.transitionOut(0, 0, true, transition);
    }

    transitionIn(transition) {
        this.component.transitionIn(0, 0, true, transition);
    }

    bubbleLink(link_url, child, trs_ele = {}) {

        this.bubbled_elements = trs_ele;

        history.pushState({}, "ignored title", link_url);

        window.onpopstate(new PopStateEvent("wick-bubble"));
    }

    setComponents() {
        //if there is a component inside the element, register that component if it has not already been registered

        var component_elements: ComponentElement[] = Array.prototype.map.call(this.ele.querySelectorAll(`[w\\:c]`), (a) => a);
        for (const component_element of component_elements) {

            //const
            /**
                Replace the component with a component wrapper to help preserve DOM arrangement
            */
            //comp_wrap = document.createElement("div");

            //comp_wrap.classList.add("comp_wrap", component_element.wick_component.name);

            //component_element.parentElement.replaceChild(comp_wrap, component_element);

            const component = component_element.wick_component;

            if (component_element.id) {

                const id_hash: string = component_element.id + "--" + component.name;

                //  this.wraps.push(comp_wrap);

                this.interior_components.set(id_hash, component);
            }
        }
    }
}
