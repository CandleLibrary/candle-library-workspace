import html from "@candlelib/html";
import spark from "@candlelib/spark";

import { htmlTemplateToString } from "../../build/compiler/ast-render/html.js";
import { componentDataToCompiledHTML } from "../../build/compiler/ast-build/html.js";
import { hydrateComponentElements } from "../../build/runtime/html.js";
import { Context } from "../../build/compiler/common/context.js";
import { parseSource } from "../../build/compiler/ast-parse/source.js";
import { createCompiledComponentClass } from "../../build/compiler/ast-build/build.js";
import { createClassStringObject, componentDataToJS } from "../../build/compiler/ast-render/js.js";

export async function getInstanceHTML(comp, context) {
    return (await componentDataToCompiledHTML(comp, context)).html[0];
}

export async function getRenderedHTML(comp, context) {
    const html = (await componentDataToCompiledHTML(comp, context)).html[0];
    return htmlTemplateToString(html);
}

function ensureContext(context = new Context) {
    return context || new Context;
}

export async function getHTMLString(source_string, context) {
    context = ensureContext(context);
    const component = await parseSource(source_string, context);
    const html = (await componentDataToCompiledHTML(component, context)).html[0];
    return htmlTemplateToString(html);
}

export async function getClassString(source_string, context) {
    context = ensureContext(context);
    const component = await parseSource(source_string, context);
    const comp_info = await createCompiledComponentClass(component, context);
    return createClassStringObject(component, comp_info, context).class_string;
}

export async function getCompInstance(source_string, model = null, context = null) {
    context = ensureContext(context);
    const component = await parseSource(source_string, context);
    const comp_info = await createCompiledComponentClass(component, context);
    return new (componentDataToJS(component, comp_info, context))(context, model);
}


export async function createComponentInstance(comp, context, model = null) {
    const ele = html(await getRenderedHTML(comp, context));

    const components = hydrateComponentElements([ele]);

    for (const r of components)
        r.hydrate();
    const runtime_component = components.pop();
    // spark.update();
    spark.update();

    return runtime_component;
}

function getAttribute(ele, k) {
    if (ele.getAttribute)
        return ele.getAttribute(k);

    if (ele.attributes) {
        if (ele.attributes instanceof Map)
            return ele.attributes.get(k);

        else if (Array.isArray(ele.attributes))
            for (const [key, v] of ele.attributes)
                if (k == key) return v;
    }
}

export function assertTree(tree, ele, prev_name = "") {
    let OPEN_TEST = false;
    try {


        if (tree.t) {
            if (prev_name)
                prev_name += "" + tree.t;
            else
                prev_name = tree.t;

            harness.pushTestResult();
            harness.pushName(`Expect ele tag [${ele?.tagName?.toLowerCase().trim()}] == [${prev_name}]`);
            harness.pushAndAssertValue(
                harness.shouldEqual(tree.t.toLowerCase().trim(), ele?.tagName?.toLowerCase().trim())
                && harness.shouldHaveProperty(ele, "tagName"));
            harness.popTestResult();
            harness.popName();
        } else if (prev_name)
            prev_name += "{}";
        else
            prev_name = "{}";

        if (tree.a)
            for (const [k, v] of tree.a)
                if (k) {
                    harness.pushTestResult();
                    harness.pushName(`Element attribute ${prev_name}::[${k}] is present`);
                    harness.pushAndAssertValue(harness.shouldNotEqual(getAttribute(ele, k), undefined));
                    harness.popTestResult();
                    harness.popName();
                    if (v) {
                        harness.pushTestResult();
                        harness.pushName(`Element attribute ${prev_name}::[${k}=${getAttribute(ele, k)}] == ${v} `);
                        harness.pushAndAssertValue(harness.shouldEqual(getAttribute(ele, k), v));
                        harness.popTestResult();
                        harness.popName();
                    }
                }

        if (tree.d || tree.d == "") {
            harness.pushTestResult();
            harness.pushName(`Expect [${prev_name}=="${ele.data.trim()}"] == "${tree.d.trim()}"`);
            harness.pushAndAssertValue(harness.shouldEqual(ele.data.trim(), tree.d.trim()));
            harness.popName();
            harness.popTestResult();
        }

        if (tree.c) {
            const children = ele.childNodes || ele.children;
            for (let i = 0; i < tree.c.length; i++) {
                if (tree.c[i])
                    assertTree(tree.c[i], children[i], prev_name + `>${1 + i}:`);
            }
        }

    } catch (e) {
        harness.pushTestResult();
        harness.pushName(`Error encountered when comparing ${JSON.stringify(tree)}`);
        harness.addException(e);
        harness.popName();
        harness.popTestResult();
    }

}
