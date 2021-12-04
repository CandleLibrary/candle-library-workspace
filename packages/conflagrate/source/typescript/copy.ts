import { Lexer } from "@candlelib/wind";
import { Token } from '@candlelib/hydrocarbon';
/**
 * Copies compatible node tree.
 * @param node - Any node in an acyclic AST tree compatible with conflagrate
 * @returns A deep copy of the node.
 */
export function copy<T>(node: T, cache: Map<any, any> = new Map): T {
    if (!node) return null;

    let clone = node;

    if (typeof node == "object") {

        if (cache.has(node))
            return cache.get(node);


        if (Array.isArray(node)) {
            const array: any[] = [];

            cache.set(node, array);

            for (const ele of node)
                array.push(copy<any>(ele, cache));

            return <T><unknown>array;
        }

        clone = Object.assign({}, node);

        cache.set(node, clone);

        Object.setPrototypeOf(clone, Object.getPrototypeOf(node));

        for (const name in clone) {

            let val = clone[name];

            if (typeof val == "object") {
                if (val instanceof Token)
                    (<Token><unknown>clone[name]) = val;
                else if (val instanceof Lexer)
                    (<Lexer><unknown>clone[name]) = val.copy();
                else if (Array.isArray(val))
                    (<Array<T>><unknown>clone[name]) = val.map(d => copy(d, cache));
                else if (val !== null) {
                    (<unknown>clone[name]) = copy(val, cache);
                }
            }
        }
    }

    return clone;
}