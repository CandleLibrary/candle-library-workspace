import { Logger } from "@candlelib/log";
import { addCLIConfig, args as para_args, getPackageJsonObject } from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import { mkdirSync, promises as fsp } from 'fs';
import { ComponentData } from '../compiler/common/component.js';
import { Context } from "../compiler/common/context.js";
import { init_build_system } from '../compiler/init_build_system.js';
import { compile_module } from '../workspace/server/compile_module.js';
import { loadComponentsFromDirectory } from '../workspace/server/load_directory.js';
import { default_radiate_hooks, default_wick_hooks, RenderPage } from '../workspace/server/webpage.js';
import { create_config_arg_properties } from "./config_arg_properties.js";
const compile_logger = Logger.get("wick").get("compile").activate();

const
    { package: pkg, package_dir }
        //@ts-ignore
        = await getPackageJsonObject(new URI(import.meta.url).path), ;

const config_arg = addCLIConfig("compile", create_config_arg_properties());
const log_level_arg = addCLIConfig("compile", para_args.log_level_properties);
const output_arg = addCLIConfig<URI, URI>("compile", {
    key: "output",
    REQUIRES_VALUE: true,
    default: <URI>URI.resolveRelative("./www"),
    transform: (arg: URI, _: any) => <URI>URI.resolveRelative(arg),
    help_brief: `
A path to the root directory in which rendered files will be 
placed. Defaults to $CWD/www.
`
});


const lantern_arg = addCLIConfig("compile", {
    key: "serve",
    REQUIRES_VALUE: false,
    default: false,
    transform: (arg) => true,
    help_brief: `Start a preview server after a successful app compilation`
});

const target_arg = addCLIConfig("compile", {
    key: "target",
    REQUIRES_VALUE: false,
    default: "github",
    accepted_values: ["github", "netlify"],
    transform: (arg) => true,
    help_brief: `The static server provider that the build should be optimized for`
});


addCLIConfig<string>("compile",
    {
        key: "compile",
        help_brief: `

Statically compile a web application from a source directory.

Wick will automatically handle the compilation & packaging of components and will render out a 
static site that can be optionally hydrated with associated support scripts.`
    }
).callback = (
        async (arg, args) => {
            Logger.get("wick").deactivate().activate(log_level_arg.value);

            await init_build_system();

            const input_path = <URI>URI.resolveRelative(args.trailing_arguments.pop() ?? "./");
            const root_directory = <URI>URI.resolveRelative(input_path);
            const output_directory = output_arg.value;
            const config = config_arg.value;

            if (output_directory.path.slice(-1)[0] != "/")
                output_directory.path += "/";

            compile_logger
                .debug(`Input root path:                [ ${input_path + ""} ]`)
                .debug(`Output root path:               [ ${output_directory + ""} ]`);

            //Find all components
            //Build wick and radiate files 
            //Compile a list of entry components
            const context = new Context();

            context.assignGlobals(config.globals ?? {});

            compile_logger
                .log(`Loading resources from:         [ ${root_directory + ""} ]`);

            const { page_components, components, endpoints }
                = await loadComponentsFromDirectory(
                    root_directory, context, config.endpoint_mapper
                );

            /**
             * Do not allow compilation to proceed if there are compilation 
             * errors.
             */
            if (context.hasErrors()) {
                let count = 0;
                for (const [name, comp] of context.components) {
                    for (const error of context.getErrors(comp)) {
                        count++;
                        compile_logger.error("Error in ", comp.location + "", "\n", error.message);
                    }
                }
                compile_logger.error(`Unable to continue due to ${count} error${count == 1 ? "" : "s"}.`);
                process.exit();
            }

            if (!page_components) {
                compile_logger.warn("Unable to locate suitable page components");
                return;
            }

            compile_logger
                .rewrite_log(`Loaded ${pluralize(context.components.size, "component")} from        [ ${root_directory + ""} ]`);

            let USE_RADIATE_RUNTIME = false;

            let pending_resources: Promise<any>[] = [];
            //Update resources
            pending_resources.push(...([
                "image", "images", "img", "imgs", "pics", "pictures", "css", "styles",
                'scripts', "webfonts"
            ].map(async source_dir => {

                const source = URI.resolveRelative("./" + source_dir + "/", root_directory + "/");

                if (source && await source.DOES_THIS_EXIST()) {
                    const destination = URI.resolveRelative("./" + source_dir + "/", output_directory);
                    //Copy files from this location to the output destination.
                    await fsp.cp(source + "", destination + "", {
                        force: true,
                        preserveTimestamps: true,
                        recursive: true
                    });
                }

            })));


            //Build module interface 
            const exports = [...context.repo].map(([name, value]) => {

                return `export * as ${value.hash} from "${value.url}"`;
            });

            for (const [, m] of context.repo) {

                const url = new URI(m.url);

                if (!url.host) {
                    //Resolve the URI to a path relative to CWD
                    m.url = URI.resolveRelative("./src/pack.js", root_directory) + "";
                }
            }


            let pending_page_components: Promise<any>[] = [];

            for (const [component_name, { endpoints: ep }] of page_components) {

                for (const endpoint of ep) {

                    const { comp: component } = components?.get(component_name) ?? {};

                    if (component?.TEMPLATE) {

                        pending_page_components.push(new Promise(async e => {
                            const { comp, template_data } = endpoints?.get(endpoint) ?? {};

                            context.active_template_data = template_data;

                            const { USE_RADIATE_RUNTIME: A, USE_WICK_RUNTIME: B }
                                = await writeEndpoint(component, context, endpoint, output_directory);

                            context.active_template_data = null;

                            USE_RADIATE_RUNTIME ||= A;
                        }));

                    } else {

                        (component => {
                            pending_page_components.push(new Promise(async e => {

                                const { USE_RADIATE_RUNTIME: A, USE_WICK_RUNTIME: B }
                                    = await writeEndpoint(component, context, endpoint, output_directory, root_directory);

                                USE_RADIATE_RUNTIME ||= A;

                                e(true);
                            }));
                        })(component);
                    }
                }
            }

            await Promise.all(pending_page_components);

            pending_resources.push(new Promise(async e => {

                try {
                    const output_dir = <URI>URI.resolveRelative("./.wick-temp/");

                    if (!await output_dir.DOES_THIS_EXIST())
                        mkdirSync(output_dir + "", { recursive: true });

                    const source_file_path = URI.resolveRelative("./pack_source.js", output_dir + "/") + "";
                    const pack_file_path = URI.resolveRelative("./src/pack.js", output_directory + "/") + "";

                    if (USE_RADIATE_RUNTIME) {
                        exports.push(`export * as radiate from "@candlelib/wick/source/typescript/entry/wick-radiate.ts"`);
                    } else {
                        exports.push(`export * as wick from "@candlelib/wick/source/typescript/entry/wick-runtime.ts"`);
                    }

                    await fsp.writeFile(source_file_path, exports.join(";\n") + "\n", { encoding: "utf8" });


                    //Resolve module paths



                    await compile_module(source_file_path, pack_file_path);

                } catch (e) {
                    compile_logger.error(e);
                }

                e(true);
            }));

            await Promise.all(pending_resources);

            compile_logger.log(`🎆 Site successfully built! 🎆`);

            if (false && lantern_arg.value) {
                const port = 8092;

                compile_logger.parent.get("lantern").log(`Launching Lantern at port [ ${port} ]`);

                const cp = await import("child_process");

                cp.spawn("npx", [`lantern`, `--port`, `${port}`], {
                    cwd: "" + output_directory,

                    stdio: ['inherit', 'inherit', 'inherit'],

                    env: process.env
                });
            }
            return;
        }
    );
function pluralize(val: number, singular: string, plural = singular + "s") {
    return `${val} ${val == 1 ? singular : plural}`;
}

async function writeEndpoint(
    component: ComponentData,
    context: Context,
    endpoint_path: string,
    output_directory: URI,
    root_directory: URI
): Promise<{
    USE_RADIATE_RUNTIME: boolean;
    USE_WICK_RUNTIME: boolean;
}> {


    const fsp = (await import("fs")).promises;

    const {
        USE_RADIATE_RUNTIME,
        USE_WICK_RUNTIME,
        output_path,
        page_source
    } = await renderEndpointPage(component, context, endpoint_path, output_directory, root_directory);

    try {
        await fsp.mkdir(new URI(output_path).dir, { recursive: true });
    }
    catch (e) {
        compile_logger
            .error(`Unable create output path [ ${new URI(output_path).dir} ]`)
            .error(e);
    }

    try {
        await fsp.writeFile(output_path, page_source, { encoding: 'utf8' });
    }
    catch (e) {
        compile_logger
            .error(`Unable create output path [ ${output_path} ]`)
            .error(e);
    }

    compile_logger.log(`Built endpoint                  [ ${endpoint_path} ]`)
        .log(`   at                           [ ${output_path} ]`)
        .log(`   from component               [ ${component.location + ""} ]\n`);

    return {
        USE_RADIATE_RUNTIME,
        USE_WICK_RUNTIME
    };
}

async function renderEndpointPage(
    component: ComponentData,
    context: Context,
    endpoint: string,
    output_directory: URI,
    input_directory: URI,
): Promise<{
    USE_RADIATE_RUNTIME: boolean;
    USE_WICK_RUNTIME: boolean;
    page_source: string;
    output_path: string;
}> {

    let
        USE_RADIATE_RUNTIME: boolean = component.RADIATE,
        USE_WICK_RUNTIME: boolean = !component.RADIATE;

    const
        hooks = Object.assign({}, USE_RADIATE_RUNTIME ? default_radiate_hooks : default_wick_hooks),
        ep = <URI>URI.resolveRelative("./" + endpoint.replace(/$(\/|\.\/)/, ""), output_directory),
        pack_path = ep.getRelativeTo(<URI>URI.resolveRelative("./src/pack.js", output_directory));

    if (USE_RADIATE_RUNTIME)
        hooks.init_script_render = function () {
            return `
				import {radiate} from "${pack_path}";
                /*$$$$*/
				radiate.default();`;
        };
    else
        hooks.init_script_render = function () {
            return `
			import {wick} from "${pack_path}";
			wick.queue_hydrate();`;
        };

    hooks.resolve_import_path = (str: string) => {
        const root_path = <URI>URI.resolveRelative(str, input_directory);
        const relative_path = input_directory.getRelativeTo(root_path);
        return ep.getRelativeTo(<URI>URI.resolveRelative(relative_path, output_directory)) + "";
    };

    const { page: page_source } = await RenderPage(
        component,
        context,
        {
            ALLOW_STATIC_REPLACE: false,
            INTEGRATED_CSS: false,
            INTEGRATED_HTML: false,
            INTEGRATE_COMPONENTS: true,
            STATIC_RENDERED_CSS: true,
            STATIC_RENDERED_HTML: true,
        },
        hooks
    );

    if (ep.path.slice(-1)[0] == "/")
        ep.path += "index.html";
    else if (!ep.ext)
        ep.path += ".html";

    return {
        USE_RADIATE_RUNTIME,
        USE_WICK_RUNTIME,
        output_path: ep.path,
        page_source
    };
}
