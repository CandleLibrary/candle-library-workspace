import { WickRTComponent } from '../client/runtime/component/component.js';
import { BINDING_FLAG } from '../types/all.js';

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

export function registerWatcherComponent(
    comp: WickRTComponent,
    domains: string
) {

    if (!inits)
        inits = [
            {
                obj: window, event: "resize", func: (e: UIEvent) => {
                    updateDomain(Domain.WINDOW_RESIZE, { width: window.innerWidth, height: window.innerHeight, });
                }, init_data: (comp: any) => ({ width: window.innerWidth, height: window.innerHeight, })
            }
        ];

    for (const domain of [domain_maps[domains]]) {
        if (domain !== undefined) {

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
    }
};
export function unregisterWatcherComponent(
    comp: WickRTComponent,
    domains: string
) {

    for (const domain of [domain_maps[domains]]) {
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