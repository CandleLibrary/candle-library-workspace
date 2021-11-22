import { Router } from "../radiate/radiate.js";
import wick from './wick-runtime.js';

//Register wick as a global variable
globalThis["wick"] = wick;

let LINKER_LOADED = false;

export default function radiate() {

    if (LINKER_LOADED) return;

    LINKER_LOADED = true;

    window.addEventListener("load",
        async () => {

            try {


                if (wick.init_module_promise)

                    await wick.init_module_promise;

                const router = new Router(wick);

                //@ts-ignore
                wick.rt.router = router;

                const page = await router.loadNewPage(document.location + "", document, false);

                router.loadPage(page, location.href + "", true);

                document.body.hidden = false;
            } catch (e) {
                console.warn(e);
            }

            document.body.hidden = false;
        }
    );

    return wick;
}

