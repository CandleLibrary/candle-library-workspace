import { Patch, PatchType } from './patch';
import { Change, ChangeType } from './transition';

export enum EditorCommand {
    /**
     * A null command that should be ignored
     */
    UNKNOWN,

    NOT_ALLOWED,
    /**
     * Previous command received and processed normally
     */
    OK,

    /**
     * A client instance request for the CSS strings
     * registered for a given component
     */
    GET_COMPONENT_STYLE,
    /**
     * A server response to EditorCommand.GET_COMPONENT_STYLE
     * with a list of style strings registered to the component
     */
    GET_COMPONENT_STYLE_RESPONSE,
    /**
    * A server response to a EditorCommand.GET_COMPONENT_PATCH
    * request. Client instances should use the ComponentPatch
    * object to patch or replace existing components with
    * modifications made to the latest version.
    */
    APPLY_COMPONENT_PATCH,

    /**
     * A client request to update a givin component to
     * a newer version. Both `to` and `from` must match
     * components that were derived from the same file.
     */
    GET_COMPONENT_PATCH,

    /**
     * A server broadcast message indicating that local changes
     * have been made to a component. If a client instance has
     * any components with a name that matches the `old_name` it
     * should respond with a EditorCommand.GET_COMPONENT_PATCH message
     * to update the old components to the new version.
     */
    UPDATED_COMPONENT,
    GET_COMPONENT_SOURCE,
    GET_COMPONENT_SOURCE_RESPONSE,

    /**
     * Apply a set of changes to affected components, allowing
     * a batch change operation to take place.
     */
    APPLY_COMPONENT_CHANGES,

    /**
     * Client request for a list of plugin paths that should be 
     * loaded into the client workspace
     */
    GET_PLUGIN_PATHS,
    /**
     * Server response with a list of plugin paths that should be 
     * loaded into the client workspace
     */
    PLUGIN_PATHS_RESPONSE,


    /**
     * A message from a client instance indicating the
     * client has loaded and is ready to communicate with
     * the server. Should result in the initialization of
     * file watchers for the source files that were used
     * to render the endpoint.
     */
    REGISTER_CLIENT_COMPONENT,

    /**
     * Reply to GET_STORE request. Returns an object representing
     * the current APP store file.
     */
    GET_STORE_REPLY,
    GET_STORE,
    SET_STORE,
}

export const enum StyleSourceType {
    INLINE,
    CSS_FILE
}

export interface CommandsMap {

    [EditorCommand.OK]: {
        command: EditorCommand.OK;
    };

    [EditorCommand.GET_PLUGIN_PATHS]: {
        command: EditorCommand.GET_PLUGIN_PATHS;
    };

    [EditorCommand.PLUGIN_PATHS_RESPONSE]: {
        command: EditorCommand.PLUGIN_PATHS_RESPONSE;
        /**
         * Local path and remote path tuples
         */
        plugins: [string, string][];
    };

    [EditorCommand.UNKNOWN]: {
        command: EditorCommand.UNKNOWN;
    };

    [EditorCommand.NOT_ALLOWED]: {
        command: EditorCommand.NOT_ALLOWED;
    };

    [EditorCommand.REGISTER_CLIENT_COMPONENT]: {
        command: EditorCommand.REGISTER_CLIENT_COMPONENT;
        /**
         * The API component that this page represents
         */
        comp_name: string;
    };

    [EditorCommand.GET_COMPONENT_STYLE]: {
        command: EditorCommand.GET_COMPONENT_STYLE;
        /**
         * The hash name of the component from which
         * CSS styles should be retrieved
         */
        component_name: string;
    };

    [EditorCommand.GET_COMPONENT_STYLE_RESPONSE]: {
        command: EditorCommand.GET_COMPONENT_STYLE_RESPONSE;
        component_name: string;
        styles: {
            type: StyleSourceType,
            string: string,
            /**
             * The path to the source file containing
             * the CSS data
             */
            location: string,
        }[];
    };

    [EditorCommand.GET_COMPONENT_PATCH]: {
        command: EditorCommand.GET_COMPONENT_PATCH;
        /**
         * The component old component hash name
         */
        from: string;
        /**
         * The new updated component  hash name
         */
        to: string;
    };

    [EditorCommand.APPLY_COMPONENT_PATCH]: {
        command: EditorCommand.APPLY_COMPONENT_PATCH;
        patch: Patch[PatchType];
    };

    [EditorCommand.UPDATED_COMPONENT]: {
        command: EditorCommand.UPDATED_COMPONENT;
        new_name: string;
        old_name: string;
        path: string;
    };

    [EditorCommand.GET_COMPONENT_SOURCE]: {
        command: EditorCommand.GET_COMPONENT_SOURCE;
        component_name: string;
    };

    [EditorCommand.GET_COMPONENT_SOURCE_RESPONSE]: {
        command: EditorCommand.GET_COMPONENT_SOURCE_RESPONSE;
        component_name: string;
        source: string;
    };


    [EditorCommand.APPLY_COMPONENT_CHANGES]: {
        command: EditorCommand.APPLY_COMPONENT_CHANGES;
        changes: (Change[ChangeType.CSSRule] | Change[ChangeType.Attribute])[];
    };

    [EditorCommand.GET_STORE]: {
        command: EditorCommand.GET_STORE;
    };

    [EditorCommand.SET_STORE]: {
        command: EditorCommand.SET_STORE;
        data: any;
    };

    [EditorCommand.GET_STORE_REPLY]: {
        command: EditorCommand.GET_STORE_REPLY;
        data: any;
    };
}

export type Commands = EditorCommand;

export interface EditMessage<T extends keyof CommandsMap = Commands

    > {
    nonce: number;
    data: CommandsMap[T];
}





