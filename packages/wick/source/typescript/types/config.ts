import URI from '@candlelib/uri';

/**
 * This function is used to map an input 
 * component to an output endpoint path.
 */
export interface EndpointMapper {
	/**
	 * Return value
	 * A fully qualified URI path
	 * to assign to this component
	 */
	(uri: URI, working_directory: URI): string;
};


export interface WickCompileConfig {

	/**
	 * A list of plugin names or paths to plugin 
	 * components that will be integrated within 
	 * the workspace environment.
	 */
	workspace_plugins?: string[],

	/**
	 * Allows the creation of component *endpoints*
	 * based on href data in anchor `<a>` tags. 
	 * 
	 * Defaults to `true`
	 * 
	 * see [link analysis]("./todo")
	 */
	RESOLVE_HREF_ENDPOINTS?: boolean,

	/**
	 * An object of properties that are made
	 * available to components through the `@global`
	 * synthetic module and resolved statically. 
	 */
	globals?: object;

	/**
	 * A function to map potential page component 
	 * entrypoints to resolved output endpoints.
	 */
	endpoint_mapper?: EndpointMapper;

	/**
	 * A filepath to the directory containing
	 * source files for Components and associated
	 * public and private files. 
	 * 
	 * Defaults to the CWD in which the active Wick
	 * process is running.
	 */
	source_dir?: string;

	/**
	 * A filepath to the directory in which Wick
	 * will place rendered endpoint pages and 
	 * associated public files after transformation.
	 */
	deploy_dir?: string;
	/**
	 * @hidden
	 * 
	 * Internal Use
	 */
	__config_root__: string;
}
