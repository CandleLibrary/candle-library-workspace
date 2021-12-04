import { NumberSchemeConstructor } from "./number.js";

class TimeSchemeConstructor extends NumberSchemeConstructor {

    parse(value: any) {
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

    verify(value: any, result: number) {
        this.parse(value);
        super.verify(value, result);
    }

    filter(identifier: any, filters: any) {
        return true;
    }

    string(value: any) {
        return (new Date(value)) + "";
    }
}

let time = new TimeSchemeConstructor();

export { time, TimeSchemeConstructor };