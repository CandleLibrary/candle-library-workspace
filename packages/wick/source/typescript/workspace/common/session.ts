import { Logger } from '@candlelib/log';
import { WebSocket as WS } from "ws";
import { Commands, CommandsMap, EditMessage, EditorCommand } from "../../types/editor_types.js";

export interface CommandHandler<S extends Session, T extends keyof CommandsMap = Commands> {
    (command: CommandsMap[T], session: S): (void | CommandsMap[EditorCommand]) | Promise<(void | CommandsMap[EditorCommand])>;
}

/**
 * The client side counterpart of the server Session class
 */
export class Session {

    connection: WS;
    /**
 * Timestamp of the creation of this session
 */
    opened: number;
    /**
     * true if the current connection is available
     * to send and receive data.
     */
    ACTIVE: boolean;

    awaitable_callback: Map<number, (any: any) => void>;

    nonce: number;

    logger: Logger;

    dispatches: Map<EditorCommand, CommandHandler<any>>;

    constructor(ws: WS | string, logger: Logger = Logger.get("wick").get("session").get("client").activate()) {

        this.logger = logger;

        if (typeof ws == "string") {
            this.logger.log(`Creating WebSocket connection to [ ${ws} ]`);
            this.connection = <any>new WebSocket(ws);
        } else
            this.connection = ws;


        this.ACTIVE = false;

        this.awaitable_callback = new Map;

        this.dispatches = new Map;

        this.set_callbacks();

        this.nonce = 50;

        this.opened = Date.now();
    }

    setHandler<T extends Commands>(command: T, handler: CommandHandler<any, T>) {
        //@ts-ignore
        this.dispatches.set(command, handler);
    }

    set_callbacks() {
        //@ts-ignore
        this.connection.addEventListener("message", this.command_handler.bind(this));
        //@ts-ignore
        this.connection.addEventListener("close", this.close_handler.bind(this));
        //@ts-ignore
        this.connection.addEventListener("error", this.error_handler.bind(this));
        //@ts-ignore
        this.connection.addEventListener("open", this.open_handler.bind(this));
    }

    /**
       * Convert an object to JSON and send to
       * client.
       */
    send_command<T extends keyof CommandsMap>(
        object: CommandsMap[T],
        nonce: number = Infinity
    ) {

        this.logger.log(`Sending command [ ${EditorCommand[object.command]} ] with nonce [ ${nonce} ]`);

        const json = JSON.stringify({ data: object, nonce });
        this.connection.send(json);
    }
    send_awaitable_command<T extends keyof CommandsMap, R extends keyof CommandsMap>(
        obj: CommandsMap[T]
    ): Promise<CommandsMap[R]> {

        const nonce = this.nonce++;
        const promise = <any>new Promise(res => { this.awaitable_callback.set(nonce, res); });

        this.send_command(obj, nonce);

        return promise;
    }

    open_handler() {

        this.logger.log(`Connection to [ ${this.connection.url} ] established`);

        this.ACTIVE = true;
    }

    close_handler() { this.ACTIVE = false; };

    error_handler(error: Error, ...rest: any[]) {

        this.logger.error(error);
    }

    get_message_string(msg: { data: any; }) {
        return msg.data;
    }

    async command_handler(msg: MessageEvent) {

        const { nonce, data } = <EditMessage>JSON.parse(this.get_message_string(msg));

        this.logger.log(`Received command [ ${EditorCommand[data.command]} ] with nonce [ ${nonce} ]`);

        if (this.awaitable_callback.has(nonce)) {

            const callback = this.awaitable_callback.get(nonce);

            this.awaitable_callback.delete(nonce);

            if (callback)
                return callback(data);

        } else if (this.dispatches.has(data.command)) {
            //@ts-ignore
            const reply = await this.dispatches.get(data.command)(data, this);

            if (reply) {
                this.send_command<any>(reply, nonce);
            }
        }
        else
            this.logger.warn(`No handler set for command [ ${EditorCommand[data.command]} ]`);
    }

    applyDefault(data: EditMessage["data"]) {
        if (this.dispatches.has(data.command)) {
            //@ts-ignore
            this.dispatches.get(data.command)(data, this);
        }
    }
}