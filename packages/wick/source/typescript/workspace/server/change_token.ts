import { rule as parse_rule, tools } from '@candlelib/css';
import { Token } from '@candlelib/hydrocarbon';
import URI from '@candlelib/uri';
import { ComponentData } from '../../compiler/common/component.js';
import { getElementAtIndex } from '../../compiler/common/html.js';
import { renderNew } from '../../compiler/source-code-render/render.js';
import { Change, ChangeType } from '../../types/transition.js';
import { getComponent } from './store.js';
export interface ChangeToken {
    location: string,
    component: string,
    token: Token;
    string: string;
}

export async function getAttributeChangeToken(
    change: Change[ChangeType.Attribute]
): Promise<ChangeToken | null> {

    const { component, attribute_index, name: old_name, ele_id, new_value, old_value } = change;

    const comp = await getComponent(component);

    if (comp) {

        const ele = getElementAtIndex(comp, ele_id);

        if (ele) {

            let token_change: ChangeToken = {
                component,
                location: "",
                token: null,
                string: ""
            };

            let UPDATED = false;

            for (const { name, value, pos } of ele.attributes ?? []) {

                if (name == old_name && typeof value == "string") {
                    token_change.token = pos.token_slice();

                    if (!new_value) {
                        token_change.string = "";
                    } else {
                        token_change.string = `${old_name}="${new_value}"`;
                    }

                    UPDATED = true;

                    break;
                }
            }
            if (!UPDATED) {

                token_change.token = ele.pos.token_slice(1 + ele.tag.length, 1 + ele.tag.length);
                token_change.string = ` ${old_name}="${new_value.trim()}" `;

            }

            return token_change;
        }
    }

    return null;
}


export async function getCSSChangeToken(
    change: Change[ChangeType.CSSRule]
): Promise<ChangeToken> {

    const {
        component,
        location,
        new_rule_path,
        old_rule_path,
        CSS_index,
        new_selectors,
        old_selectors,
        new_properties,
        old_properties
    } = change;

    let token_change: ChangeToken = {
        component,
        location: "",
        token: null,
        string: ""
    };

    //Select the appropriate component
    const uri = new URI(location);

    let comp: ComponentData = <ComponentData>await getComponent(component);

    let rule = null;

    for (const { data, location, container_element_index } of comp.CSS) {

        rule = tools.rules.selectMatchingRule(old_rule_path, data);

        if (rule) {
            token_change.location = location + "";
            break;
        }
    }

    if (rule) {

        const new_rule = parse_rule(`${new_selectors} { ${new_properties.map(({ name, val }) => `${name}:${val}`).join(";")} }`);

        const new_new_rule = tools.rules.mergeRulesIntoOne(rule, new_rule);

        token_change.string = renderNew(new_new_rule);

        token_change.token = rule.pos.token_slice();

    } else {
        if (!comp.CSS[0]) {
            if (comp.HTML) {
                token_change.location = comp.HTML.pos.path;

                token_change.token = comp.HTML.pos.token_slice(-(comp.HTML.tag.length + 3), -(comp.HTML.tag.length + 3));
                token_change.string = `<style> ${new_selectors} { ${new_properties.map(({ name, val }) => `${name}:${val}`).join(";")} } </style>`;
            } else {
                debugger;
            }
        } else {
            const style_sheet = comp.CSS[0].data;
            token_change.string = `${new_selectors} { ${new_properties.map(({ name, val }) => `${name}:${val}`).join(";")} }`;

            token_change.token = style_sheet.pos.token_slice(style_sheet.pos.len);

            token_change.location = comp.CSS[0].location + "";
        }
    }

    return token_change;
}
