import { Logger } from '@candlelib/log';
import { traverseFilesFromRoot } from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import { ComponentData } from '../compiler/common/component.js';
import { Context } from '../compiler/common/context.js';
import wick from '../entry/wick-server.js';
import { rt } from '../runtime/global.js';
import { EndpointMapper } from "../types/config.js";

export function mapEndpoints(uri: URI, working_directory: URI) {

	// If this an index.wick component
	// then it will serve as an endpoint

	const file_name = uri.file.split(".");

	if (file_name[file_name.length - 2] == "index") {

		const sub_path = uri.dir.replace(working_directory + "", "")
			+
			file_name.slice(0, -2).join("/");

		if (sub_path == "/")
			return sub_path;

		return "/" + sub_path + "/";
	}

	return "";
}

/**
 * A mapping from an endpoint to a component and its (optional) associated
 * template data.
 */
export type EndPoints = Map<string, {
	comp: ComponentData;
	template_data?: any;
}>;

/**
 * A mapping from a local component path to a set of endpoints
 */
export type PageComponents = Map<string, {
	endpoints: string[];
}>;

/**
 * A mapping of all component file paths to their respective components
 */
export type Components = Map<string, {
	comp: ComponentData;
}>;

/**
 * A mapping of all component file paths to their respective components
 */
export async function loadComponentsFromDirectory(
	working_directory: URI,
	context: Context = rt.context,
	/**
	 * A function that can be used to determine
	 * weather a component file should be used
	 * as an entry point for a compiled page.
	 */
	page_criteria: EndpointMapper = mapEndpoints
): Promise<{
	make?: void,
	endpoints: EndPoints;
	page_components: PageComponents;
	components: Components;
}> {
	const endpoints: EndPoints = new Map();

	const page_components: PageComponents = new Map();

	const components: Components = new Map();

	//Find all wick files and compile them into components. 
	for await (const file_uri of traverseFilesFromRoot(
		working_directory, {
		directory_evaluator_function: (uri) => {

			const dir_name = uri.path.split("/").pop();

			//Skip linux "hidden" directories
			if (dir_name[0] == ".")
				return false;

			//Skip package repo folders
			if (dir_name == "node_modules")
				return false;

			return true;
		}
	})) {
		//compile_logger.rewrite_log(`Loading ${["|", "/", "-", "\\"][counter++ % 4]}`);

		if (["wick", "md", "html"].includes(file_uri.ext.toLowerCase())) {

			const file_path = file_uri + "";

			const endpoint_path = page_criteria(file_uri, new URI(working_directory));

			if (endpoint_path) {

				const endpoint = new URI(endpoint_path);

				const path = endpoint.path;

				try {

					const comp: ComponentData = await wick(file_uri, context);

					// Use link analysis to include other components that may serve as
					// endpoints

					const endpoints_strings = [];

					if (comp.TEMPLATE) {
						let i = 0;
						for (const data of context.template_data.get(comp)) {
							if (data.endpoint) {
								const template_endpoint = URI.resolveRelative(data.endpoint, endpoint).toString();
								endpoints.set(template_endpoint, { comp, template_data: data });
								endpoints_strings.push(template_endpoint);
							} else {
								Logger
									.get("wick")
									.get("build")
									.warn(
										`Could not create endpoint for template (${file_path})[${i}].\nMissing endpoint string attribute in template data`,
										data
									);
							}
							i++;
						}
					} else {
						endpoints.set(path, { comp });
						endpoints_strings.push(path);
					}

					page_components.set(file_path, { endpoints: endpoints_strings });

				} catch (e) {

					Logger
						.get("wick")
						.get("build")
						.error(file_path);

					Logger
						.get("wick")
						.get("build")
						.error(e);

					return {
						endpoints: null,
						page_components: null,
						components: null
					};
				}
			}
		}
	};

	for (const [, comp] of context.components) {
		if (comp.AD_HOC) continue;
		components.set(comp.location + "", { comp });
	}


	console.dir({ page_components }, { depth: 8 });

	return {
		endpoints,
		page_components,
		components
	};
}
