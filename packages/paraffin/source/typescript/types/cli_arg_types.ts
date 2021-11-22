import { Output } from "./output";
export type Argument<T = any, Default = any> = {
    /**
     * The argument name for this config type.
     * if the key is the same value as the last
     * command patch name in addConfig, then this
     * object is used as the configuration settings for
     * that command.
     *
     * Otherwise this configuration
     * applies to an argument [`--<key>`] of the
     * command [`.. '::' .. '::' <command>`]
     *
     */
    key: string | number;

    /**
     * Allows the argument to capture any non-argument
     * tokens that follow it and assign them, after validation
     * and transformation, to a handle's `value` property.
     */
    REQUIRES_VALUE?: boolean;

    /**
     * A default value to set the arg to
     * if none is supplied by the user.
     */
    default?: Default;

    /**
     * An array of values which are acceptable
     * inputs for the argument. If the input argument
     * is not one of these values than an error will
     * be thrown.
     *
     * This is overridden by the validate function if present
     */
    accepted_values?: (T | any)[];

    /**
     * A function used to determine if the argument
     * if valid. If any string value other than the
     * empty string is provided, the argument
     * value is considered to be invalid, and the
     * returned string is used to provide an error
     * message to the user.
     */
    validate?: (arg: string) => string;

    /**
     * A friendly name to give the trailing argument
     * specifier (e.g `<help_arg_name>`) when rendering
     * help information. 
     * 
     * Defaults to `...`.
     */
    help_arg_name?: string;

    /**
     * A function that can be used to process
     * the argument value or generate a synthetic
     * value to be consumed downstream
     */
    transform?: (val: T | Default, args: Output<any>) => T | Promise<T>;

    /**
     * A simple help message that is displayed when
     * the --help, -h, or -? argument is specified.
     */
    help_brief?: string;
    /**
     * Internal USE
     */
    handles?: ArgumentHandle[];
    /**
     * Internal USE
     */
    path?: string;
};
export type CommandBlock<T, D = any> = Argument<any, D> & {
    path: string;
    name: string;
    help_brief: string;
    help_arg_name?: string;
    arguments: Map<string, Argument<any>>;
    sub_commands: Map<string, CommandBlock<any>>;
    handle?: ArgumentHandle<T, D>;
};
/**
 * A reference to a post-processed CLI argument
 * defined using the `addCLIConfig`.
 */
export type ArgumentHandle<T = string, D = any> = {
    /**
     * The computed value of the CLI argument
     */
    value: T | D;
    /**
     * The original argument object.
     */
    argument: Argument<T, D>;
    /**
     * An optional callback function that is called
     * after all arguments have been processed.
     *
     * This only occurs if the Argument that the
     * ArgumentHandle references is a root command
     */
    callback?: (val: T, args: Output<any>) => void;
};
