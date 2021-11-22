import { JSNode, JSNodeType } from "@candlelib/js";
import { default as URI, default as URL } from "@candlelib/uri";
import { BINDING_FLAG, BINDING_VARIABLE_TYPE, HTMLNode, HTMLNodeClass } from "../../types/all.js";
import { addBindingVariable, processUndefinedBindingVariables } from "../common/binding.js";
import { ComponentData, createComponentData } from "../common/component.js";
import { Context } from '../common/context.js';
import { createParseFrame } from "../common/frame.js";
import { getAttributeValue, hasAttribute } from "../common/html.js";
import { convertMarkdownToHTMLNodes } from "../common/markdown.js";
import { metrics } from '../metrics.js';
import { NodeTypes } from "../source-code-parse/env.js";
import { parse_component, parse_markdown } from "../source-code-parse/parse.js";
import { processWickHTML_AST, processWickJS_AST } from "./parse.js";

export const component_cache = {};


function addComponentNamesToPresets(component: ComponentData, context: Context) {
    for (const name of component.names)
        context.named_components.set(name.toUpperCase(), component);
}


function getHTML_AST(ast: HTMLNode | JSNode): HTMLNode {

    while (ast && !(ast.type & HTMLNodeClass.HTML_ELEMENT))
        ast = <any>ast.nodes[0];

    return <any>ast;
}

function determineSourceType(ast: HTMLNode | JSNode): boolean {

    if (ast.type == JSNodeType.Script || ast.type == JSNodeType.Module) {
        if (ast.nodes.length > 1) return true;
        if (ast.nodes[0].type != JSNodeType.ExpressionStatement) return true;
        if (!(ast.nodes[0].nodes[0].type & HTMLNodeClass.HTML_ELEMENT)) return true;
    }

    return false;
};

const empty_obj = {};

/**
 * This functions is used to compile a Wick component, which can then be immediately
 * It will accept a string containing wick markup, or a URL that points to a wick component.
 * 
 * @param input {number}
 * @param context {Context} - 
 * @param root_url 
 */
export async function parseSource(
    input: URL | string,
    context?: Context,
    root_url: URL = new URL(URL.GLOBAL + "/")
): Promise<{ IS_NEW: boolean, comp: ComponentData; }> {

    const run_tag = metrics.startRun("Parse Source Input");

    //If this is a node.js environment, make sure URL is able to resolve local files system addresses.
    if (typeof (window) == "undefined") await URL.server();

    let
        source_url: URL = null,
        data: any = empty_obj,
        errors: Error[] = [];

    try {

        let url = new URL(input);

        //Sloppy tests to see if the input is A URL or not
        if (typeof input == "string") {
            if (
                input.trim[0] == "."
                ||
                url.ext == "wick"
                ||
                url.ext == "html"
                ||
                (url + "").length == input.length
            ) { /* Allow to pass through */ }
            else if (
                input.trim()[0] == "<"
                ||
                input.indexOf("\n") >= 0
            ) throw "input is not a url";
        }

        if (url.IS_RELATIVE)
            url = URL.resolveRelative(url, root_url);

        data = await fetchASTFromRemote(url);

        source_url = url;

        if (data.errors.length > 0)
            throw data.errors.pop();

    } catch (e) {


        if (typeof input == "string") {

            //Illegal URL, try parsing string
            try {
                data = await parse_component(<string>input);

                if (data.error)
                    throw data.error;

                source_url = new URL(root_url + "");


            } catch (a) {
                errors.push(e, a);
            }
        } else {
            errors.push(e);
        }

    } finally {
        metrics.endRun(run_tag);
    }

    const {
        string: input_string = input,
        ast = null,
        resolved_url: url = null,
        error: e = null,
        comments = []
    } = data;

    return <Promise<{ IS_NEW: boolean, comp: ComponentData; }>>
        <any>await parseComponentAST(ast,
            <string>input_string,
            source_url,
            context,
            null,
            errors
        );
};

export async function parseComponentAST(
    ast: HTMLNode | JSNode,
    source_string: string,
    url: URL,
    context: Context,
    parent: ComponentData = null,
    parse_errors: Error[] = [],

): Promise<{ IS_NEW: boolean, comp: ComponentData; }> {



    const
        run_tag = metrics.startRun("Parse Source AST"),

        component: ComponentData = createComponentData(source_string, url);

    if (context.components.has(component.name)) {
        metrics.endRun(run_tag);
        return { IS_NEW: false, comp: context.components.get(component.name) };
    }

    context.components.set(component.name, component);

    component.root_frame = createParseFrame(null, component);

    component.source_hash = component.name;

    component.comments = [];

    if (parent)
        integrateParentComponentScope(parent, component);

    component.errors.push(...parse_errors);


    if (ast)
        try {

            if (ast && parse_errors.length == 0) {

                const IS_SCRIPT = determineSourceType(ast);

                if (IS_SCRIPT)
                    await processWickJS_AST(<JSNode>ast, component, context);
                else
                    await processWickHTML_AST(getHTML_AST(ast), component, context);

                addComponentNamesToPresets(component, context);

                processUndefinedBindingVariables(component, context);

                metrics.endRun(run_tag);

            }

        } catch (e) {
            console.error(e);
            component.errors.push(e);
        }

    metrics.endRun(run_tag);

    component.HAS_ERRORS = component.errors.length > 0;

    return { IS_NEW: true, comp: component };
}
function integrateParentComponentScope(
    parent: ComponentData,
    component: ComponentData
) {

    for (const [name, val] of parent.local_component_names.entries())
        component.local_component_names.set(name, val);


    for (const [name, binding] of parent.root_frame.binding_variables) {

        switch (binding.type) {
            case BINDING_VARIABLE_TYPE.MODULE_MEMBER_VARIABLE:

                {
                    addBindingVariable(
                        component.root_frame,
                        binding.internal_name,
                        {},
                        BINDING_VARIABLE_TYPE.ATTRIBUTE_VARIABLE,
                        binding.external_name,
                        BINDING_FLAG.ALLOW_EXPORT_TO_PARENT | BINDING_FLAG.FROM_PARENT
                    );
                } break;

            case BINDING_VARIABLE_TYPE.MODULE_NAMESPACE_VARIABLE:
            case BINDING_VARIABLE_TYPE.TEMPLATE_CONSTANT:
                {
                    addBindingVariable(
                        component.root_frame,
                        binding.internal_name,
                        {},
                        binding.type,
                        binding.external_name,
                        BINDING_FLAG.FROM_PRESETS | BINDING_FLAG.FROM_OUTSIDE
                    );
                } break;

            case BINDING_VARIABLE_TYPE.INTERNAL_VARIABLE: {
                addBindingVariable(
                    component.root_frame,
                    name,
                    {},
                    BINDING_VARIABLE_TYPE.ATTRIBUTE_VARIABLE,
                    name,
                    BINDING_FLAG.ALLOW_EXPORT_TO_PARENT | BINDING_FLAG.FROM_PARENT
                );

                binding.flags |= BINDING_FLAG.ALLOW_UPDATE_FROM_CHILD;
            } break;
        }
    }
}

export async function fetchASTFromRemote(url: URL) {

    const
        errors = [];

    let ast = null,
        comments = null,
        error = null,
        string = "";

    if (!url)
        throw new Error("Could not load URL: " + url + "");

    try {
        string = <string>await url.fetchText();

        // HACK -- if the source data is a css file, then wrap the source string into a <style></style> element string to enable 
        // the wick parser to parser the data correctly. 
        if (url.ext == "css")
            string = `<style>${string}</style>`;

        if (url.ext == "md") {

            //Preprocess the markdown into HTML
            ast = await parse_markdown(string);

            ast = convertMarkdownToHTMLNodes(ast);

            if (ast?.nodes?.[0]?.type == NodeTypes.HTML_IMPORT) {

                const import_node = ast?.nodes?.[0];
                //Import the template node and 

                const
                    template_url = String(getAttributeValue("url", import_node) || ""),
                    template = hasAttribute("template", import_node);
                if (template) {
                    const uri = URI.resolveRelative(template_url, url);

                    if (await uri.DOES_THIS_EXIST()) {
                        const wrapper_string = `
import tmpcomp from "${template_url + ""}";

export default <tmpcomp>
    <slot></slot>
</tmpcomp>;`;
                        const { ast: temp } = parse_component(wrapper_string);

                        temp.nodes[1].nodes[0].nodes = ast.nodes;

                        ast.nodes.splice(0, 1);

                        ast = temp;
                    }
                }
            }
        } else {
            ({ ast, comments, error } = parse_component(string));
        }

        if (error)
            errors.push(error);

    } catch (e) {
        console.log(e);

        errors.push(e);
    }

    return { ast, string, resolved_url: url.toString(), errors, comments };
}