import { Router } from "../client/radiate/router.js";
import { Environment, envIs, setEnv } from '../common/env.js';
import wick from './wick-runtime.js';

let ROUTER_LOAD_INITIATED = false;

export default function radiate() {

    setEnv(Environment.RADIATE);

    if (ROUTER_LOAD_INITIATED) return;

    ROUTER_LOAD_INITIATED = true;

    window.addEventListener("load",
        async () => {

            if (
                envIs(Environment.WORKSPACE)
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
                    wick.rt.router.loadPage(page, location.href + "", false);
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