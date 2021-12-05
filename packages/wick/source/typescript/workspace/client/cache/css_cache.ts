import { copy, traverse } from '@candlelib/conflagrate';
import {

    CSSNodeType, CSSProperty,
    CSSRuleNode,
    CSS_String,

    parse,
    parseProperty,
    PrecedenceFlags, property, renderCompressed,
    tools as css_tools,
    tools
} from "@candlelib/css";
import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import { Lexer } from "@candlelib/wind";
import { EditorCommand } from '../../../types/editor_types.js';
import { Change, ChangeType } from '../../../types/transition.js';
import {
    getComponentNameFromElement, getElementWIndex, getRuntimeComponentsFromName, updateActiveSelections
} from "../common_functions.js";
import { WorkspaceSystem, StyleData } from "../types/workspace_system.js";
import { TrackedCSSProp } from "../types/tracked_css_prop.js";

const cache_logger = Logger.get("flame").get("css").activate();

let global_cache = null;

const unset_string = new CSS_String("unset"), unset_pos = {
    slice() { return "unset"; }
};

const selector_helpers = Object.assign(
    {},
    tools.selectors.DOMHelpers,
    {
        hasPseudoClass: () => true
    }
);


interface CSSRuleReference {
    source_location: URI;

    comp_name: string;

    css_index: number;
    rule: CSSRuleNode;
    id: string;
    specificity: number;
    SELECTED: boolean;
    path: string;
}


const {

    selectors: {
        getLastRuleWithMatchingSelector
    },

    rules: {
        attachParents,
        createRulePath,
    }
} = css_tools;

export const enum CSSFlags {
    // Positioning
    RELATIVE = (1 << 0),
    ABSOLUTE = (1 << 1),
    STATIC = (1 << 2) | (1 << 1),
    STICKY = (1 << 3) | (1 << 1),
    FIXED = (1 << 4) | (1 << 1),
    POSITION_MASK = (1 << 5) - 1,

    //DISPLAY
    BLOCK = (1 << 5),
    INLINE = (1 << 6),
    INLINE_BLOCK = (1 << 7),
    LIST_ITEM = (1 << 8),
    TABLE = (1 << 9),
    DISPLAY_MASK = ((1 << 10) - 1) ^ CSSFlags.POSITION_MASK,

    //BOX MODEL 

    /**
     * Set if width has a val other than "auto"
     */
    WIDTH_VAL = (1 << 10),
    /**
     * Set if left has a val other than "auto"
     */
    LEFT_VAL = (1 << 11),
    /**
     * Set if right has a val other than "auto"
     */
    RIGHT_VAL = (1 << 12),
    /**
     * Set if margin-left has a val other than "auto"
     */
    MARGIN_L_VAL = (1 << 13),
    /**
     * Set if margin-right has a val other than "auto"
     */
    MARGIN_R_VAL = (1 << 14),
    /**
     * Set if padding-left has a val other than "auto"
     */
    PADDING_L_VAL = (1 << 15),
    /**
     * Set if padding-right has a val other than "auto"
     */
    PADDING_R_VAL = (1 << 16),
    /**
     * Set if border-left has a val other than "auto"
     */
    BORDER_L_VAL = (1 << 17),
    /**
     * Set if border-right has a val other than "auto"
     */
    BORDER_R_VAL = (1 << 18),

    HORIZONTAL_BOX_MASK = ((1 << 19) - 1) ^ (CSSFlags.POSITION_MASK | CSSFlags.DISPLAY_MASK),

    /**
     * Set if height has a val other than "auto"
     */
    HEIGHT_VAL = (1 << 19),
    /**
     * Set if top has a val other than "auto"
     */
    TOP_VAL = (1 << 20),
    /**
     * Set if bottom has a val other than "auto"
     */
    BOTTOM_VAL = (1 << 21),
    /**
     * Set if margin-top has a val other than "auto"
     */
    MARGIN_T_VAL = (1 << 22),
    /**
     * Set if margin-bottom has a val other than "auto"
     */
    MARGIN_B_VAL = (1 << 23),
    /**
     * Set if padding-top has a val other than "auto"
     */
    PADDING_T_VAL = (1 << 24),
    /**
     * Set if padding-bottom has a val other than "auto"
     */
    PADDING_B_VAL = (1 << 25),
    /**
     * Set if border-top has a val other than "auto"
     */
    BORDER_T_VAL = (1 << 26),
    /**
     * Set if border-bottom has a val other than "auto"
     */
    BORDER_B_VAL = (1 << 27),

    VERTICAL_BOX_MASK = ((1 << 28) - 1) ^ (CSSFlags.POSITION_MASK | CSSFlags.DISPLAY_MASK | CSSFlags.HORIZONTAL_BOX_MASK)

}

export class ValueHost implements ObservableModel {

    OBSERVABLE: true;

    watchers: ObservableWatcher[];


    constructor() {

        this.__value__ = 20;

        this.unit = "px";

        this.OBSERVABLE = true;

        this.watchers = [];

        Object.defineProperty(
            this, "value", {
            enumerable: true,
            configurable: false,
            get: this.get.bind(this),
            set: this.set.bind(this),
        });
    }

    get() {
        return this.__value__;
    }

    set(v) {
        this.__value__ = v;

        for (const watcher of this.watchers)
            watcher.onModelUpdate(this);
    }

    subscribe(watcher: ObservableWatcher) {
        this.watchers.push(watcher);
        watcher.onModelUpdate(this);
        return true;
    }

    unsubscribe(watcher: ObservableWatcher) {
        this.watchers = this.watchers.filter(w => w != watcher);
        return true;
    }
}

/**  
 * Cache collects info about the CSS state of an element and provides methods to create new properties.
 * It maintains a connection to the Component Data of an element.
*/

export class CSSCache implements ObservableModel {

    element: HTMLElement;
    next: CSSCache;

    box_model_flags: CSSFlags;

    move_vert_type: string;
    move_hori_type: string;

    changed: Set<string>;

    unique: Map<string, TrackedCSSProp>;
    unique_selector: string;
    original_props: Map<string, TrackedCSSProp>;

    component: string;

    rules: any;

    system: WorkspaceSystem;

    computed: CSSStyleDeclaration;

    /**
     * The list of compiled style data that matches the elements
     * containing component, in order of the component hierarchy
     */
    styles: StyleData[];

    load: Promise<void>;

    COMPONENT_ELEMENT: boolean;

    rule_list: CSSRuleReference[];

    target_ref: CSSRuleReference;

    scratch_rule_ref: CSSRule;

    changes: (Change[ChangeType.Attribute] | Change[ChangeType.CSSRule])[];

    affected_elements: Element[];

    OBSERVABLE: true;
    data: CSSCache;

    watchers: ObservableWatcher[];

    subscribe(watcher: ObservableWatcher): boolean {

        if (this.watchers.includes(watcher))
            return false;

        this.watchers.push(watcher);

        watcher.onModelUpdate({
            width: this.width
        });

        return true;
    };

    unsubscribe(watcher: ObservableWatcher): boolean {
        const index = this.watchers.indexOf(watcher);

        if (index >= 0)
            this.watchers.splice(index, 1);

        return true;
    }


    constructor(sys: WorkspaceSystem) {
        this.rule_list = new sys.editor_wick.objects.ObservableArray([]);
        this.changes = [];
        this.affected_elements = [];

        this.watchers = [];

        this.changed = new Set;

        this.original_props = new Map;
        this.unique = new Map;

        this.setup();

        this.OBSERVABLE = true;

        this.width = new ValueHost();
    }

    destroy() {

        for (const watch of this.watchers.slice())
            watch.removeModel();

        this.removeUniqueSelector();

        this.setup();

        this.next = global_cache;

        global_cache = this;
    }

    /**
     * True if the css_cache is prepared to update
     * a rule that targets the selected component.
     * 
     * If not true, no attempt should be made to 
     * use one of the property update methods 
     * to modify the selected element.
     */

    get READY_FOR_UPDATES(): boolean {
        return !!this.target_ref;
    }


    get height() {
        return 5;
    }
    get top() {
        return 5;
    }
    get bottom() {
        return 5;
    }
    get left() {
        return 5;
    }
    get right() {
        return 5;
    }

    setup() {

        this.box_model_flags = 0;
        this.move_vert_type = "";
        this.move_hori_type = "";

        this.styles = null;
        this.scratch_rule_ref = null;
        this.target_ref = null;

        this.rules = null;
        this.element = null;
        this.component = null;
        this.next = null;

        this.original_props.clear();
        this.changed.clear();
        this.unique.clear();

        this.rule_list.length = 0;
        this.changes.length = 0;
        this.affected_elements.length = 0;
    }
    async loadStyles() {

        let comp = getComponentNameFromElement(this.element);

        const names = getComponentHierarchyNames(this.system, comp).reverse();

        const styles: StyleData[] = [];

        for (const { name, depth } of names) {

            const response = await this.system.session.send_awaitable_command<
                EditorCommand.GET_COMPONENT_STYLE,
                EditorCommand.GET_COMPONENT_STYLE_RESPONSE
            >({
                command: EditorCommand.GET_COMPONENT_STYLE,
                component_name: name
            });

            let index = 0;

            for (const style of response.styles) {
                styles.push({
                    index: index++,
                    comp_name: name,
                    location: new URI(style.location),
                    stylesheet: attachParents(parse(style.string))
                });
            }
        }

        this.component = comp;

        this.COMPONENT_ELEMENT = this.element.hasAttribute("w:c");

        this.computed = window.getComputedStyle(this.element);

        this.styles = styles;
    }

    init(system: WorkspaceSystem, ele: HTMLElement) {

        this.setup();

        this.element = ele;
        this.system = system;

        this.load = this.loadStyles();
    }

    /**
     * Allows user to define a new selector and file
     * location to place a CSS rule. 
     * 
     * The selector may be one comprised of selectors 
     * that are applicable to the selected element. This
     * condition is enforced, and if the new rule does
     * not match the element in some capacity it will not
     * be applied.
     * 
     *  
     * If the location is one that does not exist then
     * the system will create a new CSS file and append
     * it to the component's source imports. In this case, 
     * the path except the filename segment will be ignored
     * and the new CSS file will be created in the same
     * directory as the component source file.
     */
    createRule(rule_string: string, location: string) {

        try {

            const style_sheet = parse(rule_string);

            const rule = traverse(style_sheet, "nodes")
                .filter("type", CSSNodeType.Rule)
                .run(v => v)[0];

            attachParents(style_sheet);

            this.target_ref = rule;

            const classes = this.element.classList.toString();

            const comp = getComponentNameFromElement(this.element);

            this.changes.push({
                component: comp,
                type: ChangeType.Attribute,
                attribute_index: 0,
                ele_id: getElementWIndex(this.element),
                name: "class",
                new_value: classes + " test",
                old_value: classes
            });

            this.uploadChanges();

        } catch (e) {
            console.log(e);
            return e;
        }
        return null;
    }

    /**
     * Return a list of rules that have selectors that match the element. 
     * 
     * Some selector may be within @rules that are not active.
     * 
     * @returns 
     */

    getRuleList() {

        const
            ele = this.element,
            sys = this.system;

        this.rule_list.length = 0;

        let stylesheet_index = 0;

        for (const { stylesheet: styles, location, comp_name } of this.styles) {

            let local_matched_rule_index = 0;

            for (const rule of tools.rules.getArrayOfMatchedRules(ele, styles)) {

                this.rule_list.push({

                    SELECTED: this.target_ref?.rule == rule,

                    source_location: location,

                    comp_name: comp_name,

                    path: createRulePath(rule),

                    css_index: (stylesheet_index << 16) | local_matched_rule_index++,

                    id: renderCompressed(tools.selectors.getFirstMatchedSelector(rule, ele)),

                    rule: rule,

                    specificity: tools.rules.getHighestSpecificity(rule)

                });

                stylesheet_index++;
            }
        }

        this.rule_list.sort((a, b) => {
            let val = b.specificity - a.specificity;

            if (val == 0) {
                return b.css_index - a.css_index;
            }

            return val;
        });

        return this.rule_list;
    }

    setTargetRule(rule_ref: CSSRuleReference) {

        this.target_ref = rule_ref;

        this.applyAndClear();

        const
            { rule } = rule_ref,

            ele = this.element,

            // The unique rule either exists within the edit style sheet cache,
            // or a new one needs to be made.

            m = this.original_props,

            rp = rule.precedence,

            s = tools.selectors.getFirstMatchedSelector(rule, ele),

            sp: PrecedenceFlags = tools.selectors.getSelectorSpecificityValue(s);

        for (const [name, val] of rule.props.entries())
            if (!m.has(name) || (m.get(name).prop.precedence) < (val.precedence | rp | sp))
                m.set(name, { sel: "", prop: val.copy(rp | sp) });

        for (const [name, val] of this.original_props)
            this.unique.set(name, val);

        this.rules = this.unique;

        this.setUniqueSelector();

        this.applyScratchRule();

        updateActiveSelections(this.system);
    }

    applyAndClear() {
        this.uploadChanges();
        this.removeScratchRule();
        this.removeUniqueSelector();
        this.unique.clear();
        this.changed.clear();
        this.original_props.clear();

    }

    setUniqueSelector() {

        if (!this.unique_selector && this.target_ref) {

            const component_name = this.target_ref.comp_name;

            //if at this point there is no suitable rule,
            //create a new ID, assign to ele and
            //use the id for the selector for the element.

            const seen = new Set();

            const elements: Element[]
                = getRuntimeComponentsFromName(component_name, this.system.page_wick)
                    .map(r => r.ele);

            for (const ele of elements) {

                if (seen.has(ele))
                    continue;

                seen.add(ele);

                if (tools.rules.doesElementMatch(ele, this.target_ref.rule)) {
                    this.affected_elements.push(ele);
                }

                for (const child of Array.from(ele.children))
                    elements.push(child);
            }

            this.unique_selector = "A" + ((Math.random() * 12565845322) + "").slice(0, 5);

            for (const ele of this.affected_elements)
                ele.classList.add(this.unique_selector);
        }
    }

    removeUniqueSelector() {

        if (this.unique_selector)
            for (const ele of this.affected_elements)
                ele.classList.remove(this.unique_selector);

        this.affected_elements.length = 0;

        this.unique_selector = null;

        this.removeScratchRule();
    }

    applyScratchRule() {

        if (!this.unique_selector) return;

        const rule_string =

            this.generateScratchRuleString(!this.COMPONENT_ELEMENT),

            index = this.removeScratchRule();

        this.scratch_rule_ref = this.system.scratch_stylesheet.rules[
            this.system.scratch_stylesheet.insertRule(
                rule_string,
                index
            )
        ];

    }

    private removeScratchRule() {

        let index = undefined;

        if (this.scratch_rule_ref) {

            index = Array.prototype.indexOf.call(
                this.system.scratch_stylesheet.rules,
                this.scratch_rule_ref
            );

            this.system.scratch_stylesheet.removeRule(index);

            this.scratch_rule_ref = null;
        }
        return index;
    }

    private generateScratchRuleString(USE_COMPONENT_CLASS: boolean = true): string {

        //Retrieve all components with that match the selector
        const props = [...this.unique.values()].map(e => e.prop);
        return `.${this.unique_selector} {\n  ${props.map(p => p.toString() + " !important").join(";\n  ")}\n}`;
    }

    uploadChanges() {
        if (this.changed.size > 0)
            this.load = this.__uploadChanges__();
    }

    private async __uploadChanges__() {

        this.changes.push(...this.generateClientCSSChanges());

        const response = await this.system.session.send_awaitable_command<
            EditorCommand.APPLY_COMPONENT_CHANGES,
            EditorCommand.OK
        >({
            command: EditorCommand.APPLY_COMPONENT_CHANGES,
            changes: this.changes
        });

        if (response.command != EditorCommand.OK) {
            return;
        }
        this.changes.length = 0;
    }

    private generateClientCSSChanges():
        Change[ChangeType.CSSRule][] {

        const { rule, path: location, comp_name, source_location } = this.target_ref;

        const patch: Change[ChangeType.CSSRule][] = [{
            type: ChangeType.CSSRule,
            component: comp_name,
            location: source_location.toString(),
            CSS_index: 0,
            new_selectors: rule.selectors.map(renderCompressed).join(","),
            old_selectors: rule.selectors.map(renderCompressed).join(","),
            old_rule_path: createRulePath(rule),
            new_rule_path: createRulePath(rule),
            new_properties: [...this.unique.values()]
                .filter(e => this.changed.has(e.prop.name))
                .map(e => ({ name: e.prop.name, val: e.prop.value_string }))
        }];

        return patch;
    }

    getPositionType(): CSSFlags {
        if ((this.box_model_flags & CSSFlags.POSITION_MASK) == 0)

            switch (this.getProp("position").value_string) {
                case "absolute": {
                    this.box_model_flags |= CSSFlags.ABSOLUTE;
                } break;
                case "static": {
                    this.box_model_flags |= CSSFlags.STATIC;
                } break;
                case "fixed": {
                    this.box_model_flags |= CSSFlags.FIXED;
                } break;
                case "sticky": {
                    this.box_model_flags |= CSSFlags.STATIC;
                } break;
                case "relative":
                default: {
                    this.box_model_flags |= CSSFlags.RELATIVE;
                }
            }
        return this.box_model_flags;
    }

    getDisplayType(): CSSFlags {
        if ((this.box_model_flags & CSSFlags.DISPLAY_MASK) == 0)
            switch (this.getProp("display").value_string) {
                case "block": {
                    this.box_model_flags |= CSSFlags.BLOCK;
                } break;
                case "inline-block": {
                    this.box_model_flags |= CSSFlags.INLINE_BLOCK;
                } break;
                case "static": {
                    this.box_model_flags |= CSSFlags.STATIC;
                } break;
                case "table": {
                    this.box_model_flags |= CSSFlags.TABLE;
                } break;
                case "inline":
                default: {
                    this.box_model_flags |= CSSFlags.INLINE;
                }
            }
        return this.box_model_flags;
    };

    isPropSet(prop_name: string): boolean {
        const prop = this.getProp(prop_name, false);
        return this.isValuePresent(prop ? prop.value_string : "");
    }

    isValuePresent(str: string): boolean {
        return !!str && str !== "auto" && str !== "unset" && str !== "inherit";
    }

    getHorizontalBoxFlag(): CSSFlags {
        this.getPositionType();
        this.getDisplayType();

        if ((this.box_model_flags & CSSFlags.HORIZONTAL_BOX_MASK) == 0) {
            //width
            if (this.isPropSet("width"))
                this.box_model_flags |= CSSFlags.WIDTH_VAL;

            if (this.isPropSet("left"))
                this.box_model_flags |= CSSFlags.LEFT_VAL;

            if (this.isPropSet("right"))
                this.box_model_flags |= CSSFlags.RIGHT_VAL;

            //Determine if border right has been set 
            //Check to see the precedence of the border right property
            // Border
            const
                left_border =
                    [
                        this.getProp("border", false),
                        this.getProp("border_left", false),
                        this.getProp("border_left_width", false)
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                right_border =
                    [
                        this.getProp("border", false),
                        this.getProp("border_right", false),
                        this.getProp("border_right_width", false)
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                left_margin =
                    [
                        this.getProp("margin", false),
                        this.getProp("margin_left", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                right_margin =
                    [
                        this.getProp("margin", false),
                        this.getProp("margin_right", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                left_padding =
                    [
                        this.getProp("padding", false),
                        this.getProp("padding_left", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                right_padding =
                    [
                        this.getProp("padding", false),
                        this.getProp("padding_right", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                multi_selection = [0, 1, 1, 3];


            let val = "";

            if (left_border) {
                switch (left_border.name) {
                    case "border":
                    case "border_left": val = left_border.val[0] + ""; break;
                    default: val = left_border.value_string;
                }

                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.BORDER_L_VAL;
            }

            if (right_border) {
                switch (right_border.name) {
                    case "border":
                    case "border_right": val = right_border.val[0] + ""; break;
                    default: val = right_border.value_string;
                }

                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.BORDER_R_VAL;
            }

            if (left_margin) {
                switch (left_margin.name) {
                    case "margin":
                        val = left_margin.val[multi_selection[left_margin.val.length]];
                    default: val = left_margin.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.MARGIN_L_VAL;
            }

            if (right_margin) {
                switch (right_margin.name) {
                    case "margin":
                        val = right_margin.val[multi_selection[right_margin.val.length]];
                    default: val = right_margin.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.MARGIN_R_VAL;
            }

            if (left_padding) {
                switch (left_padding.name) {
                    case "padding":
                        val = left_padding.val[multi_selection[left_padding.val.length]];
                    default: val = left_padding.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.PADDING_L_VAL;
            }

            if (right_padding) {
                switch (right_padding.name) {
                    case "padding":
                        val = right_padding.val[multi_selection[right_padding.val.length]];
                    default: val = right_padding.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.PADDING_R_VAL;
            }
        }
        return this.box_model_flags;
    }

    getVerticalBoxFlag(): CSSFlags {
        this.getPositionType();
        this.getDisplayType();

        if ((this.box_model_flags & CSSFlags.VERTICAL_BOX_MASK) == 0) {

            if (this.isPropSet("height"))
                this.box_model_flags |= CSSFlags.HEIGHT_VAL;

            if (this.isPropSet("top"))
                this.box_model_flags |= CSSFlags.TOP_VAL;

            if (this.isPropSet("bottom"))
                this.box_model_flags |= CSSFlags.BOTTOM_VAL;

            //Determine if border right has been set 
            //Check to see the precedence of the border right property
            // Border
            const
                top_border =
                    [
                        this.getProp("border", false),
                        this.getProp("border_top", false),
                        this.getProp("border_top_width", false)
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                bottom_border =
                    [
                        this.getProp("border", false),
                        this.getProp("border_bottom", false),
                        this.getProp("border_bottom_width", false)
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                top_margin =
                    [
                        this.getProp("margin", false),
                        this.getProp("margin_top", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                bottom_margin =
                    [
                        this.getProp("margin", false),
                        this.getProp("margin_bottom", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                top_padding =
                    [
                        this.getProp("padding", false),
                        this.getProp("padding_top", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                bottom_padding =
                    [
                        this.getProp("padding", false),
                        this.getProp("padding_bottom", false),
                    ].sort((a, b) => a ? b ? a.precedence > b.precedence ? -1 : 1 : -1 : 1)[0],
                multi_selection = [0, 1, 1, 3];


            let val = "";

            if (top_border) {
                switch (top_border.name) {
                    case "border":
                    case "border_top": val = top_border.val[0] + ""; break;
                    default: val = top_border.value_string;
                }

                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.BORDER_T_VAL;
            }

            if (bottom_border) {
                switch (bottom_border.name) {
                    case "border":
                    case "border_right": val = bottom_border.val[0] + ""; break;
                    default: val = bottom_border.value_string;
                }

                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.BORDER_B_VAL;
            }

            if (top_margin) {
                switch (top_margin.name) {
                    case "margin":
                        val = top_margin.val[multi_selection[top_margin.val.length]];
                    default: val = top_margin.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.MARGIN_T_VAL;
            }

            if (bottom_margin) {
                switch (bottom_margin.name) {
                    case "margin":
                        val = bottom_margin.val[multi_selection[bottom_margin.val.length]];
                    default: val = bottom_margin.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.MARGIN_B_VAL;
            }

            if (top_padding) {
                switch (top_padding.name) {
                    case "padding":
                        val = top_padding.val[multi_selection[top_padding.val.length]];
                    default: val = top_padding.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.PADDING_T_VAL;
            }

            if (bottom_padding) {
                switch (bottom_padding.name) {
                    case "padding":
                        val = bottom_padding.val[multi_selection[bottom_padding.val.length]];
                    default: val = bottom_padding.value_string;
                        break;
                }
                if (this.isValuePresent(val)) this.box_model_flags |= CSSFlags.PADDING_B_VAL;
            }
        }
        return this.box_model_flags;
    }

    //Need a way to keep check of changed properties.
    getProp(name: string, INCLUDE_COMPUTED: boolean = true): CSSProperty {

        // Check to see if the property is already queued in the
        // Prop cache, if it is not, then pull property information
        // from the computed property, parse, and place the new prop
        // into the cache. 

        let prop = null;

        if (this.unique.has(name))
            prop = this.unique.get(name).prop;
        else if (this.original_props.has(name))
            prop = this.original_props.get(name).prop;
        else if (this.element.style[CSSProperty.camelName(name)]) {

            const
                prop_value = this.element.style[CSSProperty.camelName(name)] + "",
                prop = parseProperty(name, prop_value, false);

            prop.precedence |= PrecedenceFlags.A_BIT_SET;

            this.original_props.set(name, { prop, sel: null, unique: false });

            return this.getProp(name);

        } else if (INCLUDE_COMPUTED) {


            const
                prop_value = this.computed[name] + "",
                prop = parseProperty(name, prop_value, false);

            this.original_props.set(name, { prop, sel: null, unique: false });

            return this.getProp(name);
        }

        return prop ? prop.copy() : prop;
    }

    setProp(prop: CSSProperty) {

        this.setUniqueSelector();

        const name = prop.name;

        if (name == "width")
            this.width.set(prop.val[0]);

        this.changed.add(name);

        if (!this.unique.has(name)) {
            this.unique.set(name, { prop, sel: this.unique_selector, unique: true });
        } else {
            this.unique.get(name).prop.setValue(prop);
        }
    }
    /**
     * Create an unset property and apply to the changed cache.
     * @param prop_name - name of property to unset
     * @param FORCE - If true, for unset even if the property is not defined within 
     * the current cascade. Defaults to false
     */
    unsetProp(prop_name: string, FORCE: boolean = false) {

        this.setUniqueSelector();

        if (this.original_props.has(prop_name) || FORCE) {
            this.changed.add(prop_name);
            this.unique.set(prop_name, {
                sel: this.unique_selector,
                prop: new CSSProperty(prop_name, "unset", [unset_string], true, <Lexer>unset_pos)
            });
        }
    }

    createProp(prop_string: string): CSSProperty {
        return property(prop_string);
    }

    setPropFromString(string: string) {

        for (const str of string.split(";"))
            if (str)
                this.setProp(this.createProp(str));
    }

}

export function updateLastOccurrenceOfRuleInStyleSheet(stylesheet: any, rule: CSSRuleNode) {

    const selector_string = renderCompressed(rule.selectors[0]);
    let matching_rule = getLastRuleWithMatchingSelector(stylesheet, rule.selectors[0]);

    if (!matching_rule) {
        matching_rule = copy(rule);
        stylesheet.nodes.push(matching_rule);
    } else {
        for (const [name, prop] of rule.props.entries()) {
            matching_rule.props.set(name, prop);
        }
    }
}

const cache_array: { e: HTMLElement, cache: CSSCache; }[] = [];

export function getCSSCache(
    sys: WorkspaceSystem,
    ele: HTMLElement
): CSSCache {

    let eligible: { e: HTMLElement, cache: CSSCache; } = null;

    for (const cache of cache_array) {

        const { e, cache: c } = cache;

        if (ele == e) return c;

        if (c.load) continue;

        else if (!eligible && !e) eligible = cache;
    }

    if (!eligible) {
        eligible = { e: ele, cache: new CSSCache(sys) };
        cache_array.push(eligible);
    }

    eligible.cache.init(sys, ele);

    return eligible.cache;
}

export function releaseCSSCache(cache: CSSCache) {

    cache_logger.debug(`Releasing css cache for ${cache.component} element:${cache.element.getAttribute("w:u")}`);

    cache.uploadChanges();
    cache.load.then(() => cache.destroy());

    for (const c of cache_array)
        if (c.cache == cache) {
            c.e = null;
            return;
        }
};
/**
 * Retrieve a list of Component names representing 
 * the ancestry of the givin component, starting with
 * the given component and ascending to the component's
 * oldest ancestor
 * @param sys 
 * @param name 
 * @returns 
 */
function getComponentHierarchyNames(
    sys: WorkspaceSystem,
    name: string
) {
    const components = getRuntimeComponentsFromName(name, sys.page_wick);
    const list = [{
        name,
        depth: 0
    }], seen = new Set();

    for (let comp of components) {

        let depth = 1;

        while (comp.par) {
            if (!seen.has(comp.par.name)) {
                list.push({
                    name: comp.par.name,
                    depth
                });
            }

            depth++;

            seen.add(comp.par.name);

            comp = comp.par;
        }

    }

    return list;
}