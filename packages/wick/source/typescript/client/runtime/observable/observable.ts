import { ObservableBase, _SealedProperty_ } from "./base.js";
import { ObservableArray } from "./observable_array.js";

export class ObservableData extends ObservableBase {

    prop_array: any[];
    prop_offset: number;
    look_up: { [key: string]: any; };

    constructor(data: any) {

        super();

        _SealedProperty_(this, "prop_array", []);
        _SealedProperty_(this, "prop_offset", 0);
        _SealedProperty_(this, "look_up", {});

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

            let index = this.look_up[prop_name];

            if (index !== undefined) {

                let prop = this.prop_array[index];

                if (typeof (prop) == "object") {

                    if (prop.set(data[prop_name], true)) {
                        this.scheduleUpdate();
                        out = true;
                    }

                } else if (prop !== data[prop_name]) {
                    this.prop_array[index] = data[prop_name];
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

        let index = this.prop_offset++;

        this.look_up[name] = index;

        switch (typeof (value)) {

            case "object":
                if (value) {

                    if (Array.isArray(value))
                        this.prop_array.push(new ObservableArray(value));
                    else {
                        if (value instanceof ObservableBase)
                            this.prop_array.push(value);
                        else
                            //@ts-ignore
                            this.prop_array.push(new Observable(value));
                    }

                    this.prop_array[index].prop_name = name;
                    this.prop_array[index].par = this;

                    Object.defineProperty(this, name, {

                        configurable: false,

                        enumerable: true,

                        get: function () { return this.getHook(name, this.prop_array[index]); },

                        set: (v) => { }
                    });
                    break;
                }
            default:
                this.prop_array.push(value);

                Object.defineProperty(this, name, {

                    configurable: false,

                    enumerable: true,

                    get: function () { return this.getHook(name, this.prop_array[index]); },

                    set: function (value) {

                        let val = this.prop_array[index];

                        if (val !== value) {
                            this.prop_array[index] = this.setHook(name, value);
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

        for (let name in this.look_up) {
            let index = this.look_up[name];
            let prop = this.prop_array[index];

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
