# Candle Library Workspace 

This meta repo contains all active Candle Library packages and is used to develop these 
packages.

## Usage

Clone this repo then run ```yarn install``` to install and link the packages and 
their dependencies. 

The script `./scripts/watch-build.sh` can be used to start a Typescript `tsc` process in watch mode for each 
of the packages. This script relies on `tmux` and thus a linux or OSX environment to run. 