import { bidirectionalTraverse, make_skippable, traverse, TraverseState } from '@candlelib/conflagrate';
import { JSExportDeclaration, JSIdentifierBinding, JSImportClause, JSNodeType, JSStatementClass, renderCompressed } from '@candlelib/js';
import { getPackageJsonObject } from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import { parse_component, parse_js_exp, parse_js_stmt } from '../compiler/source-code-parse/parse.js';
import { renderNew } from '../compiler/source-code-render/render.js';
import { Node } from '../types/wick_ast.js';

async function getResolvedModulePath(
	new_uri: string,
	existing_uri: string,
	package_directory: string
) {

	let uri = new URI(new_uri);

	if (!uri.IS_RELATIVE) {

		uri = URI.resolveRelative(new URI(uri), package_directory);

		const { package: pkg, FOUND } = await getPackageJsonObject(uri + "/");

		const main = ([".", "/"].includes(pkg.main[0])) ? pkg.main : "./" + pkg.main;

		uri = URI.resolveRelative(main, uri + "/");

	} else {

		uri = URI.resolveRelative(uri, existing_uri);
	}

	return uri + "";
}

export async function compile_module(
	entry_file_path: string,
	output_file_path: string,
	working_directory: string
) {

	const fsp = (await import("fs")).promises;

	const root = entry_file_path;

	//Include wick runtime library
	const dependencies = new Set([root]);

	const modules = new Map;

	for (const module_path of dependencies) {

		const entry = await fsp.readFile(module_path, { encoding: "utf8" });

		const { ast: module, error } = parse_component(entry);

		const mod_dependencies = [];

		const imported_refs = new Map();

		const export_refs = new Map();

		const re_exports = new Set();

		const module_data = {
			module,

			dependencies: mod_dependencies,

			imported_refs,

			export_refs,
		};

		modules.set(module_path, module_data);

		if (error) {
			console.error(error);
		} else {
			let i = 0;

			let mod_name = new URI(module_path).filename.replace(/-/g, "_");

			let remap_list = "ABCDEFGHIGKLMNOP";

			for (const { node, meta: { mutate } } of traverse(<Node>module, "nodes")
				.filter("type", JSNodeType.ImportDeclaration, JSNodeType.ExportDeclaration)

				.makeMutable()) {

				if (node.type == JSNodeType.ImportDeclaration) {

					const module_ref = node.nodes.length > 1 ? node.nodes[1].nodes[0] : node.nodes[0].nodes[0];
					//@ts-ignore
					const relative_file_path = module_ref.value;

					const imported_module_path = await getResolvedModulePath(
						relative_file_path,
						module_path,
						working_directory
					);

					dependencies.add(imported_module_path + "");

					mod_dependencies.push({ name: imported_module_path + "", specs: node.nodes[0] });
					//@ts-ignore
					module_ref.value = imported_module_path + "";

					if (node.nodes.length > 1) {

						const import_clause: JSImportClause = <any>node.nodes[0];

						for (const import_node of import_clause.nodes) {
							switch (import_node.type) {
								case JSNodeType.IdentifierDefault:
									let local_ref = import_node.value;
									imported_refs.set(local_ref, { uri: imported_module_path + "", mod_ref: "__default__" });
									break;
								case JSNodeType.NameSpace:
									break;
								case JSNodeType.Specifiers:
									for (const specifier of import_node.nodes) {
										const mod_ref = specifier.nodes[0].value;
										let local_ref = specifier.nodes[0].value;
										if (specifier.nodes.length > 1)
											local_ref = specifier.nodes[1].value;
										imported_refs.set(local_ref, { uri: imported_module_path + "", mod_ref });

									}
									break;
							}
						}
					}

					mutate(null);

				} else {

					if (root == module_path)
						continue;

					const exp: JSExportDeclaration = <JSExportDeclaration>node;

					const [target] = exp.nodes;

					if (!target) {
						//Module Re-Export
						const exported_module_path = await getResolvedModulePath(
							exp.nodes[1].nodes[0].value,
							module_path,
							working_directory
						);

						dependencies.add(exported_module_path);

						re_exports.add(exported_module_path);

					} else if (exp.DEFAULT) {

						const rename = mod_name + "_default";

						switch (target.type) {
							case JSNodeType.ClassDeclaration:
							case JSNodeType.FunctionDeclaration:
								//rename class functions to module names 
								if (!target.nodes[0])
									//@ts-ignore
									target.nodes[0] = parse_js_exp(rename);
								else {
									const name = target.nodes[0].value;

									const new_node = <JSStatementClass>parse_js_stmt(`var ${rename} = ${name};`);
									//@ts-ignore
									module.nodes.push(new_node);
								}

								mutate(target);

								export_refs.set("__default__", rename);

								break;

							default:
								const stmt = parse_js_stmt(`var ${mod_name + "_default"} = 0;`);

								stmt.nodes[0].nodes[1] = target;

								export_refs.set("__default__", rename);

								mutate(stmt);

								break;
						}
					} else {

						switch (target.type) {
							case JSNodeType.ClassDeclaration:
							case JSNodeType.FunctionDeclaration:
								//rename class functions to module names 
								const name = target.nodes[0].value;
								const rename = mod_name + remap_list[i++];
								//target.nodes[0].value = rename;
								export_refs.set(name, rename);
								const new_node = <JSStatementClass>parse_js_stmt(`var ${rename} = ${name};`);
								//@ts-ignore
								module.nodes.push(new_node);
								mutate(target);
								break;
							case JSNodeType.VariableStatement:
							case JSNodeType.LexicalDeclaration:

								for (const { node } of traverse(target, "nodes").filter("type", JSNodeType.IdentifierBinding)) {

									const name = (<JSIdentifierBinding><any>node).value;

									const rename = mod_name + remap_list[i++];

									const new_node = <JSStatementClass>parse_js_stmt(`var ${rename} = ${name};`);

									export_refs.set(name, rename);
									//@ts-ignore
									module.nodes.push(new_node);
								}

								mutate(target);
								break;

							case JSNodeType.Specifiers:

								for (const specifier of target.nodes) {
									const name = specifier.nodes[0].value;
									const extern_name = specifier.nodes[1]?.value ?? name;
									const rename = mod_name + remap_list[i++];
									const node = <JSStatementClass>parse_js_stmt(`var ${rename} = ${name};`);
									module.nodes.push(node);
									export_refs.set(extern_name, rename);;
								}

								mutate(null);
						}
					}
				}
			}
		}
	}

	let pending_modules = new Map([...modules].map(([string, value]) => [string, value.dependencies.map(i => i.name)]));

	let sorted_module = [];
	while (sorted_module.length < modules.size) {

		let last_name = "", smallest = Infinity;

		//Sort modules
		for (const [name, dependencies] of pending_modules) {
			if (dependencies.length == 0) {

				last_name = name;
				break;
			} else {
				if (dependencies.length < smallest) {
					//A link a dependency cycle
					smallest = dependencies.length;
					last_name = name;
				}
			}
		}

		if (last_name) {
			sorted_module.push(last_name);
			pending_modules.delete(last_name);

			for (const [name, dependencies] of pending_modules) {

				const index = dependencies.indexOf(last_name);

				if (index >= 0)
					dependencies.splice(index, 1);
			}
		} else {
			throw new Error("Can't resolve modules");
		}
	}
	//move entry into the last position
	const entry_index = sorted_module.indexOf(root);

	sorted_module.push(...sorted_module.splice(entry_index, 1));

	const output = [];
	//Setup unique module names
	for (const module_path of sorted_module) {
		const { module, imported_refs } = modules.get(module_path);
		const stack = { refs: new Set, prev: null };
		for (const { node, meta: { skip, traverse_state } } of bidirectionalTraverse(<Node>module, "nodes")
			.makeSkippable()
			.filter("type",
				JSNodeType.FunctionDeclaration,
				JSNodeType.FunctionExpression,
				JSNodeType.ArrowFunction,
				JSNodeType.IdentifierReference,
				JSNodeType.IdentifierBinding,
				JSNodeType.ExportDeclaration
			)) {

			if (traverse_state == TraverseState.ENTER) {
				if (node.type == JSNodeType.ExportDeclaration) {
					if (!node.DEFAULT) {

						//@ts-ignore
						if (node.nodes[0]?.type == JSNodeType.Specifiers) {

							//@ts-ignore
							for (const specifier of node.nodes[0].nodes) {
								const name = specifier.nodes[0].value;
								if (imported_refs.has(name)) {
									const { uri, mod_ref } = imported_refs.get(name);
									const { export_refs } = modules.get(uri);
									const new_name = export_refs.get(mod_ref) ?? name;
									specifier.nodes[0].value = new_name;

									if (!specifier.nodes[1])
										specifier.nodes.push(<any>parse_js_exp(name));

								}
							}
						}
					}
				}
			} else if (node.type == JSNodeType.IdentifierReference) {

				const name = node.value;

				if (imported_refs.has(name)) {


					let HAVE_REF = false;

					let tip = stack;

					while (tip) {
						if (tip.refs.has(name)) {
							HAVE_REF = true;
							break;
						}
						tip = tip.prev;
					}

					if (!HAVE_REF) {
						const { uri, mod_ref } = imported_refs.get(name);
						const { export_refs } = modules.get(uri);
						const new_name = export_refs.get(mod_ref) ?? name;

						node.value = new_name;

					}
				}
			}
		}

		output.push(renderCompressed(module));
	}

	await fsp.writeFile(output_file_path, output.join("\n"), { encoding: 'utf8' });
}
