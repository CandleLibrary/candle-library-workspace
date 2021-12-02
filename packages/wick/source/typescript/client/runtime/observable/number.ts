import { SchemeConstructor } from "./scheme_constructor.js";

class NumberSchemeConstructor extends SchemeConstructor {

    constructor() {

        super();

        this.start_value = 0;
    }

    parse(value) {

        return parseFloat(value);
    }

    verify(value, result) {

        result.valid = true;

        if (value == NaN || value == undefined) {
            result.valid = false;
            result.reason = "Invalid number type.";
        }
    }

    filter(identifier, filters) {

        for (let i = 0, l = filters.length; i < l; i++)
            if (identifier == filters[i])
                return true;

        return false;
    }
}

let number = new NumberSchemeConstructor();

export { number, NumberSchemeConstructor };