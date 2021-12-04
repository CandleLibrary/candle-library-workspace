
import URI from "@candlelib/uri";
import path from "path";
import ext_map, { addKey } from "../extension/extension_map.js";
import { Dispatcher } from "../types/types";

addKey("ico", ext_map);
addKey("png", ext_map);
addKey("jpg", ext_map);

const
    default_favicon = path.join((new URI(import.meta.url)).path, "../../../brand/candle.ico");


let favicon_path = default_favicon;
export default <Dispatcher>{
    name: "CandleLib Default favicon",
    description: `CandleLib Default favicon`,
    MIME: "image/vnd.microsoft.icon",
    init: async (lantern, self) => {

        const CWD = <URI>URI.resolveRelative(<string>self.cwd);
        const def = { path: <URI>URI.resolveRelative("../../brand/candle.ico", URI.getEXEURL(import.meta)), mime: "image/vnd.microsoft.icon" };
        const jpg = { path: <URI>URI.resolveRelative("./favicon.jpg", CWD), mime: "image/jpg" };
        const ico = { path: <URI>URI.resolveRelative("./favicon.ico", CWD), mime: "image/vnd.microsoft.icon" };
        const png = { path: <URI>URI.resolveRelative("./favicon.png", CWD), mime: "image/png" };

        for (const { path, mime } of [jpg, ico, png, def]) {

            if (await path.DOES_THIS_EXIST()) {
                self.MIME = mime;
                favicon_path = path + "";
                break;
            }
        }
    },
    respond: (tools) => {
        if (tools.filename == "favicon") {
            tools.setMIME();
            return tools.sendRawStreamFromFile(favicon_path);
        }
        return false;
    },
    keys: [{ ext: ext_map.ico | ext_map.png | ext_map.jpg, dir: "/*" }]
};