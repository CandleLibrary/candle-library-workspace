import URL from "@candlelib/uri";

export default class CSS_URL extends URL {
    static parse(l) {
        if (l.tx == "url" || l.tx == "uri") {
            l.next().a("(");
            let v = "";
            if (l.ty == l.types.str) {
                v = l.tx.slice(1, -1);
                l.next().a(")");
            } else {
                const p = l.peek();
                while (!p.END && p.next().tx !== ")") { /* NO OP */ }
                v = p.slice(l);
                l.sync().a(")");
            }
            return new CSS_URL(v);
        } if (l.ty == l.types.str) {
            let v = l.tx.slice(1, -1);
            l.next();
            return new CSS_URL(v);
        }

        return null;
    }

    toString() {
        return `url("${super.toString()}")`;
    }
}
