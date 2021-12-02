import { SchemeConstructor } from "./scheme_constructor.js";

class BoolSchemeConstructor extends SchemeConstructor {

    constructor() {

        super();

        this.start_value = false;
    }

    parse(value) {

        return (value) ? true : false;
    }

    verify(value, result) {

        result.valid = true;

        if (value === undefined) {
            result.valid = false;
            result.reason = " value is undefined";
        } else if (!(value instanceof Boolean)) {
            result.valid = false;
            result.reason = " value is not a Boolean.";
        }
    }

    filter(identifier, filters) {

        if (identifier instanceof Boolean)
            return true;

        return false;
    }
}

let bool = new BoolSchemeConstructor();

export {
    bool,
    BoolSchemeConstructor
};