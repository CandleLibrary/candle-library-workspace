import { ComponentData } from '../../compiler/common/component.js';
import { Context } from '../../compiler/common/context';
export async function processTemplateComponent(
    component: ComponentData,
    context: Context
) {

    if (component.TEMPLATE) {

        let data = context.template_data.get(component);

        if (data) for (const template_data of data) {

            if (!template_data.page_name)
                component.root_frame.ast.pos?.throw(
                    "Expected [page_name] for template",
                    component.location.toString()
                );

            context.active_template_data = template_data;

            /* const { USE_RADIATE_RUNTIME: A, USE_WICK_RUNTIME: B }
                = await buildComponentPage(component, context, template_data.page_name, output_directory);

            context.active_template_data = null;

            USE_RADIATE_RUNTIME ||= A;
            USE_WICK_RUNTIME ||= B; */
        }
    }
}