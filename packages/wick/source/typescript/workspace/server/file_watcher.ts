import { Logger } from '@candlelib/log';
import spark, { Sparky } from '@candlelib/spark';
import URI from '@candlelib/uri';
import wick from "@candlelib/wick";
import fs from "fs";
import { Session } from '../../common/session.js';
import { getSourceHash, swap_component_data } from './component_tools.js';
import { addBareComponent, addComponent, store } from './store.js';
export const logger = Logger.createLogger("flame");
let watchers: Map<string, FileWatcherHandler> = new Map();


export function getPageWatcher(location: string) {

    if (!watchers.has(location))
        watchers.set(location, new FileWatcherHandler(location + ""));

    return watchers.get(location);
}

export class FileWatcherHandler implements Sparky {

    _SCHD_: number;
    watcher: fs.FSWatcher;
    path: string;
    type: "change" | string;
    sessions: Set<Session>;

    constructor(path) {

        this.sessions = new Set;

        this.path = path;

        this.type = "";
        this.watcher = null;
    }

    addSession(session: Session) {
        this.sessions.add(session);

        if (!this.watcher) {

            logger.log(`Creating watcher for file [ ${this.path} ]`);
            this.watcher = fs.watch(this.path, (r) => (this.type = r, spark.queueUpdate(this)));
        }
    }

    removeSession(session: Session) {

        this.sessions.delete(session);

        if (this.sessions.size == 0) {
            this.close();
        }
    }

    close() { this.watcher.close(); this.watcher = null; };

    async scheduledUpdate() {

        this.type = "";

        const location = new URI(this.path);

        const comp = await wick(location, wick.rt.context);

        if (comp.HAS_ERRORS) {


            for (const error of comp.errors)
                logger.log(error);

            // Though shalt remove this offending component from 
            // the system
            wick.rt.context.components.delete(comp.name);

        } else {

            addComponent(comp);

            const { comp: existing } = store.components.get(this.path);

            if (existing.name != comp.name) {
                swap_component_data(comp, existing, this.sessions);
            }
        }
    }
}
