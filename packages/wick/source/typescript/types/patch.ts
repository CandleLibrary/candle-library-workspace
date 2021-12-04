export const enum PatchType {
    /**
     * The patch affects the hash name only
     *
     * examples:
     * - Imported module path gets changed
     * -
     *
     * This patch can be issued as a hash name change.
     *
     * This WILL change the component's hash
     */
    STUB,

    /**
     * The style in an external style sheet is changed.
     *
     * This patch can be issued as a set of style updates.
     *
     * This may or may not change the component's hash
     */
    CSS,

    /**
     * A text section defined within the component source file is changed.
     *
     * This patch can be issued as a set of text element changes
     *
     * This WILL change the component's hash
     */
    TEXT,

    /**
     * An element defined within the component source file is changed.
     *
     * This patch is issued as a complete re-render.
     *
     * This WILL change the component's hash
     */
    //ELEMENT,
    /**
     * A binding or any JS code is changed within the source file.
     *
     * This patch is issued as a complete re-render.
     *
     * This WILL change the component's hash
     */
    REPLACE,

    /**
     * Apply an attribute change to an element
     */
    Attribute
}
interface BasePatch {
    type: PatchType;
    /**
     * The hash name string of the two component
     */
    to: string;
    from: string;
}
export interface Patch {

    [PatchType.Attribute]: BasePatch & {
        type: PatchType.Attribute;
        name: string;
        value: string;
    };

    [PatchType.REPLACE]: BasePatch & {
        type: PatchType.REPLACE;
        patch_scripts: string[];
    };

    [PatchType.TEXT]: BasePatch & {
        type: PatchType.TEXT;
        patches: {
            index: number;
            from: string;
            to: string;
        }[];
    };

    [PatchType.STUB]: BasePatch & {
        type: PatchType.STUB;
    };

    [PatchType.CSS]: BasePatch & {
        type: PatchType.CSS;
        //The new style to apply to this component
        style: string;
    };
}
