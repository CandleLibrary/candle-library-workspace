import { Router } from "../client/radiate/radiate.js";
import { WickEnvironment } from '../client/runtime/global.js';
import wick from './wick-runtime.js';

let LINKER_LOADED = false;

export default function radiate() {

    if (LINKER_LOADED) return;

    LINKER_LOADED = true;

    window.addEventListener("load",
        async () => {

            if (
                wick.rt.isEnv(WickEnvironment.WORKSPACE)
                &&
                wick.rt.workspace_init_promise
            )
                await wick.rt.workspace_init_promise;


            try {

                if (wick.init_module_promise)

                    await wick.init_module_promise;

                const router = new Router(wick);

                //@ts-ignore
                wick.rt.router = router;

                const page = await router.loadNewPage(document.location + "", document);

                router.loadPage(page, location.href + "", true);

                document.body.hidden = false;
            } catch (e) {
                console.warn(e);
            }

            document.body.classList.toggle("radiate-init");
        }
    );

    return wick;
}

//Register wick as a global variable
//@ts-ignore
globalThis["wick"] = wick;