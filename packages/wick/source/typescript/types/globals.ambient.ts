import wick from '../entry/wick-runtime';

/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
export { };

declare global {

    interface globalThis {
        wick: typeof wick;
    }
}