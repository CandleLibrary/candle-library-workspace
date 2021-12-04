import { ObservableArray } from "./observable_array.js";
import { ObservableContainerBase } from "./container_base.js";
import { SchemeConstructor } from "./scheme/scheme_constructor.js";
import { ObservableData } from "./observable.js";
import { ObservableBase, _FrozenProperty_, _SealedProperty_ } from "./base.js";

/**
 *   This is used by Model to create custom property getter and setters on non-ModelContainerBase and non-Model properties of the Model constructor.
 *   @protected
 *   @memberof module:wick~internals.model
 */
function CreateSchemedProperty(object, scheme, schema_name, index) {
    if (object[schema_name])
        return;

    Object.defineProperty(object, schema_name, {
        configurable: false,
        enumerable: true,
        get: function () {
            return this.getHook(schema_name, this.prop_array[index]);
        },
        set: function (value) {

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

/**
    This is used by Model to create custom property getter and setters on Model properties of the Model constructor.
    @protected
    @memberof module:wick~internals.model
*/
function CreateModelProperty(object, model, schema_name, index) {

    Object.defineProperty(object, schema_name, {
        configurable: false,
        enumerable: true,
        get: function () {

            let m = this.prop_array[index];

            if (!m) {
                let address = this.address.slice();
                address.push(index);
                m = new model(null, this.root, address);
                m.par = this;
                m.prop_name = schema_name;
                m.MUTATION_ID = this.MUTATION_ID;
                this.prop_array[index] = m;
            }

            return this.getHook(schema_name, m);
        }
    });
}

class SchemedContainer extends ObservableArray<any> {

    constructor(schema) {

        super(schema.self);

        if (schema.proto)
            for (let name in schema.proto)
                _SealedProperty_(this, name, schema.proto[name]);
    }
}
type OS<T> = {

    [P in keyof T]: T[P];
};
export class ObservableScheme__<T = any> extends ObservableBase {

    _changed_: boolean;
    schema: any;
    look_up: any;
    prop_offset: number;
    static schema: any;

    constructor(data: T, _schema_ = null) {

        super();

        if (this.constructor === ObservableScheme__)
            this.constructor = (class extends ObservableScheme__ { });

        if (!this.schema) {

            //@ts-ignore
            let schema = this.constructor.schema || _schema_;

            //@ts-ignore
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
                            //@ts-ignore
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
                            for (let name in schema.proto)
                                _SealedProperty_(prototype, name, schema.proto[name]);
                            continue;
                        }

                        if (typeof (scheme) == "function") {
                            CreateModelProperty(prototype, scheme, schema_name, count);
                        } else if (typeof (scheme) == "object") {
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

                    //Start the process over with a newly minted Model that has the properties defined in the Schema
                    return new schema.__FinalConstructor__(data);
                }

                _FrozenProperty_(prototype, "schema", schema);
            } else
                //@ts-ignore
                return new ObservableData(data);
        }

        Object.defineProperty(this, "prop_array", { value: new Array(this.prop_offset), enumerable: false, configurable: false, writable: true });

        if (data) this.set(data);
    }

    destroy() { }

    set(data) {

        if (!data)
            return false;

        this._changed_ = false;

        for (let prop_name in data) {

            let data_prop = data[prop_name];

            let index = this.look_up[prop_name];

            if (index !== undefined) {

                let prop = this[prop_name];

                if (typeof (prop) == "object") {

                    if (prop.set(data_prop, true))
                        this.scheduleUpdate(prop_name);

                } else {
                    this[prop_name] = data_prop;
                }
            }
        }

        return this._changed_;
    }

    createProp() { }
}

export function ObservableScheme<T>(obj: T): ObservableScheme__<T> & T {
    return <any>new ObservableScheme__(obj);
}

ObservableScheme__.prototype.toJSON = ObservableData.prototype.toJSON;
