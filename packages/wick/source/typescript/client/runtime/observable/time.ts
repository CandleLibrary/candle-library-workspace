import { NumberSchemeConstructor } from "./number.js";

class TimeSchemeConstructor extends NumberSchemeConstructor {

    parse(value) {
        if (!isNaN(value))
            return parseFloat(value);
        try {
            var hour = parseInt(value.split(":")[0]);
            var min = parseInt(value.split(":")[1].split(" ")[0]);
            if (value.split(":")[1].split(" ")[1])
                half = +(value.split(":")[1].split(" ")[1].toLowerCase() == "pm");
            else
                half = 0;
        } catch (e) {
            var hour = 0;
            var min = 0;
            var half = 0;
        }

        return (hour + ((half) ? 12 : 0) + (min / 60));
    }

    verify(value, result) {
        this.parse(value);
        super.verify(value, result);
    }

    filter(identifier, filters) {
        return true;
    }

    string(value) {
        return (new Date(value)) + "";
    }
}

let time = new TimeSchemeConstructor();

export { time, TimeSchemeConstructor };