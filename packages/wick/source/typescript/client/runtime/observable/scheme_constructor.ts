/**
    Schema type. Handles the parsing, validation, and filtering of Model data properties. 
*/
class SchemeConstructor {

    start_value: any;

    constructor() {

        this.start_value = undefined;
    }

    /**
        Parses value returns an appropriate transformed value
    */
    parse(value) {

        return value;
    }

    /**

    */
    verify(value, result) {

        result.valid = true;
    }

    filter(id, filters) {
        for (let i = 0, l = filters.length; i < l; i++)
            if (id === filters[i]) return true;
        return false;
    }

    string(value) {

        return value + "";
    }
}

export { SchemeConstructor };