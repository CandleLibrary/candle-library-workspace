import { Logger } from '@candlelib/log';
import spark, { Sparky } from '@candlelib/spark';
import URI from '@candlelib/uri';
import { FSWatcher, watch } from "fs";
import { rt } from '../../client/runtime/runtime.js';
import { createComponent } from '../../compiler/create_component.js';
import { Session } from '../common/session.js';
import { reloadComponent, swap_component_data } from './component_tools.js';
import { addComponent, store } from './store.js';
export const logger = Logger.get("wick");
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

            try {
                this.watcher = watch(this.path, (r: any) => (this.type = r, spark.queueUpdate(this)));
                logger.log(`Creating watcher for file [ ${this.path} ]`);
            } catch (e) {
                logger.warn("Unable to watch path " + this.path);
                logger.error(e);
            }
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

        const path = this.path;

        const sessions = this.sessions;

        await reloadComponent(path, sessions);
    }
}
