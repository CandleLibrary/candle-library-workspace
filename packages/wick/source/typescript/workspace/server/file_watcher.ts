import { Logger } from '@candlelib/log';
import spark, { Sparky } from '@candlelib/spark';
import URI from '@candlelib/uri';
import { FSWatcher, watch } from "fs";
import { rt } from '../../client/runtime/global.js';
import { createComponent } from '../../compiler/create_component.js';
import { Session } from '../common/session.js';
import { swap_component_data } from './component_tools.js';
import { addComponent, store } from './store.js';
export const logger = Logger.createLogger("flame");
let watchers: Map<string, FileWatcherHandler> = new Map();


export function getPageWatcher(location: string) {

    if (!watchers.has(location))
        watchers.set(location, new FileWatcherHandler(location + ""));

    return watchers.get(location);
}

export class FileWatcherHandler implements Sparky {

    _SCHD_: number;
    watcher: FSWatcher | null;
    path: string;
    type: "change" | string;
    sessions: Set<Session>;

    constructor(path: string) {

        this._SCHD_ = 0;

        this.sessions = new Set;

        this.path = path;

        this.type = "";

        this.watcher = null;
    }

    addSession(session: Session) {
        this.sessions.add(session);

        if (!this.watcher) {

            logger.log(`Creating watcher for file [ ${this.path} ]`);
            this.watcher = watch(this.path, (r: any) => (this.type = r, spark.queueUpdate(this)));
        }
    }

    removeSession(session: Session) {

        this.sessions.delete(session);

        if (this.sessions.size == 0) {
            this.close();
        }
    }

    close() { if (this.watcher) this.watcher.close(); this.watcher = null; };

    async scheduledUpdate() {

        this.type = "";

        const location = new URI(this.path);

        const comp = await createComponent(location, rt.context);

        if (comp.HAS_ERRORS) {



            // Though shalt remove this offending component from 
            // the system
            rt.context.components.delete(comp.name);

        } else {

            addComponent(comp);

            const cmp = store.components?.get(this.path);

            if (cmp) {

                const { comp: existing } = cmp;

                if (existing.name != comp.name) {
                    swap_component_data(comp, existing, this.sessions);
                }
            }
        }
    }
}
