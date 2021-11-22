import { JSFunctionDeclaration, JSIdentifier, JSIdentifierBinding, JSIdentifierReference, JSMethod, JSNode } from "@candlelib/js";
import { ExtendedType } from "./hook";
import { BindingVariable } from "./binding";

/**
 * Information on the closure of function defined within 
 * a Wick component.
 */
export interface FunctionFrame {
    /**
     * true if the frame is created from
     * an anonymous binding expression
     * in an element attribute
     */
    ATTRIBUTE: boolean;
    /**
     * Indicates the fame's statements include 
     * an await expression.
     */
    IS_ASYNC: boolean;

    method_name: string;

    /**
     * An optional copy of the frame's ast object.
     */
    backup_ast?: JSNode;

    /**
     * Any binding variable that is referenced within the function.
     */
    declared_variables: Set<string>;

    /**
     * Identifiers that have no declaration and no presence in the
     * the global object and thus must be a binding identifier reference.
     */
    binding_ref_identifiers: ((JSIdentifierBinding & { type: ExtendedType; }) | (JSIdentifierReference & { type: ExtendedType; }))[];

    /**
     * Binding variable names that are read by the method.
     */
    input_names: Set<string>;

    /**
     * Binding variable names that are written to by the method.
     */
    output_names: Set<string>;

    /**
     * Extracted source AST for this function block
     */
    ast: JSMethod | JSFunctionDeclaration;

    prev?: FunctionFrame;

    /**
     * If this frame is the first one in the frame chain
     * then it is root.
     */
    IS_ROOT: boolean;

    IS_TEMP_CLOSURE: boolean;

    /**
     * A Map of binding variables
     */
    binding_variables?: Map<string, BindingVariable>;

    /**
     * Index of lookup location of the rendered component method
     */
    index?: number;
}
