import { ObservableBase } from "./base.js";
import { ObservableContainerBase } from "./container_base.js";
import { ObservableData } from "./observable.js";

const ArrayContainerProxySettings = {

    set: function (obj, prop, val) {
        if (prop in obj && obj[prop] == val)
            return true;

        let property = obj[prop];

        if (property && typeof (property) == "object")
            property.set(val);
        else
            obj[prop] = val;

        obj.scheduleUpdate(prop);

        return true;
    },

    get: function (obj, prop, val) {

        if (prop in obj)
            return obj[prop];

        if (!isNaN(prop))
            return obj.data[prop];

        let term = {};

        term[obj.key] = prop;

        return obj.get(prop, [])[0];
    }
};

/**
    Stores models in random order inside an internal array object. 
 */

export class ObservableArray<T> extends ObservableContainerBase<T> {
    //Default model to assign new objects to
    model: ObservableData;

    data: T[];

    key: string;

    constructor(data = []) {

        super();

        if (data[0] && data[0].model) {

            if (data[0].model) this.model = data[0].model;

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

    get proxy() { return new Proxy(this, ArrayContainerProxySettings); }

    set proxy(v) { }

    get length() { return this.data.length; }

    set length(v) {

        let new_length = Math.min(Math.max(0, v), this.data.length);

        this.data.length = new_length;

        this.scheduleUpdate();
    }

    __defaultReturn__(USE_ARRAY) {

        return this;
    }

    __insert__(item: any, add_list: any[]) {

        this.data.push(item);

        if (add_list) add_list.push(item);

        return true; // Model added to Container.
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
        let items = this.data.map(d => d); // [];

        this.data.length = 0;

        return items;
    }
    __remove__(term, out_container) {

        let result = false;

        term = term.map(t => (t instanceof ObservableBase) ? this._gI_(t) : t);

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

    toJSON() { return JSON.stringify(this.data); }

    [Symbol.iterator]() {
        let i = -1;

        return {
            next: (done?: boolean) => {
                if (i < this.data.length)
                    return { value: this.data[++i], done: i == this.data.length };
                return { value: null, done: true };
            }
        };
    }

    remove(i: number) {
        if (i >= 0 && i < this.length) {
            this.data.splice(i, 1);
            this.scheduleUpdate();
        }
    };

    splice(i: number, remove_amount: number, ...items) {
        this.data.splice(i, remove_amount, ...items);
        this.scheduleUpdate();
    };

    sort(fn) {
        this.data.sort(fn);
        this.scheduleUpdate();
    }

    indexOf(object) { return this.data.indexOf(object); }
    pop() { const v = this.data.pop(); this.scheduleUpdate(); return v; }
    shift() { const v = this.data.shift(); this.scheduleUpdate(); return v; }
    filter(fn) { return this.data.filter(fn); }
    map(fn) { return this.data.map(fn); }
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
    reduce(fn, val) { this.data.reduce(fn, val); }

}

Object.freeze(ObservableArray);
