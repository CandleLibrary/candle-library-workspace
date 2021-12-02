import URL from "@candlelib/uri";
import { parseSource } from "./ast-parse/source.js";
import * as b_sys from "./build_system.js";
import { ComponentData } from "./common/component.js";
import { Context } from './common/context.js';
import { rt } from "../client/runtime/global.js";

/**
 * Creates an ExtendedComponentData object from a string or 
 * from data imported from a URL.
 */
export async function createComponent(
    /**
     * String with Wick source text or a 
     * URL to a file containing source text.
     */
    input: string | URL,
    /**
     * An optional Presets object. If this is 
     * left undefined then the global context object will be used, 
     * or a new global context object will be created if not defined. 
     * This argument is Presets object and the global context object 
     * has not yet been set, then global context will be set to the 
     * value of this argument.
     */
    context: Context = rt.context,

    /**
     * Base URL of component to resolve relative paths
     */
    location?: URL

): Promise<ComponentData> {

    // Ensure there is a context object attached to this component.
    if (!context)
        context = new Context();

    if (!rt.context)
        rt.context = context;

    b_sys.enableParserFeatures();

    const { comp: comp_data } = await parseSource(input, context, location);

    b_sys.disableParserFeatures();

    comp_data.context = context;

    return comp_data;
}
