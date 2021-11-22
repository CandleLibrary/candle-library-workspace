import URL from "@candlelib/uri";
import { Lexer } from "@candlelib/wind";
export enum WickComponentErrorCode {
    /**
    * This error occurs when an attempt to retrieve a network resource fails.
    */
    FAILED_TO_FETCH_RESOURCE,
    /**
     * This error occurs when parsing of a wick component fails due to incorrect syntax.
     */
    SYNTAX_ERROR_DURING_PARSE,
}
/**
 * Stores information about an error that has been encountered during compilation
 */
export interface WickComponentError {
    /**
     * Message about the error that was encountered
     */
    message: string;
    /**
     * Lexer object that points to location the error was encountered in the input.
     */
    pos?: Lexer;
    /**
     * URL of the resource that contains the error
     */
    URL?: URL;
    /**
     * Numeric code for the the type of error
     */
    ref: WickComponentErrorCode;

    /**
     * An error object if one was produced in a catch statement.
     */
    error_object?: Error;
}

/**
 * Stores error objects that are generated during component compilation
 */
export interface WickComponentErrorStore {
    errors: WickComponentError[];
}
