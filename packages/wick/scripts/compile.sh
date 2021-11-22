NUMBER_OF_THREADS=$(nproc)

hctookit build parser\
    --threads $NUMBER_OF_THREADS\
    --o "./source/typescript/compiler/source-code-parse/"\
    "./source/grammars/wick.hcg"
