## [v0.18.0] - 2021-12-07 

- [2021-12-07]

    Added initial workspace plugin system (experimental), and added workspace toggle button.

- [2021-12-07]

    Implemented a class attribute feature that leverages the secondary expression syntax to dynamically toggle class tokens based on the boolean value of the primary expression.  example:  ```jsx  <div class="normal-class-name" class={ !!truthy ; "dynamic-class-name" } <!-- new feature --> class={ !!falsy ; "dynamic-class-name" } > ...  ```  This can be stacked by reusing the class attribute in the same element for different sets of class tokens.

- [2021-12-05]

    Added `col` & `columns` attributes as an alias of `shift` attribute on container elements. These aliases are a better representation of the use of this attribute.

- [2021-12-05]

    Added purge method to runtime container. (For use with workspace dev environment)

- [2021-12-05]

    Enable loading of import .ts modules in tests

## [v0.17.0] - 2021-12-04 

- [2021-11-26]

    Improved behavior of on* attributes when referencing function names defined within a components scope. This should work as expected and bind that function as a listener to events issued by that element.

- [2021-11-25]

    Added `on_out` and `on_in` as additional name targets for component transition functions.

- [2021-11-24]

    Added resolution for import paths to components that omit the file extension.  Wick will attempt to resolve a path like `./path/to/component` to one of the following: `./path/to/component.md` `./path/to/component.wick` `./path/to/component/index.md` `./path/to/component/index.wick`  If a path cannot be resolved like above, then an error will be thrown.

- [2021-11-24]

    Added a way to access a template components array data from another component by importing the default object of the template component component. This object is a an array of all data that was generated within the template component template initialization method.

## [v0.15.17] - 2021-10-09 

- [2021-10-08] **breaking change** 

    Added RenderPageOptions type interface and options argument to RenderPage and to improve control over the output of generated HTML pages.

- [2021-10-05] **breaking change** 

    Renamed Presets to Context. This name better reflects this object's purpose.

## [v0.15.9] - 2021-06-28 

- [2021-06-21]

    Corrected the handling of global binding variables. Now, globals that can be accessed in the Server environment will contribute to prefilled elements, and globals are not assigned to update slots on runtime containers.

## [v0.15.4] - 2021-06-19 

- [2021-06-19]

    Fixed issue where references to function parameters where being registered as binding variables.

## [v0.15.0] - 2021-06-16 

- [2021-06-08]

    Changed dependency @candlelib/wax to @candlelib/paraffin

## [v0.14.0] 

- No changes recorded prior to this version.