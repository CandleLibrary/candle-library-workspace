//Target actual package file to prevent recursive references
import { getPackageJsonObject } from "@candlelib/paraffin";
import URL from "@candlelib/uri";
import { rt } from "../../client/runtime/runtime.js";
import { createCompiledComponentClass } from "../../compiler/ast-build/build.js";
import { ComponentData } from '../../compiler/common/component.js';
import { Context } from '../../compiler/common/context.js';
import { metrics } from '../../compiler/metrics.js';
import { renderCompressed } from "../../compiler/source-code-render/render.js";
import { componentDataToCSS } from "../../compiler/ast-render/css.js";
import { componentDataToHTML, htmlTemplateToString } from "../../compiler/ast-render/html.js";
import { createClassStringObject } from "../../compiler/ast-render/js.js";


await URL.server();

// Load current wick package name and version
const { package: { version, name } } = await getPackageJsonObject(URL.getEXEURL(import.meta));

type PageRenderHooks = {
    /**
     * Default:
     * ```js
     * import w from "/@cl/wick.runtime/"
     *
     * w.appendPresets({})
     *
     * component_class_declarations...
     * ```
     */
    resolve_import_path: (string: string) => string,
    init_script_render: (component_class_declarations: string, context: Context) => string;
    init_components_render: (component_class_declarations: string, context: Context, resolve_import_path: (string: string) => string) => string;
};


function renderBasicWickPageInit(component_class_declarations: string, context: Context) {
    return `
    import w from "/@cl/wick-rt/";

    w.hydrate();
`;
}

function renderRadiatePageInit(component_class_declarations: string, context: Context) {
    return `
    import init_router from "/@cl/wick-radiate/";

    init_router();
`;
}

function renderComponentInit(component_class_declarations: string, context: Context, resolve_import_path: (string: string) => string = _ => _) {
    return `
    const w = wick;

    w.appendPresets(${renderPresets(context, resolve_import_path)});

    ${component_class_declarations}
    `;
}

export const default_wick_hooks = {
    init_script_render: renderBasicWickPageInit,
    init_components_render: renderComponentInit,
    resolve_import_path: (_: any) => _
}, default_radiate_hooks = {
    init_script_render: renderRadiatePageInit,
    init_components_render: renderComponentInit,
    resolve_import_path: (_: any) => _
};


interface RenderPageOptions {
    /**
     * If true, a component's CSS data will 
     * be integrated into the component class.
     * 
     * default: `false`
     */
    INTEGRATED_CSS?: boolean,
    /**
     * If true, a component's HTML data will 
     * be integrated into the component class.
     * 
     * default: `false`
     */
    INTEGRATED_HTML?: boolean;
    /**
     * If true, a component's CSS data will 
     * be statically rendered in the head element
     * of the output document.
     * 
     * default: `true`
     */
    STATIC_RENDERED_CSS?: boolean,
    /**
     * If true, a component's HTML data will 
     * be statically rendered in the body element
     * of the output document.
     * 
     * default: `true`
     */
    STATIC_RENDERED_HTML?: boolean;

    /**
     * If true, a script element will be generated
     * within the output document that will be used
     * to initialize component classes on page load.
     * 
     * default: `true`
     */
    INTEGRATE_COMPONENTS?: boolean;

    /**
     * If true, all Wick annotation attributes will
     * be rendered, including those on elements that 
     * otherwise receive no benefit from such attributes.
     * 
     * default: `false`
     */
    VERBOSE_ANNOTATION_ATTRIBUTES?: boolean;

    /**
     * If true, JS code will not be generated for 
     * bindings that can be statically resolved 
     * server-side.
     * 
     * default: `true`
     */
    ALLOW_STATIC_REPLACE?: boolean;
}

const default_options: RenderPageOptions = {
    INTEGRATED_CSS: false,
    INTEGRATED_HTML: false,
    STATIC_RENDERED_CSS: true,
    STATIC_RENDERED_HTML: true,
    INTEGRATE_COMPONENTS: true,
    ALLOW_STATIC_REPLACE: true,
    VERBOSE_ANNOTATION_ATTRIBUTES: false
};

/**[API]
 * Builds a single page from a wick component, with the
 * designated component serving as the root element of the
 * DOM tree. Can be used to build a hydratable page.
 *
 * Optionally hydrates with data from an object serving as a virtual preset.
 *
 * Returns HTML markup and an auxillary script strings that
 * stores and registers hydration information.
 */
export async function RenderPage(
    comp: ComponentData,
    context: Context = rt.context,
    {
        INTEGRATED_CSS = default_options.INTEGRATED_CSS,
        INTEGRATED_HTML = default_options.INTEGRATED_HTML,
        STATIC_RENDERED_CSS = default_options.STATIC_RENDERED_CSS,
        STATIC_RENDERED_HTML = default_options.STATIC_RENDERED_HTML,
        INTEGRATE_COMPONENTS = default_options.INTEGRATE_COMPONENTS,
        ALLOW_STATIC_REPLACE = default_options.ALLOW_STATIC_REPLACE,
        VERBOSE_ANNOTATION_ATTRIBUTES = default_options.VERBOSE_ANNOTATION_ATTRIBUTES,
    }: RenderPageOptions = default_options,
    hooks: PageRenderHooks = comp.RADIATE
        ? default_radiate_hooks
        : default_wick_hooks
): Promise<{
    /**
     * A string of template elements that comprise components that are rendered
     * within containers. 
     */
    templates: string,
    /**
     * The main component rendered with static data
     */
    html: string,
    /**
     * All head elements gathered from all components
     */
    head: string,
    /**
     * All component class code
     */
    script: string,
    /**
     * All component CSS style data
     */
    style: string;
    /**hoo
     * A deploy ready page string
     */
    page: string;
} | null> {

    if (!comp) return null;


    // Identify all components that are directly or 
    // indirectly related to this component
    const components_to_process: ComponentData[]
        = getDependentComponents(comp, context);

    //Optionally transform HTML before rendering to string 

    /** WARNING!!
     * Transforming a component's html structure can lead to 
     * incompatible component code. Handle this with care
     */
    let html = "", templates = "";

    if (STATIC_RENDERED_HTML) {

        let template_map = null;

        ({ html, template_map } = await componentDataToHTML(comp, context, 1));

        templates = [...template_map.values()].map(t => htmlTemplateToString(t, 1)).join("\n");
    }

    let script = "", style = "", head = "";

    for (const comp of components_to_process) {

        const class_info =
            await createCompiledComponentClass(
                comp, context, INTEGRATED_HTML, INTEGRATED_CSS, ALLOW_STATIC_REPLACE
            ),
            { class_string } = createClassStringObject(comp, class_info, context, "w.rt.C");

        if (comp.HTML_HEAD.length > 0) {
            for (const node of comp.HTML_HEAD) {
                head += renderCompressed(node);
            }
        }

        if (INTEGRATE_COMPONENTS)
            script += "\n" + `w.rt.rC(${class_string});`;

        if (STATIC_RENDERED_CSS)
            style += componentDataToCSS(comp);
    }

    const page = comp.RADIATE
        ? renderRadiatePageString(context, templates, html, head, script, style, hooks)
        : renderWickPageString(context, templates, html, head, script, style, hooks);

    metrics.clearMetrics();

    return { templates, html, head, script, style, page };
}


export function getDependentComponents(comp: ComponentData, context: Context) {
    const
        candidate_components = [comp],

        components_to_process: ComponentData[] = [],

        applicable_components = new Set([comp.name]);

    while (candidate_components.length > 0) {

        const comp = candidate_components.shift();

        if (comp) {

            components_to_process.push(comp);

            for (const comp_name of comp.local_component_names.values()) {

                if (!applicable_components.has(comp_name)) {

                    applicable_components.add(comp_name);

                    const comp = context.components.get(comp_name);

                    if (comp) candidate_components.push(comp);
                }
            }
        }
    }
    return components_to_process;
}


const boiler_plate = `
    <style id="wick-boiler-plate">

    * { box-sizing: border-box; }

    html, body { height: 100%; }

    body {
        position:absolute; 
        top:0;
        left:0; 
        width:100%;
        padding:0;
        margin:0; border:none;
    }
    
    li { list-style:none }
    
    a { text-decoration:none }
    
    </style>`;
function renderWickPageString(
    context: Context,
    templates: string,
    html: string,
    head: string,
    script: string,
    style: string,
    hooks: PageRenderHooks,
): string {


    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="generator" content="${name}-${version}"> 
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${head.split("\n").join("\n    ")}
    ${boiler_plate}
    <style id="wick-app-style">
    ${style.split("\n").join("\n    ")}
    </style>       

  </head>
  <body>
${html}
${templates}
    <script type=module id="wick-init-script">
        ${hooks.init_script_render(script.split("\n").join("\n      "), context)}
    </script>
    <script type=module id="wick-component-script">
        ${hooks.init_components_render(script.split("\n").join("\n      "), context, hooks.resolve_import_path)}
    </script>
  </body>
</html>`;
}

function renderRadiatePageString(
    context: Context,
    templates: string,
    html: string,
    head: string,
    script: string,
    style: string,
    hooks: PageRenderHooks
): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="generator" content="${name}-${version}"> 
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${head.split("\n").join("\n    ")}
    ${boiler_plate}

    <style id="wick-app-style">
    ${style.split("\n").join("\n            ")}
    </style>

    <style id="radiate">
        .radiate-page {
            position:absolute;
            top:0;
            left:0;
        }

        .radiate-hide {
            opacity:0;
        }

        radiate-modals {
            position:fixed;
            width:100%;
            top:0;
            left:0;
        }

        radiate-modals iframe{
            border: none;
            width:100vh;
            height:100vh;
        }
    </style>
  </head>
  <body>
    <script> document.body.classList.toggle("radiate-init"); </script>
${html}
${templates}
    <script type=module id="wick-init-script">
      ${hooks.init_script_render(script.split("\n").join("\n      "), context)}
    </script>
    <script type=module id="wick-component-script">
      ${hooks.init_components_render(script.split("\n").join("\n      "), context, hooks.resolve_import_path)}
    </script>
  </body>
</html>`;
}


function renderPresets(context: Context, resolve_import_path: (string: string) => string = _ => _) {
    const out_value = {
        repo: [...context.repo.values()].map(repo => [repo.hash, resolve_import_path(repo.url)])
    };
    return JSON.stringify(out_value);
}