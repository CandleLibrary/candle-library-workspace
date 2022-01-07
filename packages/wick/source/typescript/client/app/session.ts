import { Environment, setEnv } from '../../common/env.js';
import { BINDING_FLAG } from '../../index.js';
import { EditorCommand } from '../../types/editor_types.js';
import { Session } from '../../workspace/common/session.js';
import { DatabaseType, store } from '../runtime/db.js';
import { WickRuntime } from '../runtime/runtime.js';

setEnv(Environment.APP);

export async function init(rt: WickRuntime) {

    const host = document.location.hostname;

    const port = document.location.port;

    const session = new Session(`wss://${host}:${port}`);

    let local_store: any = {};

    //Preload the database with store data
    let INITIALIZED = new Promise(res => {

        session.connection.addEventListener("open", async () => {


            rt.setDatabaseData = function (this: WickRuntime, key: string, val: any, DB: DatabaseType) {
                if (DB == DatabaseType.Indexed) {

                    //this.db.put(key, val);

                    //@ts-ignore
                    local_store[key] = val;

                    session.send_command({
                        command: EditorCommand.SET_STORE,
                        data: local_store
                    });
                }
            };

            rt.getDatabaseData = async function (this: WickRuntime, key: string, DB: DatabaseType = DatabaseType.Indexed) {
                if (DB == DatabaseType.Indexed) {
                    //@ts-ignore

                    await INITIALIZED;

                    return local_store[key];
                    //return this.db.get(key);
                }
            };
            const { data } = await session.send_awaitable_command<EditorCommand.GET_STORE, EditorCommand.GET_STORE_REPLY>({ command: EditorCommand.GET_STORE });

            local_store = data;

            for (const name in local_store) {

                const val = local_store[name];

                if (store.has(name)) {

                    const column = store.get(name);

                    if (column) {
                        column.val = val;
                        const update_obj = { [name]: val };
                        for (const comp of column.comps)
                            comp.update(update_obj, BINDING_FLAG.FROM_STORE);
                    }
                } else {
                    store.set(name, {
                        comps: new Set,
                        val
                    });
                }
            }

            res(true);
        });
    });

    return INITIALIZED;
}