import { logger } from '../../common/logger.js';
import { WickRTComponent } from "./component/component.js";

export const enum DatabaseType {
    Indexed
}
export const store: Map<string, { val: any; comps: Set<WickRTComponent>; }> = new Map();
export class DataBaseOMR {

    db: null | IDBDatabase;

    errors: any;

    active_promise: Promise<any> | null;

    constructor() {
        this.db = null;
        this.active_promise = null;
    }

    async connect(): Promise<boolean> {

        if (!this.db && !this.errors) {

            this.active_promise = new Promise(res => {


                const request = indexedDB.open("wick-session", 1);

                request.onsuccess = db => {
                    logger.log("Database connected");
                    this.db = request.result;
                    this.db.onerror = this.handle_error;
                    res(true);
                };

                request.onerror = (e) => {
                    this.handle_error(e);
                    res(false);
                };

                request.onblocked = e => {
                    logger.log("Connection blocked");
                    res(false);
                };

                request.onupgradeneeded = e => {
                    logger.log("Upgrade needed");
                    this.db = request.result;
                    this.db.onerror = (e) => this.handle_error(e);
                    this.db.createObjectStore("session-data", { keyPath: null });
                };
            });

            this.active_promise.finally(() => {
                this.active_promise = null;
            });

            return this.active_promise;
        }

        if (this.active_promise)
            return await this.active_promise;

        if (this.errors)
            return false;

        return true;
    }

    handle_error(event: Event) {
        this.errors = true;
        //@ts-ignore
        logger.warn(event.target.error);
    }

    async put(key: string, data: any): Promise<boolean> {
        if (await this.connect()) {
            return new Promise(res => {

                if (!this.db)
                    return false;

                var transaction = this.db.transaction(["session-data"], "readwrite");

                transaction.oncomplete = () => res(true);

                transaction.onerror = () => res(false);

                const store = transaction.objectStore("session-data");

                store.put(data, key);
            });
        }

        return false;
    }

    async get(key: string): Promise<any> {
        if (await this.connect() && this.db) {
            if (await this.connect()) {
                return new Promise(res => {

                    if (!this.db)
                        return false;

                    var transaction = this.db.transaction(["session-data"], "readonly");
                    //transaction.oncomplete = () => res(true);
                    transaction.onerror = () => res(undefined);

                    const store = transaction.objectStore("session-data");

                    const request = store.get(key);

                    request.onerror = () => res(undefined);

                    request.onsuccess = e => { res(request.result); };

                });
            }

            return false;
        }
        return undefined;
    }
}
