import { ASTIterator, CombinedYielded, TraverserOutput } from "../types/node_iterator.js";
import { TraversedNode } from "../types/traversed_node.js";
import { bitFilterYielder, bit_filter } from "../yielders/bit_filter.js";
import { extract } from "../yielders/extract_root_node.js";
import { filter, FilterYielder } from "../yielders/filter.js";
import { FilterFunction, FilterFunctionYielder, filterWithFunction } from "../yielders/filterFunction.js";
import { impersonate as impersonate } from "../yielders/impersonate.js";
import { make_mutable, MutableYielder, mutate } from "../yielders/mutable.js";
import { make_replaceable, replace, ReplaceableYielder, ReplaceFunction, ReplaceTreeFunction } from "../yielders/replaceable.js";
import { make_skippable, SkippableYielder } from "../yielders/skippable.js";
import { skip_root } from "../yielders/skip_root.js";
import { Yielder } from "../yielders/yielder.js";
import { getChildAtIndex, getChildContainerLength } from "./child_container_functions.js";
import { MetaRoot } from "../types/meta_root";
export class Traverser<T, K extends keyof T, B> implements ASTIterator<T, K, B> {
    protected readonly key: K;
    protected readonly node: T;
    protected sp: number;
    protected BEGINNING: boolean;
    protected yielder: Yielder<TraversedNode<T>, K>;
    protected readonly meta: B & MetaRoot<T, K>;
    protected readonly max_depth: number;
    protected readonly val_length_stack: number[];
    protected readonly node_stack: T[];
    constructor(root: T, key: K, meta: B & MetaRoot<T, K>, max_depth: number) {
        this.key = key;
        this.node = root;
        this.sp = 0;
        this.BEGINNING = false;
        this.yielder = null;
        this.max_depth = max_depth;
        this.val_length_stack = [];
        this.node_stack = [];
        this.meta = meta;
    }
    [Symbol.iterator]() {
        this.meta.index = 0;
        this.meta.depth = 0;
        this.sp = 0;
        this.BEGINNING = true;
        return this;
    }
    next(): {
        done?: boolean;
        value: TraverserOutput<T, K, B>;
    } {
        const { BEGINNING, node, max_depth, node_stack, val_length_stack, key, yielder, meta } = this;

        // Prevent infinite loop from a cyclical graph;
        if (this.sp > 100000)
            throw new (class CyclicalError extends Error {
            })("Max node tree depth reached. The tree may actually be a cyclical graph.");

        if (BEGINNING) {

            this.BEGINNING = false;

            if (!this.yielder) this.yielder = new Yielder<TraversedNode<T>, K>();

            if (node) {
                //@ts-ignore
                this.node_stack[0] = this.node;
                this.val_length_stack[0] = getChildContainerLength(this.node, this.key) << 16;
                this.val_length_stack[1] = 0;
                this.sp = 0;

                meta.parent = null;

                const y = this.yielder.yield(node, this.sp, node_stack, val_length_stack, meta);

                if (y) return { value: { node: y, meta }, done: false };
            } else
                return { value: null, done: true };
        }

        while (this.sp >= 0) {

            const len = this.val_length_stack[this.sp], limit = (len & 0xFFFF0000) >> 16, index = (len & 0xFFFF);

            if (this.sp < max_depth && index < limit) {

                meta.parent = node_stack[this.sp];

                const child = getChildAtIndex(node_stack[this.sp], key, index);

                val_length_stack[this.sp]++;

                this.sp++;

                node_stack[this.sp] = child;

                const child_length = getChildContainerLength(child, key);

                val_length_stack[this.sp] = child_length << 16;

                if (child) {
                    meta.prev = getChildAtIndex(node_stack[this.sp - 1], key, index - 1);
                    meta.next = getChildAtIndex(node_stack[this.sp - 1], key, index + 1);
                    meta.index = index;
                    meta.depth = this.sp;

                    //@ts-ignore
                    const y = this.yielder.yield(child, this.sp, node_stack, val_length_stack, meta);

                    if (y)
                        return { value: { node: y, meta }, done: false };
                }
            } else
                this.sp--;
        }

        //@ts-ignore
        this.yielder.complete(node_stack[0], this.sp, node_stack, val_length_stack, meta);

        return { value: null, done: true };
    }
    then<U>(next_yielder: U): Traverser<T, K, CombinedYielded<U, B>> {

        //@ts-ignore
        next_yielder.modifyMeta(this.meta, this.val_length_stack, this.node_stack);

        if (typeof next_yielder == "function")
            next_yielder = next_yielder();

        if (!this.yielder)
            //@ts-ignore
            this.yielder = next_yielder;
        else
            //@ts-ignore
            this.yielder.then(next_yielder, this.key);

        //@ts-ignore
        next_yielder.key = this.key;

        return <Traverser<T, K, CombinedYielded<U, B>>><unknown>this;
    }
    /**
     * Run the traverser to completion as it is currently configured.
     * 
     * If a function is passed as the `fn` argument, an array of 
     * values returned by the `fn` function will be returned at the end of 
     * the run. Nullable values will be discarded.
     * 
     * @param fn - A function that is passed `node` and `meta` arguments and 
     * that may optional return a value.
     */
    run<A>(fn?: ((node: T, meta: B) => A) | boolean, RETURN_ROOT: boolean = false): A[] | T[] | T {

        if (typeof fn == "boolean" && fn && !RETURN_ROOT) {

            const output: T[] = [];

            for (const { node, meta } of this) output.push(node);

            return output;

        } else if (typeof fn == "function") {

            const output: A[] = [];

            for (const { node, meta } of this) {

                const val: A = fn(node, meta);

                if (typeof val == "undefined" || val === null)
                    continue;
                if (!RETURN_ROOT) output.push(val);
            }
            return RETURN_ROOT ? this.node_stack[0] : output;
        } else {
            for (const { } of this);
            return this.node_stack[0];
        }
    }

    /**
     * Allow another node to take the place of a node in the tree without
     * changing the structure of the tree
     * @param replace_function 
     */
    impersonate(replace_function: ReplaceFunction<T, K, B>): Traverser<T, K, B> {
        return this.then(impersonate<T, K, B>(<any>replace_function));
    }
    makeReplaceable(replace_function?: ReplaceTreeFunction<T>): Traverser<T, K, CombinedYielded<ReplaceableYielder<T, K>, B>> {
        return this.then(make_replaceable<T, K>(replace_function));
    }
    replace(replace_function: ReplaceFunction<T, K, B>, replace_tree_function?: ReplaceTreeFunction<T>): Traverser<T, K, B> {
        return this.then(replace<T, K, B>(replace_function, replace_tree_function));
    }

    makeMutable(mutate_tree_function?: ReplaceTreeFunction<T>): Traverser<T, K, CombinedYielded<MutableYielder<T, K>, B>> {
        return this.then(make_mutable<T, K>(mutate_tree_function));
    }

    mutate(mutate_function: ReplaceFunction<T, K, B>, mutate_tree_function?: ReplaceTreeFunction<T>): Traverser<T, K, B> {
        return this.then(mutate<T, K, B>(mutate_function, mutate_tree_function));
    }

    bitFilter<A extends keyof T>(key: A, ...bits: number[]): Traverser<T, K, CombinedYielded<bitFilterYielder<T, K>, B>> {
        return this.then(bit_filter<T, K, A>(key, ...bits));
    }

    filter<A extends keyof T>(key: A, ...filter_condition: any[]): Traverser<T, K, CombinedYielded<FilterYielder<T, K>, B>> {
        return this.then(filter<T, K, A>(key, ...filter_condition));
    }

    makeSkippable(): Traverser<T, K, CombinedYielded<SkippableYielder<T, K>, B>> {
        return this.then(make_skippable<T, K>());
    }

    filterFunction<R extends T>(fn: FilterFunction<T, K, R, B>): Traverser<T, K, CombinedYielded<FilterFunctionYielder<T, K, R, B>, B>> {
        return this.then(filterWithFunction<T, K, R, B>(fn));
    }

    extract(receiver: { ast: any; }): Traverser<T, K, B> {
        return this.then(extract(receiver));
    }

    skipRoot(): Traverser<T, K, B> {
        return this.then(skip_root<T, K>());
    }
};
