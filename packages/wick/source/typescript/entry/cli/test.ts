import {
    BasicReporter, compileTestsFromAST, createTestFrame,
    createTestSuite
} from "@candlelib/cure";
import { JSNode, JSNodeType } from '@candlelib/js';
import { Logger } from "@candlelib/log";
import { addCLIConfig, args as para_args } from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import { traverse } from '@candlelib/conflagrate';
import { createCompiledComponentClass, finalizeBindingExpression, processInlineHooks } from '../../compiler/ast-build/build.js';
import { componentDataToJSStringCached } from "../../compiler/ast-render/js.js";
import { getDependentComponents } from "../../compiler/ast-render/webpage.js";
import { ComponentData } from '../../compiler/common/component.js';
import { Context } from "../../compiler/common/context.js";
import { createComponent } from '../../compiler/create_component.js';
import { parse_component } from '../../compiler/source-code-parse/parse.js';
import { loadComponentsFromDirectory } from '../../server/load_directory.js';
import { create_config_arg_properties } from "./config_arg_properties.js";

export const test_logger = Logger.get("wick").get("test");
const log_level_arg = addCLIConfig("test", para_args.log_level_properties);
const config_arg = addCLIConfig("test", create_config_arg_properties());
const show_rig_arg = addCLIConfig("test", {
    key: "showrig",
    default: false,
    help_brief: "Prints test rig values without running any tests",
});

addCLIConfig<URI>("test", {
    key: "test",
    help_brief: `
Test components that have been defined with the \`@test\` synthetic import
`,
    REQUIRES_VALUE: true,
    default: <string>process.cwd(),
    accepted_values: <(typeof URI)[]>[URI]
}).callback = (
        async (input_path, args) => {

            test_logger.activate(log_level_arg.value);

            //const input_path = URI.resolveRelative(args.trailing_arguments.pop() ?? "./");
            const root_path = <URI>URI.resolveRelative(input_path);
            const config = config_arg.value;

            test_logger
                .debug(`Input root path:                [ ${input_path + ""} ]`);

            //Find all components
            //Build wick and radiate files 
            //Compile a list of entry components
            const context = new Context();

            context.assignGlobals(config.globals ?? {});

            test_logger
                .log(`Loading resources from:         [ ${root_path + ""} ]`);

            if (root_path.ext == "wick") {
                await createComponent(root_path, context);
            } else {

                await loadComponentsFromDirectory(
                    root_path, context, config.endpoint_mapper
                );
            }

            const test_sources = [];
            const suites = [];
            const test_frame = createTestFrame({
                WATCH: false,
                BROWSER_HEADLESS: true,
                number_of_workers: 1,
            });

            await test_frame.init();

            test_frame.setReporter(new BasicReporter());

            let i = 0;

            for (const [, component] of context.components) {

                if (context.test_rig_sources.has(component)) {

                    test_logger.log("Compiling tests for:\n   ->" + component.location + "");

                    const test_suite = createTestSuite(
                        component.location + "",
                        i++,
                    );

                    test_suite.name = component.name + ` tests`;

                    suites.push(test_suite);

                    let source_ast_block = <JSNode><any>context.test_rig_sources.get(component)?.[0];

                    const components = getDependentComponents(component, context);

                    const component_strings = [];

                    for (const comp of components) {

                        const { class_string } = await componentDataToJSStringCached(
                            comp, context, true, true, "wick.rt.C"
                        );

                        component_strings.push(`wick.rt.rC(${class_string})`);
                    }

                    const model = traverse(source_ast_block, "nodes").makeMutable()
                        .filter("type", JSNodeType.VariableStatement, JSNodeType.LexicalStatement)
                        .run(
                            (node, meta) => {
                                if (
                                    node.nodes.length == 1
                                    &&
                                    node.nodes[0].nodes[0].value == "$model"
                                ) {
                                    meta.mutate(null);

                                    return node;
                                }
                            }
                        )?.[0]?.nodes[0]?.nodes[1];

                    const comp_class = await createCompiledComponentClass(component, context, false, false);

                    const test_source = test_script_template(component_strings, component);

                    const source = <JSNode>parse_component(test_source).ast;

                    const ast: JSNode = {
                        type: JSNodeType.Module,
                        nodes: [<any>source_ast_block],
                        pos: component.root_frame.ast.pos
                    };

                    await processInlineHooks(component, context, ast, comp_class);

                    const test_source_ast = (await finalizeBindingExpression(
                        ast,
                        component,
                        comp_class,
                        context,
                        "comp"
                    )).ast;

                    if (model)
                        source.nodes[5 + component_strings.length]
                            .nodes[0].nodes[1].nodes.push(model);

                    //@ts-ignore
                    source.nodes.push(...test_source_ast.nodes);



                    //console.log(renderNewFormatted(source));

                    compileTestsFromAST(source, test_suite, test_frame.globals);

                    for (const test of test_suite.tests) {
                        test.BROWSER = true;
                    }
                }
            }

            if (show_rig_arg.value) {
                for (const rig of suites) {
                    const logger = Logger.get(rig.name);
                    logger.log(rig.origin);
                    for (const test of rig.tests) {
                        logger.log("Test Name:" + test.name);
                        logger.log("Test Source:\n" + test.source);
                    }
                }
            } else {
                if (suites.length > 0) {
                    test_logger.log("Running tests:");
                    await test_frame.start(suites);
                } else
                    test_logger.log("No tests were found. Exiting");
            }

            test_frame.endWatchedTests();
        }
    );

function test_script_template(
    component_strings: any[],
    component: ComponentData
) {
    return `
import spark from "@candlelib/spark";

import wick from "@candlelib/wick";

await wick.appendPresets({});

${component_strings.join("\n")};

const comp = new (wick.rt.gC("${component.name}"))();

comp.hydrate();

comp.initialize();

const component = comp;
const ele = comp.ele;
const root = comp.ele;

comp.appendToDOM(document.body);

await spark.sleep(10);
`;
}
