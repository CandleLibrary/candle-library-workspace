import { createSourceMap, createSourceMapJSON } from "@candlelib/conflagrate";
import { stmt } from "@candlelib/js";
import { ComponentData } from '../common/component.js';
import { WickRTComponent } from "../../client/runtime/component/component.js";
import { CompiledComponentClass, ComponentClassStrings } from "../../types/all.js";
import { createCompiledComponentClass } from "../ast-build/build.js";
import { renderWithFormatting } from "../source-code-render/render.js";
import { Context } from '../common/context.js';


const

    StrToBase64 = (typeof btoa != "undefined")
        ? btoa
        : (str: string) => Buffer.from(str, 'binary').toString('base64');

function componentStringToJS({ class_string: cls, source_map }: ComponentClassStrings, component: ComponentData, context: Context) {
    //Ensure WickRTComponent is inside closure
    const class_ref = WickRTComponent;

    return (
        eval(
            "c=>" + cls + (context.options?.GENERATE_SOURCE_MAPS ? `\n${source_map}` : "")
        )
    )(component);
}
export async function componentDataToJSCached(
    component: ComponentData,
    context: Context,
    INCLUDE_HTML: boolean = true,
    INCLUDE_CSS: boolean = true
): Promise<typeof WickRTComponent> {

    const name = component.name;

    let comp: typeof WickRTComponent = context.component_class.get(name);

    if (!comp) {

        const comp_class = await createCompiledComponentClass(component, context, INCLUDE_HTML, INCLUDE_CSS);

        const class_strings = createClassStringObject(component, comp_class, context);

        comp = componentStringToJS(class_strings, component, context);

        context.component_class.set(name, comp);

        for (const comp of component.local_component_names.values()) {
            if (!context.component_class_string.has(comp) && context.components.has(comp)) {
                //@ts-ignore
                await componentDataToJSCached(context.components.get(comp), context, INCLUDE_HTML, INCLUDE_CSS);
            }
        }
    }

    return comp;
}

export async function componentDataToJS(
    component: ComponentData,
    context: Context,
    INCLUDE_HTML: boolean = true,
    INCLUDE_CSS: boolean = true,
    class_name: string = "WickRTComponent"
): Promise<typeof WickRTComponent> {

    const comp_class = await createCompiledComponentClass(component, context, INCLUDE_HTML, INCLUDE_CSS);

    const class_strings = createClassStringObject(component, comp_class, context, class_name);

    return componentStringToJS(class_strings, component, context);
}

export async function componentDataToJSStringCached(
    component: ComponentData,
    context: Context,
    INCLUDE_HTML: boolean = true,
    INCLUDE_CSS: boolean = true,
    class_name: string = "WickRTComponent"
): Promise<ComponentClassStrings> {

    const name = component.name;

    let class_strings: ComponentClassStrings = context.component_class_string.get(name);

    if (!class_strings) {

        const comp_class = await createCompiledComponentClass(component, context, INCLUDE_HTML, INCLUDE_CSS);

        class_strings = createClassStringObject(component, comp_class, context, class_name);

        context.component_class_string.set(name, class_strings);
    }

    return class_strings;
}

export function createClassStringObject(
    component: ComponentData,
    class_info: CompiledComponentClass,
    context: Context,
    class_name: string = "WickRTComponent"
): ComponentClassStrings {



    let cl = "", sm = "";

    let component_class = null;

    const name = component.name || "temp";

    if (component.global_model_name)
        component_class = stmt(`class ${name} extends 
        ${class_name} {constructor(e,p,w){super(e,p,w,"${component.global_model_name}");}}`);
    else
        component_class = stmt(`class ${name} extends ${class_name} {}`);

    //@ts-ignore
    component_class.nodes.push(...class_info.methods.filter(m => m.nodes[2].nodes.length > 0));

    if (context.options?.GENERATE_SOURCE_MAPS) {

        const
            map: any[] = [],
            names = new Map();

        cl = renderWithFormatting(component_class, undefined);

        const source_map = createSourceMap(map, component.location.file, component.location.dir, [component.location.file], [], [component.source]);

        sm = "//# sourceMappingURL=data:application/json;base64," + StrToBase64(createSourceMapJSON(source_map));
    }
    else
        cl = renderWithFormatting(component_class);



    return {
        class_string: cl + (context.options.INCLUDE_SOURCE_URI ? +`\n/* ${component.location} */\n` : ""),
        source_map: sm
    };
}


