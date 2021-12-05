import {
    Dispatcher,
    ext_map
} from "@candlelib/lantern";
import { Logger } from "@candlelib/log";
import URI from '@candlelib/uri';
import { Context } from '../../compiler/common/context.js';
import { createComponent } from '../../compiler/create_component.js';
import { RenderPage } from '../server/webpage.js';

export const workspace_editor_dispatch = <Dispatcher>{
    name: "Workspace Editor",
    MIME: "text/html",
    keys: [],
    init(lantern, dispatcher) {
        dispatcher.keys = [{ ext: ext_map.none, dir: "/flame-editor" }];
    },
    respond: async function (tools) {
        const ws_context = new Context();

        const editor_path = <URI>URI.resolveRelative("@candlelib/wick/source/components/editor.wick", URI.getEXEURL(import.meta));


        const comp = await createComponent(editor_path, ws_context);

        for (const [name, comp] of ws_context.components) {
            if (comp.HAS_ERRORS) {
                Logger.get("wick").get(`comp error`).warn(`Component ${comp} (${comp.location}) produced compilation errors:`);
                for (const error of ws_context.getErrors(comp))
                    Logger.get("wick").get(`comp error`).warn(error);
            }
        }

        const result = await RenderPage(comp, ws_context);

        if (result)
            return tools.sendUTF8String(result.page);
    }
};
