import { ObservableBase, _SealedProperty_ } from "./base.js";
import { ObservableArray } from "./observable_array.js";

export class ObservableData extends ObservableBase {
    
    look_up: Map<string, any>;

    constructor(data: any) {

        super();

        this.look_up = new Map;

        _SealedProperty_(this, "look_up", this.look_up);

        if (data)
            for (let name in data)
                this.createProp(name, data[name]);

        return this;
    }

    get proxy() { return this; }

    set(data: any, prop_name: string = "") {

        if (typeof data == "undefined")
            return false;

        let out = false;

        for (let prop_name in data) {

            let prop = this.look_up.get(prop_name);

            if (prop !== undefined) {

                if (typeof (prop) == "object") {

                    if (prop.set(data[prop_name], true)) {
                        this.scheduleUpdate();
                        out = true;
                    }

                } else if (prop !== data[prop_name]) {

                    this.look_up.set(prop_name, prop)
                    
                    this.scheduleUpdate();
                    
                    out = true;
                }
            } else {
                this.createProp(prop_name, data[prop_name]);
                out = true;
            }
        }

        return out;
    }
    createProp(name: string, value: any) {

        switch (typeof (value)) {

            case "object":
                if (value) {

                    if (Array.isArray(value))
                        this.look_up.set(name, new ObservableArray(value))
                    else {
                        if (value instanceof ObservableBase)
                            this.look_up.set(name, value);
                        else
                            //@ts-ignore
                            this.look_up.set(name, new Observable(value));
                    }

                    const prop = this.look_up.get(name);

                    prop.prop_name = name;
                    prop.par = this;

                    Object.defineProperty(this, name, {

                        configurable: false,

                        enumerable: true,

                        get: function () { return this.getHook(name, this.look_up.get(name)); },

                        set: (v) => { }
                    });
                    break;
                }
            default:
                this.look_up.set(name, value);

                Object.defineProperty(this, name, {

                    configurable: false,

                    enumerable: true,

                    get: function () { return this.getHook(name, this.look_up.get(name)); },

                    set: function (value) {

                        const prop = this.look_up.get(name);

                        if (prop !== value) {
                            this.look_up.set(name, this.setHook(name, value))
                            this.scheduleUpdate(name);
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
        let data: { [key: string]: any; } = {};

        for (let [name, prop] of this.look_up) {

            if (prop) {
                if (prop instanceof ObservableBase)
                    data[name] = prop.toJSON(false);
                else
                    data[name] = prop;
            }
        }

        return HOST ? JSON.stringify(data) : data.toString();
    }
}

export function Observable<T>(data: T): ObservableData & T | ObservableArray<any> & T {

    if (Array.isArray(data))
        return <ObservableArray<T> & T>new ObservableArray<any>(data);

    return <ObservableData & T>new ObservableData(data);
}

export type Observable<T> = ObservableData & T | ObservableArray<any> & T 
