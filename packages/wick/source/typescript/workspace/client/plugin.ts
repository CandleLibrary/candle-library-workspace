import { EditorCommand } from "../../types/editor_types.js";
import { logger } from '../../common/logger.js';
import { PluginFrame } from './editor_model.js';
import { WorkspaceSystem } from "./types/workspace_system.js";

export async function loadPlugins(active_system: WorkspaceSystem) {

    const plugin_logger = logger.get("plugins");

    active_system.session.connection.addEventListener("open", async () => {

        plugin_logger.log("Loading plugins");
        //Load plugins  
        for (const [name, path] of (

            await active_system.session
                .send_awaitable_command<EditorCommand.GET_PLUGIN_PATHS, EditorCommand.PLUGIN_PATHS_RESPONSE>(
                    { command: EditorCommand.GET_PLUGIN_PATHS }
                ))?.plugins ?? []) {

            plugin_logger.log("Loading plugin " + name);

            active_system.editor_model.active_plugins.push(
                PluginFrame.create(name, path)
            );
        }

        plugin_logger.log("Completed plugin load");
    });
}
