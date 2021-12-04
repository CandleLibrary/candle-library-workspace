import spark, { Sparky } from "@candlelib/spark";

import { ObservableModel, ObservableWatcher } from "../../../types/model.js";

export const _SealedProperty_ = (object: any, name: string, value: any) =>
    Object.defineProperty(object, name, { value, configurable: false, enumerable: false, writable: true });
export const _FrozenProperty_ = (object: any, name: string, value: any) =>
    Object.defineProperty(object, name, { value, configurable: false, enumerable: false, writable: false });

/**
 * The base class which all Model classes extend.
 * @memberof module:wick~internal .model
 * @alias ModelBase
 */
class ObservableBase implements ObservableModel, Sparky {

    OBSERVABLE: true;

    fv;
    _SCHD_: number;

    _cv_: any[];
    par: ObservableBase;

    prop_array: any[];

    prop_name: string;
    observers: ObservableWatcher[];

    data: any;

    constructor() {
        _SealedProperty_(this, "OBSERVABLE", true);
        _SealedProperty_(this, "_SCHD_", 0);
        _SealedProperty_(this, "_cv_", []);
        _SealedProperty_(this, "fv", null);
        _SealedProperty_(this, "par", null);
        _SealedProperty_(this, "prop_name", "");
        _SealedProperty_(this, "observers", []);
    }


    /**
     *   Remove all references to any objects still held by this object.
     *   @protected
     *   @instance
     */
    destroy() {

        //inform views of the models demise
        var view = this.fv;

        while (view) {
            let nx = view.nx;
            view.unsetModel();
            view = nx;
        }

        this._cv_.length = 0;
    }

    setHook(prop_name: string, data: any) { return data; }

    getHook(prop_name: string, data: any) { return data; }


    /**
     * Called by a class that extends ModelBase when on of its property values changes.
     * @param      {string}  changed_value  The changed value
     * @private
     */
    scheduleUpdate(changed_value?: any) {

        if (this.par) this.par.scheduleUpdate();

        if (this.observers.length == 0)
            return;

        if (changed_value)
            this._cv_.push(changed_value);

        spark.queueUpdate(this);
    }


    /**
     * Adds a view to the linked list of views on the model. argument view MUST be an instance of View. 
     * @param {View} view - The view to _bind_ to the ModelBase
     * @throws {Error} throws an error if the value of `view` is not an instance of {@link View}.
     */
    subscribe(view: ObservableWatcher): boolean {

        if (this.observers.indexOf(view) >= 0)
            return false;

        this.observers.push(view);

        view.onModelUpdate(<any>this);

        return true;
    }

    /**
     * Removes view from set of views if the passed in view is a member of model. 
     * @param {View} view - The view to unbind from ModelBase
     */
    unsubscribe(view: any): boolean {

        if (this.observers.indexOf(view) >= 0) {
            this.observers.splice(this.observers.indexOf(view), 1);
            return true;
        }
        return false;
    }



    /**
     * Called by the {@link spark} when if the ModelBase is scheduled for an update
     * @param      {number}  step    The step
     */
    scheduledUpdate(step: number) { this.updateViews(); }



    /**
     * Calls View#update on every bound View, passing the current state of the ModelBase.
     */
    updateViews() {

        for (const view of this.observers)
            view.onModelUpdate(<any>this);

        return;
    }

    toJSON(host: boolean) { return JSON.stringify(this, null, '\t'); }

    set(data: any) { return false; }
}

export { ObservableBase };
