import { Logger } from "@candlelib/log";

export const logger = Logger.get("wick");

export function warn(...args: any[]) {
    logger.warn(...args);
}
export function log(...args: any[]) {
    logger.log(...args);
}

export function dir(args: any[]) {
    logger.log(args);
}

export function error(e: Error) {
    logger.error(error);
}

export function debug(...args: any[]) {
    logger.debug(...args);
}

export function trace(...args: any[]) {
    console.trace(args[0]);
}