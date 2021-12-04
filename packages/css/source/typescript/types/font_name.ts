import { Lexer } from '@candlelib/wind';
import CSS_String from "./string.js";

export default class CSS_FontName extends String {
	static parse(l: Lexer) {

		if (l.ty == l.types.str) {
			let tx = l.tx;
			l.next();
			return new CSS_String(tx);
		}

		if (l.ty == l.types.id) {

			let pk = l.peek();

			while (pk.type == l.types.id && !pk.END) {
				pk.next();
			}

			let str = pk.slice(l);

			l.sync();

			return new CSS_String(str);
		}

		return null;
	}
}
