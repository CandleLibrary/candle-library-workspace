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