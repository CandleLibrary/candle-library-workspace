import { getCSSCache } from "../cache/css_cache.js";
import { prepRebuild } from "./common.js";


export function SETCSSPROP(system, element, value_string) {

        // Get CSS information on element and update appropriate records
        let cache = getCSSCache(system, element);

        cache.setPropFromString(value_string);

        prepRebuild(element);
}
