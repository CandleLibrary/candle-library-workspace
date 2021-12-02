import { ObservableBase, _SealedProperty_ } from "./base.js";
import { SchemeConstructor } from './scheme/scheme_constructor.js';


export class MCArray<T> extends Array {

    constructor() { super(); }

    push(...item: T[]): number {
        item.forEach(item => {
            if (item instanceof Array)
                item.forEach((i) => {
                    super.push(i);
                });
            else
                super.push(item);
        });
        return this.length;
    }

    //For compatibility
    __setFilters__() { }

    getChanged() { }

    toJSON() { return this; }

    toJson() { return JSON.stringify(this, null, '\t'); }
}

// A no op function
let EmptyFunction = () => { };
let EmptyArray = [];

export class ObservableContainerBase<T> extends ObservableBase {

    data: T[];

    key: string;

    validator: SchemeConstructor;

    model: any;

    _filters_: any[];

    source: any;

    first_link: ObservableContainerBase<T>;

    constructor(data: T[] = []) {

        super();

        _SealedProperty_(this, "source", null);
        _SealedProperty_(this, "first_link", null);

        //For keeping the container from garbage collection.
        _SealedProperty_(this, "pin", EmptyFunction);

        //For Linking to original 
        _SealedProperty_(this, "next", null);
        _SealedProperty_(this, "prev", null);

        //Filters are a series of strings or number selectors used to determine if a model should be inserted into or retrieved from the container.
        _SealedProperty_(this, "_filters_", null);

        this.validator = new SchemeConstructor();

        return this;
    }

    setByIndex(index, m) { /* NO OP **/ }

    getByIndex(index, value) { /* NO OP **/ }

    destroy() {


        this._filters_ = null;

        if (this.source) {
            this.source.__unlink__(this);
        }

        super.destroy();
    }

    /**
        Get the number of Models held in this._mContainerBase

        @returns {Number}
    */
    get length() { return 0; }

    set length(e) { /* NO OP */ }

    /** 
        Returns a ModelContainerBase type to store the results of a get().
    */
    __defaultReturn__(USE_ARRAY) {
        return this;
    }

    /**
        Array emulation

        @returns The result of calling this.insert
    */
    push(...item) {
        item.forEach(item => {
            if (item instanceof Array)
                item.forEach((i) => {
                    this.insert(i);
                });
            else
                this.insert(item);
        });
    }

    /**
        Retrieves a list of items that match the term/terms. 

        @param {(Array|SearchTerm)} term - A single term or a set of terms to look for in the ModelContainerBase. 
        @param {Array} __return_data__ - Set to true by a source Container if it is calling a SubContainer insert function. 

        @returns {(ObservableContainerBase|Array)} Returns a Model container or an Array of Models matching the search terms. 
    */
    get(term, __return_data__) {

        let out = null;

        term = this.getHook("term", term);

        let USE_ARRAY = (__return_data__ === null) ? false : true;

        if (term) {

            if (__return_data__) {
                out = __return_data__;
            } else {

                if (!this.source)
                    USE_ARRAY = false;

                out = this.__defaultReturn__(USE_ARRAY);
                out.__setFilters__(term);
            }
        } else
            out = (__return_data__) ? __return_data__ : this.__defaultReturn__(USE_ARRAY);

        if (!term)
            this.__getAll__(out);
        else {

            let terms = term;

            if (!Array.isArray(term))
                terms = [term];

            //Need to convert terms into a form that will work for the identifier type
            terms = terms.map(t => this.validator.parse(t));

            this.__get__(terms, out);
        }

        return out;
    }

    set(item) { this.insert(item); return false; }

    /**
        Inserts an item into the container. If the item is not a {Model}, an attempt will be made to convert the data in the Object into a Model.
        If the item is an array of objects, each object in the array will be considered separately. 

        @param {Object} item - An Object to insert into the container. On of the properties of the object MUST have the same name as the ModelContainerBase's 
        @param {Array} item - An array of Objects to insert into the container.
        @param {Boolean} __FROM_SOURCE__ - Set to true by a source Container if it is calling a SubContainer insert function. 

        @returns {Boolean} Returns true if an insertion into the ModelContainerBase occurred, false otherwise.
    */
    insert(item) {

        item = this.setHook("", item);

        let add_list = (this.fv) ? [] : null;

        let out_data = false;

        if (Array.isArray(item)) {
            for (let i = 0; i < item.length; i++)
                if (this.__insertSub__(item[i], out_data, add_list))
                    out_data = true;
        } else if (item)
            out_data = this.__insertSub__(item, out_data, add_list);


        if (out_data) {
            if (this.par)
                this.par.scheduleUpdate(this.prop_name);

            this.scheduleUpdate();
        }

        return out_data;
    }

    /**
        A subset of the insert function. Handles the testing of presence of an identifier value, the conversion of an Object into a Model, and the calling of the implementation specific __insert__ function.
    */
    __insertSub__(item, out, add_list) {

        var identifier = this._gI_(item);


        if (identifier !== undefined) {
            if (
                item &&
                typeof item == "object" &&
                !(item instanceof ObservableBase) &&
                this.model
            ) {
                //@ts-ignore
                item = new this.model.constructor(item);
                item.par = this;
            }

            out = this.__insert__(item, add_list);
        }

        return out;
    }

    delete(term, from_root = false) {
        this.remove(term);
    }

    /**
        Removes an item from the container. 
    */
    remove(term, from_root = false, __FROM_SOURCE__ = false) {

        //term = this.getHook("term", term);

        if (!__FROM_SOURCE__ && this.source) {

            if (!term)
                return this.source.remove(this._filters_);
            else
                return this.source.remove(term);
        }

        let out_container = [];

        if (!term)
            this.__removeAll__();

        else {

            let terms = (Array.isArray(term)) ? term : [term];

            //Need to convert terms into a form that will work for the identifier type
            terms = terms.map(t => (t instanceof ObservableBase) ? t : this.validator.parse(t));

            this.__remove__(terms, out_container);
        }

        if (out_container.length > 0) {


            if (out_container && out_container.length > 0) {
                this.updateViews();
                this.scheduleUpdate();
            }
        }

        return out_container;
    }

    /**
        Removes any items in the ModelContainer not included in the array "items", 
        and adds any item in `items` not already in the ModelContainerBase.
        @param {Array} items - An array of identifiable Models or objects. 
    */
    cull(items: T[]) {

        let hash_table = {};
        let existing_items = this.__getAll__([]);

        let loadHash = (item) => {
            if (item instanceof Array)
                return item.forEach((e) => loadHash(e));

            let identifier = this._gI_(item);

            if (identifier !== undefined)
                hash_table[identifier] = item;

        };

        loadHash(items);

        for (let i = 0; i < existing_items.lenth; i++) {
            let e_item = existing_items[i];
            if (!existing_items[this._gI_(e_item)])
                this.__remove__(e_item);
        }

        this.insert(items);
    }

    __setFilters__(term) {

        if (!this._filters_) this._filters_ = [];

        if (Array.isArray(term))
            this._filters_ = this._filters_.concat(term.map(t => this.validator.parse(t)));
        else
            this._filters_.push(this.validator.parse(term));

    }

    /**
        Returns true if the identifier matches a predefined filter pattern, which is evaluated by this.parser. If a 
        parser was not present the ModelContainers schema, then the function will return true upon every evaluation.
    */
    __filterIdentifier__(identifier, filters) {
        if (filters.length > 0) {
            return this.validator.filter(identifier, filters);
        }
        return true;
    }

    _gIf_(item, term) {
        let t = this._gI_(item, this._filters_);
    }

    /**
        Returns the Identifier property value if it exists in the item. If an array value for filters is passed, then undefined is returned if the identifier value does not pass filtering criteria.
        @param {(Object|Observable)} item
        @param {Array} filters - An array of filter terms to test whether the identifier meets the criteria to be handled by the ModelContainerBase.
    */
    _gI_(item, filters = null) {

        return item;

        let identifier;

        if (typeof (item) == "object" && this.key)
            identifier = item[this.key];
        else
            identifier = item;

        if (identifier && this.validator)
            identifier = this.validator.parse(identifier);

        if (filters && identifier)
            return (this.__filterIdentifier__(identifier, filters)) ? identifier : undefined;

        return identifier;
    }

    /** 
        OVERRIDE SECTION ********************************************************************
        
        All of these functions should be overridden by inheriting classes
    */

    __insert__(item: any, add_list: any[] = (this.fv) ? [] : null) { return false; }

    __get__(item, __return_data__) { return __return_data__; }

    __getAll__(__return_data__) { return __return_data__; }

    __removeAll__() { return []; }

    __remove__(term, out_container = null) { return false; }

    // END OVERRIDE *************************************************************************
}

const proto = ObservableContainerBase.prototype;
_SealedProperty_(proto, "model", null);
_SealedProperty_(proto, "key", "");
_SealedProperty_(proto, "validator", null);
