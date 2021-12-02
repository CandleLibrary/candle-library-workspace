import { Patch, PatchType } from "./patch";

export interface Transition {
    /**
     * The file path of the old component
     */
    old_location: string;

    /**
     * The file path of the new component
     * 
     * In most situation this will be identical
     * 
     * to `Transition.old_location`
     */
    new_location: string;

    /**
     * The ID of the component that we have 
     * transitioned away from 
     */
    old_id: string;

    /**
     * The ID of the component that we have 
     * transitioned to 
     */
    new_id: string;

    /**
     * Changes that have occurred between components.
     */
    changes: (Change[ChangeType])[];

    /**
     * The source string of the old component.
     */
    source?: string;

    patch?: Patch[PatchType];
}


export enum ChangeType {
    Attribute,
    CSSRule,
    General
}


export interface Change {

    [ChangeType.Attribute]: {

        type: ChangeType.Attribute,

        /**
         * The the name of the component that contains the element 
         * which is being changed
         */
        component: string,

        /**
         * The id of the element that received the change
         */
        ele_id: number;

        /**
         * The name of the attribute
         */
        name: string;

        /**
         * The index of the attribute if more than one attribute
         * of the same type was assigned to the element. 
         */
        attribute_index: number;

        /**
         * The previous value of the element. May be null if
         * the attribute did not exist within the old component.
         */
        old_value: string | null;

        /**
         * The previous value of the element. May be null if
         * the attribute does not exist on the new component.
         */
        new_value: string | null;
    };

    [ChangeType.CSSRule]: {
        type: ChangeType.CSSRule,

        /**
         * The name of the component that references the rule.
         */
        component: string;


        /**
         * The location of the source file that contains the CSS rule.
         * May be the same as the old_location if the CSS rule was defined
         * within a <style> tag within the component source file. 
         */
        location: string;

        /**
         * If the location is the same as the source file, then the
         * CSS_index is the index of the stylesheet within the the ComponentData.CSS 
         * array.
         */
        CSS_index?: number;

        /**
         * A semi-colon delimited series of @ rule descriptors and selectors
         * that leafs to the rule which received the modifications.
         * 
         * If `new_rule_path is different the `old_rule_path` then then either
         * the selectors for the rule have changed, the rule has been moved
         * to a new position, or both.
         * 
         * If `old_rule_path` is the same as `new_rule_path`, then the location
         * has not been changed. 
         * 
         * If `old_rule_path` is an empty string, then the rule has been
         * added to the new component. 
         * 
         */
        old_rule_path: string;

        /**
         * A semi-colon delimited series of @ rule descriptors and selectors
         * that leads to the rule which received the modifications.
         * 
         * If `new_rule_path is different the `old_rule_path` then then either
         * the selectors for the rule have changed, the rule has been moved
         * to a new position, or both.
         * 
         * If `new_rule_path` is the same as `old_rule_path`, then the location
         * has not been changed. 
         * 
         * If `new_rule_path` is an empty string, then the rule has been
         * removed from the new component. 
         */
        new_rule_path: string;

        new_selectors: string;
        old_selectors: string;

        /**
         * A list of original property values that were removed/modified
         */
        old_properties?: {
            /**
             * Name of the property
             */
            name: string,
            /**
             * Value of the property
             * 
             * If this is an empty string then the property
             * was removed.
             */
            val: string;
        }[];

        /**
         * A list of new property values that were added/modified
         */
        new_properties?: {
            /**
             * Name of the property
             */
            name: string,
            /**
             * Value of the property
             * 
             * If this is an empty string then the property
             * was removed.
             */
            val: string;
        }[];
    };

    /**
     * This change type is a general patch with additions
     * and deletions between the two component sources.
     * 
     * As long as you have a source string for either the 
     * old component or the new component you can generate 
     * its inverse.
     */
    [ChangeType.General]: {

        type: ChangeType.General,

        /**
         * The name of the component that references the rule.
         */
        component: string;

        /**
         * The location of the source file that the diffs apply to
         */
        location: string;


        /**
         * Additions and deletions needed to 
         * go from the old source to the new source. 
         * 
         * Inverting the commands allows a transition
         * from the new source to the old source.
         */
        changes: (DiffCommand[DiffType])[];
    };
}

export const enum DiffType {
    DELETE,
    ADD,
}

export interface DiffCommand {
    [DiffType.DELETE]: [DiffType.DELETE, number, number],
    [DiffType.ADD]: [DiffType.ADD, number, number],
}