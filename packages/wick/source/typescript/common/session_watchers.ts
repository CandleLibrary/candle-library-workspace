import { WickRTComponent } from '../client/runtime/component/component.js';
import { BINDING_FLAG, FLAG_ID_OFFSET } from '../types/all.js';



export const enum Domain {
    WINDOW_RESIZE,
}

let session_watcher_store: {
    [Domain.WINDOW_RESIZE]: Set<WickRTComponent> | null;
} = {
    [Domain.WINDOW_RESIZE]: null
};

let inits: any = null;

function updateDomain(domain: Domain, obj: any) {
    const set = session_watcher_store[domain];
    if (set) for (const comp of set)
        comp.update(obj, BINDING_FLAG.FROM_STORE);
}


const domain_maps: { [key: string]: Domain; } = {
    width: Domain.WINDOW_RESIZE,
    height: Domain.WINDOW_RESIZE
};


function getDomainList(comp: WickRTComponent): Set<Domain> {
    let domains: Set<Domain> = new Set;

    for (const [name, flags] of Object.entries(comp.nlu || {})) {
        if ((flags >> FLAG_ID_OFFSET.VALUE) & BINDING_FLAG.FROM_STORE) {
            const val = domain_maps[name];
            if (typeof val == "number") {
                domains.add(val);
            }
        }
    }

    return domains;
}
export function registerWatcherComponent(
    comp: WickRTComponent
) {

    if (!inits)
        inits = [
            {
                obj: window, event: "resize", func: (e: UIEvent) => {
                    updateDomain(Domain.WINDOW_RESIZE, { width: window.innerWidth, height: window.innerHeight, });
                }, init_data: (comp: any) => ({ width: window.innerWidth, height: window.innerHeight, })
            }
        ];

    for (const domain of getDomainList(comp)) {

        const init = inits[domain];

        if (!session_watcher_store[domain]) {
            session_watcher_store[domain] = new Set;
            if (init)
                init.obj.addEventListener(init.event, init.func);
        }

        const set = session_watcher_store[domain];

        if (set) set.add(comp);

        if (init && init.init_data)
            comp.update(init.init_data(), BINDING_FLAG.FROM_STORE);
    }
};
export function unregisterWatcherComponent(
    comp: WickRTComponent
) {

    for (const domain of getDomainList(comp)) {
        if (!session_watcher_store[domain])
            continue;

        const set = session_watcher_store[domain];

        if (set) {
            set.delete(comp);
            if (set.size == 0) {
                session_watcher_store[domain] = null;
                const init = inits[domain];
                if (init)
                    init.obj.removeEventListener(init.event, init.func);
            }
        }
    }
}