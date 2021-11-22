
import { Lexer } from "@candlelib/wind";
import { PrecedenceFlags } from "../types/precedence_flags.js";
import { CSSNode } from "../types/node.js";
export class CSSProperty {

	parent: CSSNode;

	val: any;

	name: string;

	//rule: any;
	precedence: PrecedenceFlags;

	pos?: Lexer;
	/**
	 * True if the underlying property string was parsed without errors
	 */
	VALID: boolean;


	constructor(name, original_value, val, IMP, pos = new Lexer(original_value)) {
		this.val = val;
		this.name = name.replace(/\-/g, "_");
		//this.rule = null;
		this.precedence = +(!!IMP) << PrecedenceFlags.IMPORTANT_BIT_SHIFT;
		this.pos = pos;
		this.VALID = true;
	}
	destroy() {
		this.name = "";
		this.val = null;
		//this.rule = null;
		this.pos = null;
	}

	toString(offset = 0) {
		const off = ("    ").repeat(offset);
		if (!this.VALID) return `${off + this.name.replace(/\_/g, "-")}:unset`;
		return `${off + this.name.replace(/\_/g, "-")}:${this.value_string}${this.IMPORTANT ? " !important" : ""}`;
	}

	setValue(...values) {

		if (values[0] instanceof CSSProperty)
			return this.setValue(...values[0].val);

		let i = 0;

		for (const value of values) {
			const own_val = this.val[i];
			if (own_val && value instanceof own_val.constructor)
				this.val[i] = value;
			else
				this.val[i] = value;
			i++;
		}

		this.val.length = values.length;
	}

	get IMPORTANT(): boolean {
		return !!(this.precedence & PrecedenceFlags.IMPORTANT_BIT_MASK);
	}

	copyVal() {
		if (Array.isArray(this.val))
			return this.val.slice();
		else
			return this.val;
	}
	/**
	 * Copies the property and returns a new object. Optionally specify a precedence value to assign to
	 * the copy.
	 */
	copy(precedence: PrecedenceFlags = 0) {
		const copy = new CSSProperty(this.name, this.original_value, this.copyVal(), this.IMPORTANT, this.pos);
		copy.precedence |= precedence;
		return copy;
	}

	set(prop: CSSProperty) {
		if (prop.name == this.name)
			this.val = prop.val.slice();
	}
	get original_value() {
		return this.pos.slice();
	}

	get camelName(): string {
		return CSSProperty.camelName(this.name);
	}

	get css_type() {
		return "styleprop";
	}

	get value() {
		return this.val.length > 1 ? this.val : this.val[0];
	}

	get value_string() {
		if (!this.VALID) return "";
		return this.val.map(v => v.toString()).join(" ");
	}
	/**
	 * Converts underscore_identifiers and hyphen-identifiers to camelCaseIdentifiers
	 * @param str - A string to convert to camel case.
	 */
	static camelName(str: string): string {

		return str
			.replace(/\-/g, "_")
			.split("_")
			.map(
				(v, i) => i > 0 ? v[0].toUpperCase() + v.slice(1) : v
			)
			.join("");
	}
}
