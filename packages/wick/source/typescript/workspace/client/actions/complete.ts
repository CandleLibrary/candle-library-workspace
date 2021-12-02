import { getCSSCache } from "../cache/css_cache.js";

export function COMPLETE(system, element) {

	//Diff changed documents, clear caches, close opened dialogs if necessary
	if (element)
		getCSSCache.clear(element);

	system.data.docs.seal();
	//system.history.seal();
}
