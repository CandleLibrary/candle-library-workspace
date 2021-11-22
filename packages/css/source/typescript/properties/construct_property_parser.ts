import wind, { Lexer } from "@candlelib/wind";
import { JUX, AND, OR, ONE_OF } from "./productions.js";
import { LiteralTerm, ValueTerm, SymbolTerm, FunctionTerm } from "./terms.js";
import { virtual_property_definitions } from "./property_and_type_definitions.js";
//import util from "util"
const standard_productions = {
    JUX,
    AND,
    OR,
    ONE_OF,
    LiteralTerm,
    ValueTerm,
    SymbolTerm,
    FunctionTerm
};

function getExtendedIdentifier(l) {
    const IWS = l.IWS;

    l.IWS = false;

    let pk = l.pk;

    let id = "";

    while (
        !pk.END &&
        pk.ty != pk.types.ws &&
        (
            pk.ty & (wind.types.id | wind.types.num)
            || pk.tx == "-"
            || pk.tx == "_"
        )
    ) pk.next();

    id = pk.slice(l).trim();

    l.sync();

    l.tl = 0;

    l.IWS = IWS;

    return id;
}

export function getPropertyParser(property_name, IS_VIRTUAL = { is: false }, definitions = null, productions = standard_productions) {

    let parser_val = definitions[property_name];

    if (parser_val) {

        if (typeof (parser_val) == "string")
            parser_val = definitions[property_name] = ConstructPropertyParser(parser_val, property_name, definitions, productions);

        if (parser_val)
            parser_val.name = property_name;

        return parser_val;
    }

    if (!definitions.__virtual)
        definitions.__virtual = Object.assign({}, virtual_property_definitions);

    parser_val = definitions.__virtual[property_name];

    if (parser_val) {

        IS_VIRTUAL.is = true;

        if (typeof (parser_val) == "string") {
            parser_val = definitions.__virtual[property_name] = ConstructPropertyParser(parser_val, "", definitions, productions);

            if (parser_val) {
                parser_val.name = property_name;
            }
        }

        return parser_val;
    }

    return null;
}


function ConstructPropertyParser(notation, name, definitions, productions) {

    const lex = wind(notation);
    lex.USE_EXTENDED_ID = true;
    lex.tl = 0;
    lex.next();

    let n = define(lex, definitions, productions);

    return n;
}

function define(
    l: Lexer,
    definitions,
    productions,
    super_term = false,
    oneof_group = false,
    or_group = false,
    and_group = false,
    important = null
) {
    let term, nt, v;

    const { JUX, AND, OR, ONE_OF, LiteralTerm, ValueTerm, SymbolTerm, FunctionTerm } = productions;

    while (!l.END) {

        switch (l.ch) {
            case "]":
                return term;

            case "[":

                v = define(l.next(), definitions, productions, true);

                l.assert("]");

                v = checkForExtensions(l, v, productions);

                if (term) {
                    if (term instanceof JUX && term.isRepeating())
                        term = foldIntoProduction(productions, new JUX, term);
                    term = foldIntoProduction(productions, term, v);
                } else
                    term = v;
                break;

            case "<":

                let id = getExtendedIdentifier(l.next());

                v = new ValueTerm(id, getPropertyParser, definitions, productions);

                l.next().assert(">");

                v = checkForExtensions(l, v, productions);

                if (term) {

                    if (term instanceof JUX /*&& term.isRepeating()*/)
                        term = foldIntoProduction(productions, new JUX, term);

                    term = foldIntoProduction(productions, term, v);
                } else {
                    term = v;
                }
                break;

            case "&":

                if (l.pk.ch == "&") {

                    if (and_group)
                        return term;

                    nt = new AND();

                    if (!term) throw new Error("missing term!");

                    nt.terms.push(term);

                    l.sync().next();

                    while (!l.END) {
                        nt.terms.push(define(l, definitions, productions, super_term, oneof_group, or_group, true, important));
                        if (l.ch !== "&" || l.pk.ch !== "&") break;
                        l.a("&").a("&");
                    }

                    return nt;
                }
                break;

            case "|":

                {
                    if (l.pk.ch == "|") {

                        if (or_group || and_group)
                            return term;

                        nt = new OR();

                        nt.terms.push(term);

                        l.sync().next();

                        while (!l.END) {
                            nt.terms.push(define(l, definitions, productions, super_term, oneof_group, true, and_group, important));
                            if (l.ch !== "|" || l.pk.ch !== "|") break;
                            l.a("|").a("|");
                        }

                        return nt;

                    } else {

                        if (oneof_group || or_group || and_group)
                            return term;

                        nt = new ONE_OF();

                        nt.terms.push(term);

                        l.next();

                        while (!l.END) {
                            nt.terms.push(define(l, definitions, productions, super_term, true, or_group, and_group, important));
                            if (l.ch !== "|") break;
                            l.a("|");
                        }

                        return nt;
                    }
                }

            default:

                if (l.pk.ch == "(") {
                    v = new FunctionTerm(l, (lex) => define(lex, definitions, productions));
                } else
                    v = (l.ty == l.types.symbol) ? new SymbolTerm(l) : new LiteralTerm(l);

                l.next();

                v = checkForExtensions(l, v, productions);

                if (term) {
                    if (term instanceof JUX /*&& (term.isRepeating() || term instanceof ONE_OF)*/) term = foldIntoProduction(productions, new JUX, term);
                    term = foldIntoProduction(productions, term, v);
                } else {
                    term = v;
                }
        }
    }

    return term;
}

function checkForExtensions(l, term, productions) {

    outer: while (true) {

        switch (l.ch) {

            case "{":
                term = foldIntoProduction(productions, term);
                term.r[0] = parseInt(l.next().tx);
                if (l.next().ch == ",") {
                    l.next();
                    if (l.pk.ch == "}") {

                        term.r[1] = parseInt(l.tx);
                        l.next();
                    } else {
                        term.r[1] = Infinity;
                    }
                } else
                    term.r[1] = term.r[0];
                l.a("}");
                break;

            case "*":
                term = foldIntoProduction(productions, term);
                term.r[0] = 0;
                term.r[1] = Infinity;
                l.next();
                break;

            case "+":
                term = foldIntoProduction(productions, term);
                term.r[0] = 1;
                term.r[1] = Infinity;
                l.next();
                break;

            case "?":
                term = foldIntoProduction(productions, term);
                term.r[0] = 0;
                term.r[1] = 1;
                l.next();
                break;

            case "#":
                let nr = new productions.JUX();
                nr.terms.push(term);
                term = nr;
                term.r[0] = 1;
                term.r[1] = Infinity;
                term.REQUIRE_COMMA = true;
                l.next();
                if (l.ch == "{") {
                    term.r[0] = parseInt(l.next().tx);
                    term.r[1] = parseInt(l.next().a(",").tx);
                    l.next().a("}");
                }
                break;
        }
        break;
    }
    return term;
}

function foldIntoProduction(productions, term, new_term = null) {
    if (term) {
        if (!(term instanceof productions.JUX)) {
            let nr = new productions.JUX();
            nr.terms.push(term);
            term = nr;
        }

        if (new_term) term.terms.push(new_term);

        return term;
    }
    return new_term;
}
