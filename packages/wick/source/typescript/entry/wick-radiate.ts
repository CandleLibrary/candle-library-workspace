import { Router } from "../client/radiate/router.js";
import { WickEnvironment } from '../client/runtime/global.js';
import wick from './wick-runtime.js';

let ROUTER_LOAD_INITIATED = false;

export default function radiate() {

    wick.rt.setEnvironment(WickEnvironment.RADIATE);

    if (ROUTER_LOAD_INITIATED) return;

    ROUTER_LOAD_INITIATED = true;

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

                wick.rt.router = new Router(wick);

                const page = await wick.rt.router.loadNewPage(document.location + "", document);
                if (page)
                    wick.rt.router.loadPage(page, location.href + "", true);
                else
                    throw new Error("Unable to initialize page");

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