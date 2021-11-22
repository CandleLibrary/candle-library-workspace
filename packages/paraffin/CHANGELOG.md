## [v0.1.19] - 2021-11-17 

- [2021-10-18]

    Changed interface for command block callbacks. When defined, the Arguments interface can bused to specify the value of the trailing argument that will be used as the input to the command block function. Updated help messaging to indicate the arguments a command accepts as well as the value of the commands own trailing argument (e.g path string) if the command was configure with `REQUIRES_VALUE` set to true.

- [2021-10-17]

    Improve CLI help message formatting. Added color highlighting & implemented the display of accepted values and required arguments. Add column formatting to ensure command and argument descriptions fit within 80 columns.  Added detection for `root` command argument that will ensure Arguments defined with the `root` key and `root` path are assigned to the default command, and are executed if no sub-command argument is entered in the command line.

## [v0.1.16] - 2021-10-09 

- [2021-10-07]

    Added formatting to @candlelib/log loggers.

## [v0.1.0] - 2021-06-16 

- [2021-06-16]

    Modified the `cwd` parameter in getPackageJsonObject to accept both strings and @candlelib/uri URI objects.

- [2021-06-12]

    Changed process_args.hcg to use hcg3 syntax

- [2021-06-08]

    Added command path interface. This interface allows multiple sub command CLI arguments to be specified and enables automatic routing off sub-commands to appropriate handlers. Arguments can be attached to specific sub commands and allow handles to be used to ensure CLI arg data is available wherever it is needed.  It also provides, ATM rudimentary, documentation parameters to automatically generate help documentation when --help, -h, or -? is specified as a CLI argument.

- [2021-06-08] **breaking change** 

    Renamed the package from to @candlelib/parrafin

## [v0.0.6] 

- No changes recorded prior to this version.