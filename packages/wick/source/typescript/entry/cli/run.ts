import lantern, {
    candle_library_dispatch,
    $404_dispatch,
    filesystem_dispatch,
    candle_favicon_dispatch,
    args,
    Dispatcher,
    ext_map
} from "@candlelib/lantern";
import { Logger, LogLevel } from "@candlelib/log";
import { addCLIConfig, args as para_args } from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import { RenderPage } from "../../compiler/ast-render/webpage.js";
import { Context } from "../../compiler/common/context.js";
import { createComponent } from '../../compiler/create_component.js';
import { ComponentData } from '../../compiler/common/component.js';
import { create_config_arg_properties } from "./config_arg_properties.js";

const run_logger = Logger.get("wick").get("run").activate().deactivate(LogLevel.DEBUG);
//Logger.get("lantern").activate();
const log_level_arg = addCLIConfig("run", para_args.log_level_properties);
const config_arg = addCLIConfig("run", create_config_arg_properties());
const port_arg = addCLIConfig("run", args.create_port_arg_properties("Wick", "WICK_DEV_PORT", "8080"));
const browser_arg = addCLIConfig<string>("run", {
    key: "browser",
    REQUIRES_VALUE: true,
    default: "none",
    help_arg_name: "browser-name",
    accepted_values: ["chrome", "opera", "safari", "edge", "firefox"],
    help_brief: "Open a web browser after component has been compiled and server has started"
});

addCLIConfig<URI>("run", {
    key: "run",
    help_arg_name: "component_path",
    help_brief: `
Host a single component on a local server. 
`,
    REQUIRES_VALUE: true,
    accepted_values: <(typeof URI)[]>[URI]
}).callback = (
        async (input_path, args) => {

            run_logger.deactivate().activate(log_level_arg.value);

            run_logger.activate(log_level_arg.value);

            //const input_path = URI.resolveRelative(args.trailing_arguments.pop() ?? "./");
            const root_path = URI.resolveRelative(input_path);
            const config = config_arg.value;

            if (root_path) {

                run_logger
                    .debug(`Input root path:\n[ ${input_path + ""} ]`);

                //Find all components
                //Build wick and radiate files 
                //Compile a list of entry components
                const context = new Context();

                context.assignGlobals(config?.globals ?? {});

                run_logger
                    .log(`Loading resources from:\n[ ${root_path + ""} ]`);

                if (root_path.ext == "wick" || root_path.ext == "md" || root_path.ext == "html") {
                    //Initialize component
                    const comp = await createComponent(root_path, context);

                    const server = await lantern({
                        port: port_arg.value,
                        cwd: root_path.dir
                    });

                    server.addDispatch(
                        <Dispatcher>{
                            name: "Wick Hosted Component",
                            MIME: "text/html",
                            keys: [{ ext: ext_map.none, dir: "/" }],
                            async respond(tools) {
                                const context = new Context();
                                context.assignGlobals(config?.globals ?? {});
                                const component = await createComponent(root_path, context);

                                if (context.errors.length > 0) {
                                    for (const { comp: name, error } of context.errors) {
                                        const comp = <ComponentData>context.components.get(name);
                                        const location = root_path.getRelativeTo(comp.location);
                                        run_logger.warn(`
Error encountered in component ${comp.name} (${location}):`);
                                        run_logger.error(error);
                                    }

                                    return false;
                                } else {
                                    run_logger.log("Component rebuilt");
                                }

                                try {

                                    //Resolve module paths

                                    for (const [, m] of context.repo) {
                                        const url = new URI(m.url);

                                        if (!url.IS_RELATIVE && !url.host) {
                                            //Resolve the URI to a path relative to CWD
                                            m.url = root_path?.getRelativeTo(url).toString() || m.url;
                                        }
                                    }

                                    const {
                                        page
                                    } = await RenderPage(component, context);

                                    return tools.sendUTF8String(page);
                                } catch (e) {
                                    run_logger.error(e);
                                    return false;
                                }
                            }
                        },
                        filesystem_dispatch,
                        candle_favicon_dispatch,
                        candle_library_dispatch,
                        $404_dispatch,
                    );



                    run_logger.log(`Component running at: [ http://localhost:${port_arg.value}/ ]`);

                    const { spawn } = await import("child_process");

                    ({
                        chrome: (spawn, site) => spawn("google-chrome", [site]),
                        firefox: (spawn, site) => spawn("firefox", [site]),
                        edge: (spawn, site) => spawn("msedge", [site]),
                        opera: (spawn, site) => spawn("opera", [site]),

                    })?.[browser_arg.value]?.(spawn, `http://localhost:${port_arg.value}/`);

                } else {

                    run_logger.warn(`Unable to resolve a component from : [ ${root_path} ]`);
                }
            } else {
                throw new Error("Unable to locate a component at " + input_path);
            }
        }
    );
