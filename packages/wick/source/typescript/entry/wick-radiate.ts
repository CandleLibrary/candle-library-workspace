import { Router } from "../client/radiate/router.js";
import { Environment, envIs, setEnv } from '../common/env.js';
import wick from './wick-runtime.js';

let ROUTER_LOAD_INITIATED = false;

export default function radiate() {

    setEnv(Environment.RADIATE);

    if (ROUTER_LOAD_INITIATED) return;

    ROUTER_LOAD_INITIATED = true;

    //window.addEventListener("DOMContentLoaded", load);

    load();

    return wick;
}

//Register wick as a global variable
//@ts-ignore
globalThis["wick"] = wick;

async function load() {

    if (
        envIs(Environment.WORKSPACE)
        &&
        wick.rt.workspace_init_promise
    )
        await wick.rt.workspace_init_promise;


    try {

        if (wick.rt.init_module_promise)

            await wick.rt.init_module_promise;

        const router = new Router(wick);

        wick.rt.router = router;

        const page = await router.loadNewPage(document.location + "", document);

        if (page) {
            if (document.readyState === "complete") {

                router.loadPage(page, location.href + "", false);
            } else {
                window.addEventListener("load", () => {
                    router.loadPage(page, location.href + "", false);

                });
            }
        } else
            throw new Error("Unable to initialize page");

        document.body.hidden = false;
    } catch (e) {
        console.warn(e);
    }

    document.body.classList.toggle("radiate-init");
}