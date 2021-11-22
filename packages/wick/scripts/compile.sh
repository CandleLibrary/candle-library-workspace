NUMBER_OF_THREADS=$(nproc)

hydrocarbon compile\
    --threads 12\
    --out_path "./source/typescript/compiler/source-code-parse/wick_parser.ts"\
    --type "ts"\
    --recognizer "wasm"\
    "./source/grammars/wick.hcg"

cp \
    ./source/typescript/compiler/source-code-parse/*.wasm\
    ./build/compiler/source-code-parse/