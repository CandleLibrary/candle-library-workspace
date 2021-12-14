import * as b_sys from "./build_system.js";
import { debug } from '../common/logger.js';

export async function init_build_system() {

    debug("\n\n----------- Initializing Wick ---------------");

    debug("Loading Wick build features");
    /*** */
    await import("./features/container_features.js");
    await import("./features/expression_features.js");
    await import("./features/function_features.js");
    await import("./features/html_attribute_features.js");
    await import("./features/html_event_attribute_features.js");
    await import("./features/html_img_features.js");
    await import("./features/html_general_features.js");
    await import("./features/identifier_features.js");
    await import("./features/input_features.js");
    await import("./features/module_features.js");
    await import("./features/string_features.js");
    await import("./features/text_node_features.js");
    await import("./features/template_features.js");
    await import("./features/markdown_features.js");
    await import("./features/test_features.js");

    await b_sys.loadFeatures();

    debug("Completed loading of build features");

    debug("------------ Wick Initialized ---------------\n\n");
}
