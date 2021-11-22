<!--[README][LABEL]:readme_header[INDEX]:1-->

Wax is a command-line-interface utility and rendering tool that can be used to perform several common
tasks encountered when building CLI applications with NodeJS or Deno[*](#Deno%20Support).  

### Current Features
- Parsing and objectifying input argument strings. 
- Extracting information and writing to the package.json file. 
- Rendering rich text UI's with HTML and CSS components using **wickurse**

### Deno Support

Though not yet implemented, the majority of Wax and its dependencies have been written in a way that would allow usage with Deno after some minor modification. The main task would be to setup a host for all CandleLibrary TypeScript files and update `import` statements to use absolute URLs for the respective library entry points. This has been, impart, accomplished with [cfw.Lantern](https://github.com/CandleLibrary/lantern) and it's build-in CandleLibrary dispatch, so evolving this mechanism to work with Deno should be a fairly trivial task. 