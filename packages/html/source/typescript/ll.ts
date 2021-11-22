
/**
 * To be extended by objects needing linked list methods.
 */
export const LinkedList = {

    props: {
        /**
         * Properties for horizontal graph traversal
         * @property {object}
         */
        defaults: {
            /**
             * Next sibling node
             * @property {object | null}
             */
            nxt: null,

            /**
             * Previous sibling node
             * @property {object | null}
             */
            prv: null
        },

        /**
         * Properties for vertical graph traversal
         * @property {object}
         */
        children: {
            /**
             * Number of children nodes.
             * @property {number}
             */
            noc: 0,
            /**
             * First child node
             * @property {object | null}
             */
            fch: null,
        },
        parent: {
            /**
             * Parent node
             * @property {object | null}
             */
            par: null
        }
    },

    methods: {
        /**
         * Default methods for Horizontal traversal
         */
        defaults: {

            insertBefore: function (node) {

                if (!this.nxt && !this.prv) {
                    this.nxt = this;
                    this.prv = this;
                }

                if (node) {
                    if (node.prv)
                        node.prv.nxt = node.nxt;

                    if (node.nxt)
                        node.nxt.prv = node.prv;

                    node.prv = this.prv;
                    node.nxt = this;
                    this.prv.nxt = node;
                    this.prv = node;
                } else {
                    if (this.prv)
                        this.prv.nxt = node;
                    this.prv = node;
                }
            },

            insertAfter: function (node) {

                if (!this.nxt && !this.prv) {
                    this.nxt = this;
                    this.prv = this;
                }

                if (node) {
                    if (node.prv)
                        node.prv.nxt = node.nxt;

                    if (node.nxt)
                        node.nxt.prv = node.prv;

                    node.nxt = this.nxt;
                    node.prv = this;
                    this.nxt.prv = node;
                    this.nxt = node;
                } else {
                    if (this.nxt)
                        this.nxt.prv = node;
                    this.nxt = node;
                }
            }
        },
        /**
         * Methods for both horizontal and vertical traversal.
         */
        parent_child: {
            /**
             *  Returns eve. 
             * @return     {<type>}  { description_of_the_return_value }
             */
            root() {
                return this.eve();
            },
            /**
             * Returns the root node. 
             * @return     {Object}  return the very first node in the linked list graph.
             */
            eve() {
                if (this.par)
                    return this.par.eve();
                return this;
            },

            traverse: function* () {
                yield this;
                for (const child of this.children)
                    yield* child.traverse();
            },

            push(node) {
                this.addChild(node);
            },

            unshift(node) {
                this.addChild(node, (this.fch) ? this.fch.pre : null);
            },

            replace(old_node, new_node) {
                if (old_node.par == this && old_node !== new_node) {
                    if (new_node.par) new_node.par.remove(new_node);

                    if (this.fch == old_node) this.fch = new_node;
                    new_node.par = this;


                    if (old_node.nxt == old_node) {
                        new_node.nxt = new_node;
                        new_node.prv = new_node;
                    } else {
                        new_node.prv = old_node.prv;
                        new_node.nxt = old_node.nxt;
                        old_node.nxt.prv = new_node;
                        old_node.prv.nxt = new_node;
                    }

                    old_node.par = null;
                    old_node.prv = null;
                    old_node.nxt = null;
                }
            },

            insertBefore: function (node) {
                if (this.par)
                    this.par.addChild(node, this.pre);
                else
                    LinkedList.methods.defaults.insertBefore.call(this, node);
            },

            insertAfter: function (node) {
                if (this.par)
                    this.par.addChild(node, this);
                else
                    LinkedList.methods.defaults.insertAfter.call(this, node);
            },

            addChild: function (child = null, prev = null) {

                if (!child) return;

                if (child.par)
                    child.par.removeChild(child);

                if (prev && prev.par && prev.par == this) {
                    if (child == prev) return;
                    child.prv = prev;
                    prev.nxt.prv = child;
                    child.nxt = prev.nxt;
                    prev.nxt = child;
                } else if (this.fch) {
                    child.prv = this.fch.prv;
                    this.fch.prv.nxt = child;
                    child.nxt = this.fch;
                    this.fch.prv = child;
                } else {
                    this.fch = child;
                    child.nxt = child;
                    child.prv = child;
                }

                child.par = this;
                this.noc++;
            },

            /**
             * Analogue to HTMLElement.removeChild()
             *
             * @param      {HTMLNode}  child   The child
             */
            removeChild: function (child) {
                if (child.par && child.par == this) {
                    child.prv.nxt = child.nxt;
                    child.nxt.prv = child.prv;

                    if (child.prv == child || child.nxt == child) {
                        if (this.fch == child)
                            this.fch = null;
                    } else if (this.fch == child)
                        this.fch = child.nxt;

                    child.prv = null;
                    child.nxt = null;
                    child.par = null;
                    this.noc--;
                }
            },

            /**
             * Gets the next node. 
             *
             * @param      {HTMLNode}  node    The node to get the sibling of.
             * @return {HTMLNode | TextNode | undefined}
             */
            getNextChild: function (node = this.fch) {
                if (node && node.nxt != this.fch && this.fch)
                    return node.nxt;
                return null;
            },

            /**
             * Gets the child at index.
             *
             * @param      {number}  index   The index
             */
            getChildAtIndex: function (index, node = this.fch) {
                if (node.par !== this)
                    node = this.fch;

                let first = node;
                let i = 0;
                while (node && node != first) {
                    if (i++ == index)
                        return node;
                    node = node.nxt;
                }

                return null;
            },
        }
    },

    gettersAndSetters: {
        peer: {
            next: {
                enumerable: true,
                configurable: true,
                get: function () {
                    return this.nxt;
                },
                set: function (n) {
                    this.insertAfter(n);
                }
            },
            previous: {
                enumerable: true,
                configurable: true,
                get: function () {
                    return this.prv;
                },
                set: function (n) {
                    this.insertBefore(n);
                }
            }
        },
        tree: {
            parent: {
                enumerable: true,
                configurable: true,
                /**
                 * @return parent node
                 */
                get: function () {
                    return this.par;
                },
                set: function (p) {
                    if (p && p.addChild)
                        p.addChild(this);
                    else if (p === null && this.par)
                        this.par.removeChild(this);
                }
            }
        }
    },


    mixin: (constructor) => {
        const proto = (typeof (constructor) == "function") ? constructor.prototype : (typeof (constructor) == "object") ? constructor : null;
        if (proto) {
            Object.assign(proto,
                LinkedList.props.defaults,
                LinkedList.methods.defaults
            );
        }
        Object.defineProperties(proto, LinkedList.gettersAndSetters.peer);
    },

    mixinTree: (constructor) => {
        const proto = (typeof (constructor) == "function") ? constructor.prototype : (typeof (constructor) == "object") ? constructor : null;
        if (proto) {
            Object.assign(proto,
                LinkedList.props.defaults,
                LinkedList.props.children,
                LinkedList.props.parent,
                LinkedList.methods.defaults,
                LinkedList.methods.parent_child
            );
            Object.defineProperties(proto, LinkedList.gettersAndSetters.tree);
            Object.defineProperties(proto, LinkedList.gettersAndSetters.peer);
        }
    }
};

export default LinkedList;