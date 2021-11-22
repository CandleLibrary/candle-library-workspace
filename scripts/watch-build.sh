#! /usr/bin/bash

# A small script to start a seperate TypeScript build process for 
# each of the TypeScript packages within this repo. Utilizes Linux,
# BASH, & Tmux to run each tsc process in a seperate shell. 


declare -A ts_packages

ts_packages[css]=/packages/css
ts_packages[cure]=/packages/cure
ts_packages[dev-tools]=/packages/dev-tools
ts_packages[glow]=/packages/glow
ts_packages[html]=/packages/html
ts_packages[js]=/packages/js
ts_packages[lantern]=/packages/lantern
ts_packages[log]=/packages/log
ts_packages[paraffin]=/packages/paraffin
ts_packages[spark]=/packages/spark
ts_packages[uri]=/packages/uri
ts_packages[wick]=/packages/wick
ts_packages[wind]=/packages/wind

LOC=$(dirname "$(realpath $0)")/../

echo $LOC

tmux new-session -t HC_ROOT_BUILD -d 
tmux select-layout -t HC_ROOT_BUILD tiled
tmux set -t HC_ROOT_BUILD -g mouse on

for key in "${!ts_packages[@]}"; do
  tmux new-window -t HC_ROOT_BUILD -n $key "tsc --watch  -p $LOC/${ts_packages[$key]}/tsconfig.json"
done
