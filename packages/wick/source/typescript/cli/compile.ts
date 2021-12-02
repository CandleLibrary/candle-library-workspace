import { Logger } from "@candlelib/log";
import { addCLIConfig, getPackageJsonObject } from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import { default_radiate_hooks, default_wick_hooks, RenderPage } from '../workspace/server/webpage.js';
import { ComponentData } from '../compiler/common/component.js';
import { Context } from "../compiler/common/context.js";
import { getAttribute } from "../compiler/common/html.js";
import { compile_module } from '../workspace/server/compile_module.js';
import { loadComponentsFromDirectory } from '../server/load_directory.js';
import { create_config_arg_properties } from "./config_arg_properties.js";
import { Token } from "@candlelib/hydrocarbon";

const compile_logger = Logger.get("wick").get("compile").activate();

const
    { package: pkg, package_dir }
        //@ts-ignore
        = await getPackageJsonObject(new URI(import.meta.url).path), ;

const config_arg = addCLIConfig("compile", create_config_arg_properties());

const output_arg = addCLIConfig<URI>("compile", {
    key: "output",
    REQUIRES_VALUE: true,
    default: URI.resolveRelative("./www"),
    transform: (arg) => URI.resolveRelative(arg),
    help_brief: `
A path to the root directory in which rendered files will be 
placed. Defaults to $CWD/www.
`
});


const lantern_arg = addCLIConfig("compile", {
    key: "lantern",
    REQUIRES_VALUE: false,
    default: false,
    transform: (arg) => true,
    help_brief: `
Start a Lantern dev server after a successful app compilation  
`
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
            const input_path = URI.resolveRelative(args.trailing_arguments.pop() ?? "./");
            const root_directory = URI.resolveRelative(input_path);
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

            compile_logger
                .rewrite_log(`Loaded ${pluralize(context.components.size, "component")} from        [ ${root_directory + ""} ]`);

            let USE_WICK_RUNTIME = false;
            let USE_RADIATE_RUNTIME = false;
            let USE_GLOW = false;

            //Update resources
            for (const [, component] of context.components) {
                for (const { uri, type, node } of component.URI) {
                    let local_uri = new URI(uri);
                    if (!local_uri.IS_RELATIVE) {
                        local_uri = new URI(root_directory + local_uri.path);
                    } else {
                        local_uri = URI.resolveRelative(local_uri, component.location);
                    }

                    if (local_uri.host) continue;

                    const file_name = local_uri.file;

                    if (type == "src") {
                        const attribute = getAttribute("src", node);
                        const new_location = "/img/" + file_name;
                        const new_output_location = new URI(output_directory + "img/" + file_name);
                        if (await local_uri.DOES_THIS_EXIST()) {
                            const fsp = (await import("fs")).promises;
                            attribute.value = new_location;
                            //Move the file to the out directory 
                            const source = Buffer.from(await local_uri.fetchBuffer());
                            await fsp.mkdir(new_output_location.dir, { recursive: true });
                            await fsp.writeFile(new_output_location.path, source);


                        } else {
                            const error = (<Token>attribute.pos).createError(`File ${local_uri} referenced by ${component.location} does not exist`, component.location + "");
                            compile_logger.get("Images").warn(error.message);
                        }
                    }
                }
            }


            for (const [component_name, { endpoints: ep }] of page_components) {

                for (const endpoint of ep) {

                    const { comp: component } = components.get(component_name) ?? {};

                    if (component?.TEMPLATE) {

                        const { comp, template_data } = endpoints.get(endpoint) ?? {};

                        context.active_template_data = template_data;

                        const { USE_RADIATE_RUNTIME: A, USE_WICK_RUNTIME: B } = await writeEndpoint(component, context, endpoint, output_directory);

                        context.active_template_data = null;

                        USE_RADIATE_RUNTIME ||= A;
                        USE_WICK_RUNTIME ||= B;

                    }
                    else {

                        const { USE_RADIATE_RUNTIME: A, USE_WICK_RUNTIME: B } = await writeEndpoint(component, context, endpoint, output_directory);

                        USE_RADIATE_RUNTIME ||= A;
                        USE_WICK_RUNTIME ||= B;
                    }
                }
            }

            if (USE_RADIATE_RUNTIME) {
                USE_GLOW = true;
                await compile_module(
                    URI.resolveRelative(
                        "./source/typescript/entry/wick-radiate.js",
                        package_dir
                    ) + "",
                    output_directory + "radiate.js"
                );
                compile_logger.log(`Built wick.radiate module at [ /radiate.js ]`);
            }

            if (USE_WICK_RUNTIME) {
                await compile_module(
                    URI.resolveRelative(
                        "./build/entry/wick-runtime.js",
                        package_dir
                    ) + "",
                    output_directory + "wick.js"
                );
                compile_logger.log(`Built wick.runtime module at [ /wick.js ]`);
            }

            /* EsBuild will bundle this for us.
            if (USE_GLOW)
                await compile_module(
                    URI.resolveRelative("@candlelib/glow/build/glow.js", URI.getEXEURL(import.meta)) + "",
                    output_directory + "glow.js"
                );
            //*/
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
    output_directory: URI
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
    } = await renderEndpointPage(component, context, endpoint_path, output_directory);

    try {
        await fsp.mkdir(new URI(output_path).dir, { recursive: true });
    }
    catch (e) {
        console.log(e);
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
    output_directory: URI
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
        hooks = Object.assign({}, USE_RADIATE_RUNTIME ? default_radiate_hooks : default_wick_hooks);

    if (USE_RADIATE_RUNTIME)
        hooks.init_script_render = function () {
            return `
				import init_router from "/radiate.js";
				init_router();`;
        };
    else
        hooks.init_script_render = function () {
            return `
			import w from "/wick.js";
			w.hydrate();`;
        };

    const { page: page_source } = await RenderPage(
        component,
        context,
        undefined,
        hooks
    ),
        ep = URI.resolveRelative("./" + endpoint.replace(/$(\/|\.\/)/, ""), output_directory);
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
