import { build } from "esbuild";
import { Logger } from '@candlelib/log';


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