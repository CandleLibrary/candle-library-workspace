import { Logger } from "@candlelib/log";
import { addCLIConfig, FS_RESULTS, utils } from "@candlelib/paraffin";
import URI from '@candlelib/uri';

export const create_logger = Logger.get("wick").get("create").activate();

addCLIConfig("create", {
    key: "create",
    help_brief: `
Create a new Wick App project 
`
}).callback = (
        async (args) => {
            create_logger.log("Creating APP");
            /**
             * 
             */
            const app_name = "wick-testbed";
            const deploy_strategy = "netlify";
            const repo_location = "https://github.com/acweathersby/wick-testbed";
            const project_root = URI.getCWDURL();
            const source_root = "site";
            const deploy_root = "www";
            const build_command = "candle.wick create";
            const package_json = {
                name: app_name,
                repository: repo_location,
                scripts: {
                    build: build_command
                },
                dependencies: {
                    "@candlelib/wick": "latest",
                    "@candlelib/flame": "latest",
                }
            };

            const wickonfig = {
                deploy_dir: deploy_root,
                source_dir: source_root,
            };

            //Netlify Deploy File [netlify.toml]
            const netlify_toml = `
[build]

base = "${source_root}/"
publish = "${deploy_root}/"
command = "${build_command}"

`;
            create_logger.log("Using Netlify deploy configurations");
            const index_md = `
# Hello You

This is the main entry to your next App. Replace this with whatever you need
to get started. If you have any questions, refer to our documentation
on creating Apps using the Candle Library. 

Good Journeys, brave creator!
`;

            if (
                await utils.writeToUTF8File(
                    netlify_toml,
                    URI.resolveRelative("./netlify.toml", project_root),
                    create_logger
                ) != FS_RESULTS.OK
            ) { }

            if (
                await utils.writeToJSONFile(
                    package_json,
                    URI.resolveRelative("./package.json", project_root),
                    create_logger
                ) != FS_RESULTS.OK
            ) { }

            if (
                await utils.writeToJSONFile(
                    wickonfig,
                    URI.resolveRelative(`./${source_root}/wickonfig.json`, project_root),
                    create_logger
                ) != FS_RESULTS.OK
            ) { }

            if (
                await utils.writeToUTF8File(
                    index_md,
                    URI.resolveRelative(`./${source_root}/index.md`, project_root),
                    create_logger
                ) != FS_RESULTS.OK
            ) { }

            create_logger.log(`Application files created.
            
You can now use ./deploy and ./develop within this folder
to run the deploy system and develop systems. 
            `);
        }

    );
