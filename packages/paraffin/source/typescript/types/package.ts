/**[API;README]:api
 * Main files of the repository
 */
export type PackageJSONData = {
    version: string;
    name: string;
    main: string;
    type: "module" | "commonjs";
    types: string;
    description: string;
    dependencies: any;
    devDependencies: any;
    homepage: string;
    license: string;
    bin: any;
    scripts: any;
    [key: string]: any;
};
