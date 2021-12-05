import { WorkspaceSystem } from "../types/workspace_system.js";
import { HistoryArtifact } from "../types/history_artifact.js";
import { ObjectCrate } from "../types/object_crate.js";


export function updateCSS(sys: WorkspaceSystem, history: HistoryArtifact, FORWARD = true) {

    const
        active = FORWARD ? history.progress : history.regress,
        opposite = FORWARD ? history.regress : history.progress,
        names = [];

    if (active) {


        const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = active;

        //Mode Updated data stylesheets.
        // Setup css object in the environment and in the wick component

        // debugger;

        //TODO: Need to link with the server to update the style of the component

        /*  const comp_data = getComponentDataFromName(sys, name);
 
 
         //Ensure comp_data has css
 
         if (comp_data.CSS.length == 0) {
             comp_data.CSS.push(<CSSNode>{
                 type: CSSNodeType.Stylesheet,
                 nodes: [],
                 pos: {}
             });
         }
 
         // For each prop, find rule with correct selector, bottom up. 
         // Insert new prop into rule. 
         //Find matching rule.
         let rule = css.getLastRuleWithMatchingSelector(comp_data.CSS[0], css.selector(selector_string));
 
         if (!rule) {
             rule = css.rule(`${selector_string}{${prop_string}}`);
             comp_data.CSS[0].nodes.push(rule);
         }
         else {
             const prop = css.property(prop_string);
             rule.props.set(prop.name, prop);
         } */

        names.push(name);

    }


    if (!FORWARD) {
        if (active) {

            const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = active;

            //debugger;

            /* // Setup css object in the environment and in the wick component
            const comp_data = <WickRTComponent>sys.editor_wick.rt.context.components.get(name);

            // For each prop, find rule with correct selector, bottom up. 
            // Insert new prop into rule. 
            //Find matching rule.
            const rule = css.getLastRuleWithMatchingSelector(comp_data.CSS[0], css.selector(selector_string));

            if (rule) {
                const prop = css.property(prop_string);
                rule.props.set(prop.name, prop);
            } */

            names.push(name);

        }
        else {
            const { comp_data_name: name, valueA: prop_name, valueB: prop_string, valueC: selector_string } = opposite;

            //debugger;
            /*  // Setup css object in the environment and in the wick component
             const comp_data = <WickRTComponent>sys.editor_wick.rt.context.components.get(name);
 
             // For each prop, find rule with correct selector, bottom up. 
             // Insert new prop into rule. 
             //Find matching rule.
             const rule = css.getLastRuleWithMatchingSelector(comp_data.CSS[0], css.selector(selector_string));
 
             if (rule) {
 
                 rule.props.delete(prop_name);
 
                 if (rule.props.size == 0)
                     css.removeRule(comp_data.CSS[0], rule);
             } */

            names.push(name);
        }
    }


    return names;
}


export async function sealCSS(sys: WorkspaceSystem, crate: ObjectCrate) {
    return history;
}
