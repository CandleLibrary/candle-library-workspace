let ENV = 0;
export const enum Environment {

    WICK = 4,
    RADIATE = 1,

    WORKSPACE = 2
}

/**
 * Asserts whether the givin Environment flag is set
 * @param wick 
 */
export function envIs(env: Environment) {
    return (ENV & env) == env;
}

export function setEnv(env: Environment) {
    ENV |= env;
}