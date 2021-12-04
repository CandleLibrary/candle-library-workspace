import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import { build } from "esbuild";



export async function compile_module(
	entry_file_path: string,
	output_file_path: string,
) {

	const result = await build({
		platform: "browser",
		format: "esm",
		minify: true,
		entryPoints: [entry_file_path + ""],
		bundle: true,
		outfile: output_file_path
	});

	if (result.errors.length > 0) {
		for (const err of result.errors)
			Logger.get("esbuild").activate().error(err);

		return false;
	}

	return true;
}

export async function compile_pack(
	entry_file_paths: string[],
	output_file_path: string,
) {

	await URI.server();

	const result = await build({
		platform: "browser",
		format: "esm",
		minify: false,
		entryPoints: entry_file_paths,
		bundle: true,
		outdir: output_file_path,
		/* plugins: [
			{
				name: "Candlelib Import Resolution",
				setup(build) {
					build.onResolve({ filter: /^\@candlelib/ }, async args => {

						if (args.kind == "import-statement") {
							let url = <URI>URI.resolveRelative(args.path);
							const module_path = url.path.split("/").slice(0, 2).join("/");
							const file_path = args.path.split("/").slice(2).join("/");

							console.log({ module_path, url });

							const { package: pkg, FOUND } = await getPackageJsonObject(url + "/");

							if (FOUND) {
								let package_url = new URI("./" + pkg.main);
								if (!package_url.IS_RELATIVE)
									package_url.path = package_url.path[0] == "/" ? "." + package_url.path : "./" + package_url.path;

								url = <URI>URI.resolveRelative(package_url, url + "/");

								console.log({ file_path });

								if (file_path) {
									url = <URI>URI.resolveRelative("./" + file_path, url);
								}

							}

							console.log({ args, url });
							return <OnResolveResult>{
								path: url + "",
								namespace: args.namespace,
							};
						}

					});
				}

			}
		] */
	});
}