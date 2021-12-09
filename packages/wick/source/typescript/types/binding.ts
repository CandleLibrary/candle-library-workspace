import { Lexer } from "@candlelib/wind";
import { JSNode } from "@candlelib/js";
import URI from "@candlelib/uri";

export enum BINDING_VARIABLE_TYPE {
    UNDECLARED = 0,


    /**
     * Indirect variables that require one level
     * of indirection.
     */
    INTERNAL_VARIABLE = 1,
    /**
     * Any Attribute value assigned to the component's 
     * HTML element from within an outer scoped component 
     */
    ATTRIBUTE_VARIABLE = 2,
    MODEL_VARIABLE = 4,
    MODEL_DIRECT = 512,
    TEMPLATE_CONSTANT = 1024,
    TEMPLATE_INITIALIZER = 2048,

    TEMPLATE_DATA = 8192,

    CURE_TEST = 4096,
    CONFIG_GLOBAL = 8192,


    /**
     * A Global variable that should be wrapped into a an
     * observerable 
     */
    GLOBAL_VARIABLE = 8,

    /**
     * Static variable that could replaced directly with 
     * its assigned value
     */

    METHOD_VARIABLE = 16,
    CONST_INTERNAL_VARIABLE = 32,
    MODULE_MEMBER_VARIABLE = 64,
    MODULE_VARIABLE = 128,
    MODULE_NAMESPACE_VARIABLE = 256,

    CONSTANT_DATA_SOURCE = 16384,
    DYNAMIC_DATA_SOURCE = 32768,

    STORE_VARIABLE = 65536,

    /**
     * Variables that are replaced with direct
     * property access on the associated object
     * 
     * This variables are:
     * METHOD_VARIABLE
     * MODULE_MEMBER_VARIABLE
     * MODULE_VARIABLE
     */
    DIRECT_ACCESS = 16 | 64 | 128,
}

export const enum FLAG_ID_OFFSET {
    VALUE = 22,

    MASK = 0x3FFFFF
}

/**
 * These flags govern how data can move
 * through the boundaries of a component
 */
export const enum BINDING_FLAG {

    DEFAULT_BINDING_STATE = 1,
    FROM_PARENT = 2,

    FROM_PRESETS = 4,

    FROM_OUTSIDE = 8,

    ALLOW_EXPORT_TO_PARENT = 16,

    ALLOW_UPDATE_FROM_CHILD = 32,

    ALLOW_UPDATE_FROM_MODEL = 64,

    WRITTEN = 128
}

export const enum STATIC_BINDING_STATE {
    UNCHECKED = 0,
    TRUE = 1,
    FALSE = 2,
    STATIC_CONSTANT = 4,
    STATIC_RUNTIME = 8,
}

export const enum STATIC_RESOLUTION_TYPE {
    UNDEFINED = 0,
    CONSTANT_STATIC = 1,
    WITH_MODEL = 2,
    WITH_MODULE = 4,
    WITH_PARENT = 8,
    WITH_GLOBAL = 16,
    WITH_VARIABLE = 32,
    WITH_TEMPLATE = 64,
    STATIC_WITH_PARENT = STATIC_RESOLUTION_TYPE.CONSTANT_STATIC | STATIC_RESOLUTION_TYPE.WITH_PARENT,
    STATIC_WITH_MODULE = STATIC_RESOLUTION_TYPE.CONSTANT_STATIC | STATIC_RESOLUTION_TYPE.WITH_MODULE,
    STATIC_WITH_MODEL = STATIC_RESOLUTION_TYPE.CONSTANT_STATIC | STATIC_RESOLUTION_TYPE.WITH_MODEL,
    STATIC_WITH_GLOBAL = STATIC_RESOLUTION_TYPE.CONSTANT_STATIC | STATIC_RESOLUTION_TYPE.WITH_GLOBAL,
    STATIC_WITH_VARIABLE = STATIC_RESOLUTION_TYPE.CONSTANT_STATIC | STATIC_RESOLUTION_TYPE.WITH_VARIABLE,
    INVALID = 0xFF
}



/**
 * A variable within the component that can be 
 * dynamically bound to inputs or outputs
 * 
 * These variables can be declared through import
 * statements, internal var, let, or const assignments,
 * or automatically through any reference to a variable
 * that is undeclared and not a global variable name.
 */
export interface BindingVariable {
    /**  
     * Name used for references within the component
     */
    internal_name: string;

    /**
     * Actual name of the imported resource, typically the name
     * of a model property, a named export variable from a module, or
     * a template property name 
     */
    external_name: string;

    /** 
     * Type of reference 
     */
    type: BINDING_VARIABLE_TYPE;

    /* */
    class_index: number;
    flags: BINDING_FLAG;
    pos: any | Lexer;
    default_val: JSNode | null;
    STATIC_STATE: STATIC_BINDING_STATE;
    static_resolution_type: STATIC_RESOLUTION_TYPE;
    /**
     * Number of references made to this variable within the component
     */
    ref_count: number;

    source_location?: URI;

    module_name?: string;
}