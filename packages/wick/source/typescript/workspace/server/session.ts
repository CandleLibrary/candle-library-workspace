import { WebSocket } from "ws";
import { ComponentData } from '../../compiler/common/component.js';
import { logger } from '../common/logger.js';
import { Session } from '../common/session.js';
import { getComponentDependencies } from './component_tools.js';
import { getPageWatcher } from './file_watcher.js';
import { addReference, __sessions__ } from './store.js';


/**
 * This class binds to a WebSocket connection and
 * maintains synchronization between client view and
 * server side source files.
 */
export class ServerSession extends Session {
    /**
     * The path to the endpoint component opened
     * in the client browser.
     */
    active_component_path: string;


    /**
     * Timestamp of the last update of this session
     * (client side or server side)
     */
    last_update: number;

    constructor(
        connection: WebSocket,
    ) {

        super(connection, logger.get("session").get("server"));

        this.active_component_path = "";

        this.last_update = -Infinity;

        this.nonce = 5000000;

        __sessions__.push(<any>this);
    };

    set_callbacks() {

        this.connection.on("message", this.command_handler.bind(this));

        this.connection.on("close", this.close_handler.bind(this));

        this.connection.on("error", this.error_handler.bind(this));

        this.connection.on("open", this.open_handler.bind(this));
    }

    open_handler() { this.ACTIVE = true; }
    close_handler() { this.ACTIVE = false; };

    error_handler(error: Error) {
        logger.error(error);
    }
    get_message_string(msg: any) {
        return msg.toString();
    }

    connect_file_watchers(component: ComponentData) {

        const component_dependencies
            = getComponentDependencies(component);

        for (const comp of component_dependencies) {
            const pw = getPageWatcher(comp.location.toString());

            if (pw)
                pw.addSession(<any>this);

            addReference(comp);
        }
    }
};

