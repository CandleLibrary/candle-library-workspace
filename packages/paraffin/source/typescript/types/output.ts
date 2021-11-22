export type Output<T> = {
    [i in keyof T]?: { index: number; val: string | boolean; };
} &
{
    /**
     * All argument [key, val] pairs ordered first to last
     */
    __array__: [string, string][];
    /**
     * The trailing set of arguments without a value member
     */
    trailing_arguments: string[];
};
