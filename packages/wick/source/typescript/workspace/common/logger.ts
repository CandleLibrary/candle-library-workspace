import { Logger } from "@candlelib/log";

export const logger = Logger.get("wick");
Logger.get("lantern").activate();
Logger.get("wick").activate();
