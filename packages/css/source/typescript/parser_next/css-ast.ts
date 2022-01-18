
import {
    ASTNode,
    ByteReader,
    ByteWriter,
    Token,
    Deserialize as InternalDeserialize,
    SerializeType,
    SerializeVector,
    SerializeStructVector
} from "@hctoolkit/runtime";

export type c_RuleParent = Stylesheet
    | Supports
    | Media;


export function isRuleParent(s: ASTNode<ASTType>): s is c_RuleParent {
    return (s.type & 2) == 2;
}


export type c_B_SPECIFIER = IdSelector;


export function isB_SPECIFIER(s: ASTNode<ASTType>): s is c_B_SPECIFIER {
    return (s.type & 4) == 4;
}


export type c_C_SPECIFIER = ClassSelector
    | PseudoClassSelector
    | AttributeSelector;


export function isC_SPECIFIER(s: ASTNode<ASTType>): s is c_C_SPECIFIER {
    return (s.type & 8) == 8;
}


export type c_D_SPECIFIER = PseudoElementSelector
    | TypeSelector;


export function isD_SPECIFIER(s: ASTNode<ASTType>): s is c_D_SPECIFIER {
    return (s.type & 16) == 16;
}



export enum ASTClass {
    RuleParent = 2,
    B_SPECIFIER = 4,
    C_SPECIFIER = 8,
    D_SPECIFIER = 16
}



export enum ASTType {
    Stylesheet = 354,
    Rule = 384,
    FontFace = 416,
    Keyframes = 448,
    Supports = 482,
    Import = 512,
    CharSet = 544,
    Media = 578,
    Page = 608,
    UnknownAtRule = 640,
    KeyframeBlock = 672,
    KeyFrameTo = 704,
    KeyframeSelector = 736,
    KeyFrameFrom = 768,
    SupportsParenthesis = 800,
    SupportDeclaration = 832,
    SupportsSelector = 864,
    Condition = 896,
    Type = 928,
    MediaOr = 960,
    MediaNot = 992,
    MediaAnd = 1024,
    MediaParenthesis = 1056,
    MediaFeature = 1088,
    MediaFunction = 1120,
    MediaValue = 1152,
    MediaEquality = 1184,
    MediaRangeDescending = 1216,
    MediaRangeAscending = 1248,
    MediaName = 1280,
    MediaType = 1312,
    Boolean = 1344,
    Ratio = 1376,
    Percentage = 1408,
    Length = 1440,
    URL = 1472,
    String = 1504,
    Number = 1536,
    Identifier = 1568,
    IdSelector = 1604,
    ClassSelector = 1640,
    PseudoClassSelector = 1672,
    PseudoElementSelector = 1712,
    AttributeSelector = 1736,
    TypeSelector = 1776,
    QualifiedName = 1792,
    Property = 1824,
    Selector = 1856,
    And = 1888,
    Or = 1920,
    Combinator = 1952,
    Not = 1984
}



export function Deserialize(reader: ByteReader) {
    return InternalDeserialize(reader, DeserializeStruct);
}

function DeserializeStruct(reader: ByteReader): ASTNode<ASTType> {
    switch (reader.peek_byte()) {

        case 0: return Stylesheet.Deserialize(reader);
        case 0: return Rule.Deserialize(reader);
        case 0: return FontFace.Deserialize(reader);
        case 0: return Keyframes.Deserialize(reader);
        case 0: return Supports.Deserialize(reader);
        case 0: return Import.Deserialize(reader);
        case 0: return CharSet.Deserialize(reader);
        case 0: return Media.Deserialize(reader);
        case 0: return Page.Deserialize(reader);
        case 0: return UnknownAtRule.Deserialize(reader);
        case 0: return KeyframeBlock.Deserialize(reader);
        case 0: return KeyFrameTo.Deserialize(reader);
        case 0: return KeyframeSelector.Deserialize(reader);
        case 0: return KeyFrameFrom.Deserialize(reader);
        case 0: return SupportsParenthesis.Deserialize(reader);
        case 0: return SupportDeclaration.Deserialize(reader);
        case 0: return SupportsSelector.Deserialize(reader);
        case 0: return Condition.Deserialize(reader);
        case 0: return Type.Deserialize(reader);
        case 0: return MediaOr.Deserialize(reader);
        case 0: return MediaNot.Deserialize(reader);
        case 0: return MediaAnd.Deserialize(reader);
        case 0: return MediaParenthesis.Deserialize(reader);
        case 0: return MediaFeature.Deserialize(reader);
        case 0: return MediaFunction.Deserialize(reader);
        case 0: return MediaValue.Deserialize(reader);
        case 0: return MediaEquality.Deserialize(reader);
        case 0: return MediaRangeDescending.Deserialize(reader);
        case 0: return MediaRangeAscending.Deserialize(reader);
        case 0: return MediaName.Deserialize(reader);
        case 0: return MediaType.Deserialize(reader);
        case 0: return Boolean.Deserialize(reader);
        case 0: return Ratio.Deserialize(reader);
        case 0: return Percentage.Deserialize(reader);
        case 0: return Length.Deserialize(reader);
        case 0: return URL.Deserialize(reader);
        case 0: return String.Deserialize(reader);
        case 0: return Number.Deserialize(reader);
        case 0: return Identifier.Deserialize(reader);
        case 0: return IdSelector.Deserialize(reader);
        case 0: return ClassSelector.Deserialize(reader);
        case 0: return PseudoClassSelector.Deserialize(reader);
        case 0: return PseudoElementSelector.Deserialize(reader);
        case 0: return AttributeSelector.Deserialize(reader);
        case 0: return TypeSelector.Deserialize(reader);
        case 0: return QualifiedName.Deserialize(reader);
        case 0: return Property.Deserialize(reader);
        case 0: return Selector.Deserialize(reader);
        case 0: return And.Deserialize(reader);
        case 0: return Or.Deserialize(reader);
        case 0: return Combinator.Deserialize(reader);
        case 0: return Not.Deserialize(reader);
    }
    throw new Error("Could not deserialize");
}


export class Stylesheet extends ASTNode<ASTType> {

    rules: (Media | Import | Keyframes | Supports | CharSet | FontFace | UnknownAtRule | Rule)[];
    tok: Token;

    constructor(
        _rules: (Media | Import | Keyframes | Supports | CharSet | FontFace | UnknownAtRule | Rule)[],
        _tok: Token,) {
        super();
        this.rules = _rules;
        this.tok = _tok;

    }
    replace_rules(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.rules.length && j >= 0) {
                return this.rules.splice(j, 1)[0];
            }
        } else if (Media.nodeIs(child)
            || Import.nodeIs(child)
            || Keyframes.nodeIs(child)
            || Supports.nodeIs(child)
            || CharSet.nodeIs(child)
            || FontFace.nodeIs(child)
            || UnknownAtRule.nodeIs(child)
            || Rule.nodeIs(child)) {
            if (j < 0) {
                this.rules.unshift(child);
            } else if (j >= this.rules.length) {
                this.rules.push(child);
            } else {
                return this.rules.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        for (let i = 0; i < this.rules.length; i++) {
            this.rules[i].$$____Iterate_$_$_$(_yield, this, 0, i);
        }
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_rules(child, j);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Stylesheet {
        if (typeof s == "object")
            return s instanceof Stylesheet;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Stylesheet {
        return s.type == ASTType.Stylesheet;
    }

    static Type(): ASTType.Stylesheet {
        return ASTType.Stylesheet;
    }

    get type(): ASTType.Stylesheet {
        return ASTType.Stylesheet;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        SerializeStructVector(this.rules, writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Stylesheet {

        reader.assert_byte(0);


        var rules = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new Stylesheet(rules, tok);
    }
}



export class Rule extends ASTNode<ASTType> {

    selectors: Selector[];
    properties: Property[];
    tok: Token;
    parent: c_RuleParent | null;

    constructor(
        _selectors: Selector[],
        _properties: Property[],
        _tok: Token,
        _parent: c_RuleParent | null,) {
        super();
        this.selectors = _selectors;
        this.properties = _properties;
        this.tok = _tok;
        this.parent = _parent;

    }
    replace_selectors(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.selectors.length && j >= 0) {
                return this.selectors.splice(j, 1)[0];
            }
        } else if (Selector.nodeIs(child)) {
            if (j < 0) {
                this.selectors.unshift(child);
            } else if (j >= this.selectors.length) {
                this.selectors.push(child);
            } else {
                return this.selectors.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    replace_properties(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.properties.length && j >= 0) {
                return this.properties.splice(j, 1)[0];
            }
        } else if (Property.nodeIs(child)) {
            if (j < 0) {
                this.properties.unshift(child);
            } else if (j >= this.properties.length) {
                this.properties.push(child);
            } else {
                return this.properties.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    replace_parent(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (child === null) {
            let old = this.parent;

            this.parent = null;

            return old;
        }
        else
            if (isRuleParent(child)) {

                let old = this.parent;

                this.parent = child;

                return old;
            }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        for (let i = 0; i < this.selectors.length; i++) {
            this.selectors[i].$$____Iterate_$_$_$(_yield, this, 0, i);
        }

        for (let i = 0; i < this.properties.length; i++) {
            this.properties[i].$$____Iterate_$_$_$(_yield, this, 1, i);
        }

        if (this.parent instanceof ASTNode)
            this.parent.$$____Iterate_$_$_$(_yield, this, 2, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_selectors(child, j);
            case 1: return this.replace_properties(child, j);
            case 2: return this.replace_parent(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Rule {
        if (typeof s == "object")
            return s instanceof Rule;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Rule {
        return s.type == ASTType.Rule;
    }

    static Type(): ASTType.Rule {
        return ASTType.Rule;
    }

    get type(): ASTType.Rule {
        return ASTType.Rule;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        SerializeStructVector(this.selectors, writer);

        SerializeStructVector(this.properties, writer);

        this.tok.serialize(writer);

        if (!this.parent)
            writer.write_null();
        else
            this.parent.serialize(writer);

    }

    static Deserialize(reader: ByteReader): Rule {

        reader.assert_byte(0);


        var selectors = Deserialize(reader);

        var properties = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        var parent = reader.assert_null() ? null : Deserialize(reader);

        return new Rule(selectors, properties, tok, parent);
    }
}



export class FontFace extends ASTNode<ASTType> {

    descriptors: Property[];
    tok: Token;

    constructor(
        _descriptors: Property[],
        _tok: Token,) {
        super();
        this.descriptors = _descriptors;
        this.tok = _tok;

    }
    replace_descriptors(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.descriptors.length && j >= 0) {
                return this.descriptors.splice(j, 1)[0];
            }
        } else if (Property.nodeIs(child)) {
            if (j < 0) {
                this.descriptors.unshift(child);
            } else if (j >= this.descriptors.length) {
                this.descriptors.push(child);
            } else {
                return this.descriptors.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        for (let i = 0; i < this.descriptors.length; i++) {
            this.descriptors[i].$$____Iterate_$_$_$(_yield, this, 0, i);
        }
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_descriptors(child, j);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is FontFace {
        if (typeof s == "object")
            return s instanceof FontFace;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is FontFace {
        return s.type == ASTType.FontFace;
    }

    static Type(): ASTType.FontFace {
        return ASTType.FontFace;
    }

    get type(): ASTType.FontFace {
        return ASTType.FontFace;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        SerializeStructVector(this.descriptors, writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): FontFace {

        reader.assert_byte(0);


        var descriptors = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new FontFace(descriptors, tok);
    }
}



export class Keyframes extends ASTNode<ASTType> {

    name: Token;
    keyframes: KeyframeBlock[];
    tok: Token;
    parent: c_RuleParent | null;

    constructor(
        _name: Token,
        _keyframes: KeyframeBlock[],
        _tok: Token,
        _parent: c_RuleParent | null,) {
        super();
        this.name = _name;
        this.keyframes = _keyframes;
        this.tok = _tok;
        this.parent = _parent;

    }
    replace_keyframes(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.keyframes.length && j >= 0) {
                return this.keyframes.splice(j, 1)[0];
            }
        } else if (KeyframeBlock.nodeIs(child)) {
            if (j < 0) {
                this.keyframes.unshift(child);
            } else if (j >= this.keyframes.length) {
                this.keyframes.push(child);
            } else {
                return this.keyframes.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    replace_parent(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (child === null) {
            let old = this.parent;

            this.parent = null;

            return old;
        }
        else
            if (isRuleParent(child)) {

                let old = this.parent;

                this.parent = child;

                return old;
            }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        for (let i = 0; i < this.keyframes.length; i++) {
            this.keyframes[i].$$____Iterate_$_$_$(_yield, this, 0, i);
        }

        if (this.parent instanceof ASTNode)
            this.parent.$$____Iterate_$_$_$(_yield, this, 1, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_keyframes(child, j);
            case 1: return this.replace_parent(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Keyframes {
        if (typeof s == "object")
            return s instanceof Keyframes;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Keyframes {
        return s.type == ASTType.Keyframes;
    }

    static Type(): ASTType.Keyframes {
        return ASTType.Keyframes;
    }

    get type(): ASTType.Keyframes {
        return ASTType.Keyframes;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.name.serialize(writer);

        SerializeStructVector(this.keyframes, writer);

        this.tok.serialize(writer);

        if (!this.parent)
            writer.write_null();
        else
            this.parent.serialize(writer);

    }

    static Deserialize(reader: ByteReader): Keyframes {

        reader.assert_byte(0);


        var name = Token.Deserialize(reader);

        var keyframes = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        var parent = reader.assert_null() ? null : Deserialize(reader);

        return new Keyframes(name, keyframes, tok, parent);
    }
}



export class Supports extends ASTNode<ASTType> {

    condition: (Not | SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction | Or | And)[];
    rules: Rule[];
    tok: Token;
    parent: c_RuleParent | null;

    constructor(
        _condition: (Not | SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction | Or | And)[],
        _rules: Rule[],
        _tok: Token,
        _parent: c_RuleParent | null,) {
        super();
        this.condition = _condition;
        this.rules = _rules;
        this.tok = _tok;
        this.parent = _parent;

    }
    replace_condition(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.condition.length && j >= 0) {
                return this.condition.splice(j, 1)[0];
            }
        } else if (Not.nodeIs(child)
            || SupportsParenthesis.nodeIs(child)
            || SupportsSelector.nodeIs(child)
            || SupportDeclaration.nodeIs(child)
            || MediaFunction.nodeIs(child)
            || Or.nodeIs(child)
            || And.nodeIs(child)) {
            if (j < 0) {
                this.condition.unshift(child);
            } else if (j >= this.condition.length) {
                this.condition.push(child);
            } else {
                return this.condition.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    replace_rules(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.rules.length && j >= 0) {
                return this.rules.splice(j, 1)[0];
            }
        } else if (Rule.nodeIs(child)) {
            if (j < 0) {
                this.rules.unshift(child);
            } else if (j >= this.rules.length) {
                this.rules.push(child);
            } else {
                return this.rules.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    replace_parent(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (child === null) {
            let old = this.parent;

            this.parent = null;

            return old;
        }
        else
            if (isRuleParent(child)) {

                let old = this.parent;

                this.parent = child;

                return old;
            }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        for (let i = 0; i < this.condition.length; i++) {
            this.condition[i].$$____Iterate_$_$_$(_yield, this, 0, i);
        }

        for (let i = 0; i < this.rules.length; i++) {
            this.rules[i].$$____Iterate_$_$_$(_yield, this, 1, i);
        }

        if (this.parent instanceof ASTNode)
            this.parent.$$____Iterate_$_$_$(_yield, this, 2, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_condition(child, j);
            case 1: return this.replace_rules(child, j);
            case 2: return this.replace_parent(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Supports {
        if (typeof s == "object")
            return s instanceof Supports;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Supports {
        return s.type == ASTType.Supports;
    }

    static Type(): ASTType.Supports {
        return ASTType.Supports;
    }

    get type(): ASTType.Supports {
        return ASTType.Supports;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        SerializeStructVector(this.condition, writer);

        SerializeStructVector(this.rules, writer);

        this.tok.serialize(writer);

        if (!this.parent)
            writer.write_null();
        else
            this.parent.serialize(writer);

    }

    static Deserialize(reader: ByteReader): Supports {

        reader.assert_byte(0);


        var condition = Deserialize(reader);

        var rules = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        var parent = reader.assert_null() ? null : Deserialize(reader);

        return new Supports(condition, rules, tok, parent);
    }
}



export class Import extends ASTNode<ASTType> {

    uri: (URL | String);
    condition: (Property | Not | SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction | Or | And)[];
    media: (Condition | Type)[];
    tok: Token;

    constructor(
        _uri: (URL | String),
        _condition: (Property | Not | SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction | Or | And)[],
        _media: (Condition | Type)[],
        _tok: Token,) {
        super();
        this.uri = _uri;
        this.condition = _condition;
        this.media = _media;
        this.tok = _tok;

    }
    replace_uri(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (URL.nodeIs(child)
            || String.nodeIs(child)) {

            let old = this.uri;

            this.uri = child;

            return old;
        }
        return null;
    }

    replace_condition(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.condition.length && j >= 0) {
                return this.condition.splice(j, 1)[0];
            }
        } else if (Property.nodeIs(child)
            || Not.nodeIs(child)
            || SupportsParenthesis.nodeIs(child)
            || SupportsSelector.nodeIs(child)
            || SupportDeclaration.nodeIs(child)
            || MediaFunction.nodeIs(child)
            || Or.nodeIs(child)
            || And.nodeIs(child)) {
            if (j < 0) {
                this.condition.unshift(child);
            } else if (j >= this.condition.length) {
                this.condition.push(child);
            } else {
                return this.condition.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    replace_media(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.media.length && j >= 0) {
                return this.media.splice(j, 1)[0];
            }
        } else if (Condition.nodeIs(child)
            || Type.nodeIs(child)) {
            if (j < 0) {
                this.media.unshift(child);
            } else if (j >= this.media.length) {
                this.media.push(child);
            } else {
                return this.media.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.uri.$$____Iterate_$_$_$(_yield, this, 0, 0);

        for (let i = 0; i < this.condition.length; i++) {
            this.condition[i].$$____Iterate_$_$_$(_yield, this, 1, i);
        }

        for (let i = 0; i < this.media.length; i++) {
            this.media[i].$$____Iterate_$_$_$(_yield, this, 2, i);
        }
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_uri(child);
            case 1: return this.replace_condition(child, j);
            case 2: return this.replace_media(child, j);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Import {
        if (typeof s == "object")
            return s instanceof Import;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Import {
        return s.type == ASTType.Import;
    }

    static Type(): ASTType.Import {
        return ASTType.Import;
    }

    get type(): ASTType.Import {
        return ASTType.Import;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.uri.serialize(writer);

        SerializeStructVector(this.condition, writer);

        SerializeStructVector(this.media, writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Import {

        reader.assert_byte(0);


        var uri = Deserialize(reader);

        var condition = Deserialize(reader);

        var media = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new Import(uri, condition, media, tok);
    }
}



export class CharSet extends ASTNode<ASTType> {

    value: String;
    tok: Token;

    constructor(
        _value: String,
        _tok: Token,) {
        super();
        this.value = _value;
        this.tok = _tok;

    }
    replace_value(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (String.nodeIs(child)) {

            let old = this.value;

            this.value = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.value.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_value(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is CharSet {
        if (typeof s == "object")
            return s instanceof CharSet;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is CharSet {
        return s.type == ASTType.CharSet;
    }

    static Type(): ASTType.CharSet {
        return ASTType.CharSet;
    }

    get type(): ASTType.CharSet {
        return ASTType.CharSet;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.value.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): CharSet {

        reader.assert_byte(0);


        var value = String.Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new CharSet(value, tok);
    }
}



export class Media extends ASTNode<ASTType> {

    queries: (Condition | Type)[];
    rules: Rule[];
    tok: Token;

    constructor(
        _queries: (Condition | Type)[],
        _rules: Rule[],
        _tok: Token,) {
        super();
        this.queries = _queries;
        this.rules = _rules;
        this.tok = _tok;

    }
    replace_queries(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.queries.length && j >= 0) {
                return this.queries.splice(j, 1)[0];
            }
        } else if (Condition.nodeIs(child)
            || Type.nodeIs(child)) {
            if (j < 0) {
                this.queries.unshift(child);
            } else if (j >= this.queries.length) {
                this.queries.push(child);
            } else {
                return this.queries.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    replace_rules(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.rules.length && j >= 0) {
                return this.rules.splice(j, 1)[0];
            }
        } else if (Rule.nodeIs(child)) {
            if (j < 0) {
                this.rules.unshift(child);
            } else if (j >= this.rules.length) {
                this.rules.push(child);
            } else {
                return this.rules.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        for (let i = 0; i < this.queries.length; i++) {
            this.queries[i].$$____Iterate_$_$_$(_yield, this, 0, i);
        }

        for (let i = 0; i < this.rules.length; i++) {
            this.rules[i].$$____Iterate_$_$_$(_yield, this, 1, i);
        }
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_queries(child, j);
            case 1: return this.replace_rules(child, j);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Media {
        if (typeof s == "object")
            return s instanceof Media;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Media {
        return s.type == ASTType.Media;
    }

    static Type(): ASTType.Media {
        return ASTType.Media;
    }

    get type(): ASTType.Media {
        return ASTType.Media;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        SerializeStructVector(this.queries, writer);

        SerializeStructVector(this.rules, writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Media {

        reader.assert_byte(0);


        var queries = Deserialize(reader);

        var rules = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new Media(queries, rules, tok);
    }
}



export class Page extends ASTNode<ASTType> {

    selector: (Token | Token[]) | null;
    rules: Property[];
    tok: Token;

    constructor(
        _selector: (Token | Token[]) | null,
        _rules: Property[],
        _tok: Token,) {
        super();
        this.selector = _selector;
        this.rules = _rules;
        this.tok = _tok;

    }
    replace_rules(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.rules.length && j >= 0) {
                return this.rules.splice(j, 1)[0];
            }
        } else if (Property.nodeIs(child)) {
            if (j < 0) {
                this.rules.unshift(child);
            } else if (j >= this.rules.length) {
                this.rules.push(child);
            } else {
                return this.rules.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        for (let i = 0; i < this.rules.length; i++) {
            this.rules[i].$$____Iterate_$_$_$(_yield, this, 0, i);
        }
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_rules(child, j);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Page {
        if (typeof s == "object")
            return s instanceof Page;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Page {
        return s.type == ASTType.Page;
    }

    static Type(): ASTType.Page {
        return ASTType.Page;
    }

    get type(): ASTType.Page {
        return ASTType.Page;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);
        SerializeType(this.selector, writer);

        SerializeStructVector(this.rules, writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Page {

        reader.assert_byte(0);

        var selector = Deserialize(reader);

        var rules = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new Page(selector, rules, tok);
    }
}



export class UnknownAtRule extends ASTNode<ASTType> {

    name: string;
    value: string;
    tok: Token;

    constructor(
        _name: string,
        _value: string,
        _tok: Token,) {
        super();
        this.name = _name;
        this.value = _value;
        this.tok = _tok;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is UnknownAtRule {
        if (typeof s == "object")
            return s instanceof UnknownAtRule;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is UnknownAtRule {
        return s.type == ASTType.UnknownAtRule;
    }

    static Type(): ASTType.UnknownAtRule {
        return ASTType.UnknownAtRule;
    }

    get type(): ASTType.UnknownAtRule {
        return ASTType.UnknownAtRule;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);
        writer.write_string(this.name);
        writer.write_string(this.value);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): UnknownAtRule {

        reader.assert_byte(0);

        var name = reader.read_string();
        var value = reader.read_string();

        var tok = Token.Deserialize(reader);

        return new UnknownAtRule(name, value, tok);
    }
}



export class KeyframeBlock extends ASTNode<ASTType> {

    selectors: KeyframeSelector[];
    properties: Property[];
    tok: Token;

    constructor(
        _selectors: KeyframeSelector[],
        _properties: Property[],
        _tok: Token,) {
        super();
        this.selectors = _selectors;
        this.properties = _properties;
        this.tok = _tok;

    }
    replace_selectors(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.selectors.length && j >= 0) {
                return this.selectors.splice(j, 1)[0];
            }
        } else if (KeyframeSelector.nodeIs(child)) {
            if (j < 0) {
                this.selectors.unshift(child);
            } else if (j >= this.selectors.length) {
                this.selectors.push(child);
            } else {
                return this.selectors.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    replace_properties(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.properties.length && j >= 0) {
                return this.properties.splice(j, 1)[0];
            }
        } else if (Property.nodeIs(child)) {
            if (j < 0) {
                this.properties.unshift(child);
            } else if (j >= this.properties.length) {
                this.properties.push(child);
            } else {
                return this.properties.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        for (let i = 0; i < this.selectors.length; i++) {
            this.selectors[i].$$____Iterate_$_$_$(_yield, this, 0, i);
        }

        for (let i = 0; i < this.properties.length; i++) {
            this.properties[i].$$____Iterate_$_$_$(_yield, this, 1, i);
        }
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_selectors(child, j);
            case 1: return this.replace_properties(child, j);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is KeyframeBlock {
        if (typeof s == "object")
            return s instanceof KeyframeBlock;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is KeyframeBlock {
        return s.type == ASTType.KeyframeBlock;
    }

    static Type(): ASTType.KeyframeBlock {
        return ASTType.KeyframeBlock;
    }

    get type(): ASTType.KeyframeBlock {
        return ASTType.KeyframeBlock;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        SerializeStructVector(this.selectors, writer);

        SerializeStructVector(this.properties, writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): KeyframeBlock {

        reader.assert_byte(0);


        var selectors = Deserialize(reader);

        var properties = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new KeyframeBlock(selectors, properties, tok);
    }
}



export class KeyFrameTo extends ASTNode<ASTType> {



    constructor() {
        super();


    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is KeyFrameTo {
        if (typeof s == "object")
            return s instanceof KeyFrameTo;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is KeyFrameTo {
        return s.type == ASTType.KeyFrameTo;
    }

    static Type(): ASTType.KeyFrameTo {
        return ASTType.KeyFrameTo;
    }

    get type(): ASTType.KeyFrameTo {
        return ASTType.KeyFrameTo;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

    }

    static Deserialize(reader: ByteReader): KeyFrameTo {

        reader.assert_byte(0);



        return new KeyFrameTo();
    }
}



export class KeyframeSelector extends ASTNode<ASTType> {

    val: (KeyFrameTo | KeyFrameFrom | Percentage);
    tok: Token;

    constructor(
        _val: (KeyFrameTo | KeyFrameFrom | Percentage),
        _tok: Token,) {
        super();
        this.val = _val;
        this.tok = _tok;

    }
    replace_val(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (KeyFrameTo.nodeIs(child)
            || KeyFrameFrom.nodeIs(child)
            || Percentage.nodeIs(child)) {

            let old = this.val;

            this.val = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.val.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_val(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is KeyframeSelector {
        if (typeof s == "object")
            return s instanceof KeyframeSelector;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is KeyframeSelector {
        return s.type == ASTType.KeyframeSelector;
    }

    static Type(): ASTType.KeyframeSelector {
        return ASTType.KeyframeSelector;
    }

    get type(): ASTType.KeyframeSelector {
        return ASTType.KeyframeSelector;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.val.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): KeyframeSelector {

        reader.assert_byte(0);


        var val = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new KeyframeSelector(val, tok);
    }
}



export class KeyFrameFrom extends ASTNode<ASTType> {



    constructor() {
        super();


    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is KeyFrameFrom {
        if (typeof s == "object")
            return s instanceof KeyFrameFrom;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is KeyFrameFrom {
        return s.type == ASTType.KeyFrameFrom;
    }

    static Type(): ASTType.KeyFrameFrom {
        return ASTType.KeyFrameFrom;
    }

    get type(): ASTType.KeyFrameFrom {
        return ASTType.KeyFrameFrom;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

    }

    static Deserialize(reader: ByteReader): KeyFrameFrom {

        reader.assert_byte(0);



        return new KeyFrameFrom();
    }
}



export class SupportsParenthesis extends ASTNode<ASTType> {

    supports: (Not | SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction | Or | And)[];
    tok: Token;

    constructor(
        _supports: (Not | SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction | Or | And)[],
        _tok: Token,) {
        super();
        this.supports = _supports;
        this.tok = _tok;

    }
    replace_supports(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.supports.length && j >= 0) {
                return this.supports.splice(j, 1)[0];
            }
        } else if (Not.nodeIs(child)
            || SupportsParenthesis.nodeIs(child)
            || SupportsSelector.nodeIs(child)
            || SupportDeclaration.nodeIs(child)
            || MediaFunction.nodeIs(child)
            || Or.nodeIs(child)
            || And.nodeIs(child)) {
            if (j < 0) {
                this.supports.unshift(child);
            } else if (j >= this.supports.length) {
                this.supports.push(child);
            } else {
                return this.supports.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        for (let i = 0; i < this.supports.length; i++) {
            this.supports[i].$$____Iterate_$_$_$(_yield, this, 0, i);
        }
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_supports(child, j);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is SupportsParenthesis {
        if (typeof s == "object")
            return s instanceof SupportsParenthesis;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is SupportsParenthesis {
        return s.type == ASTType.SupportsParenthesis;
    }

    static Type(): ASTType.SupportsParenthesis {
        return ASTType.SupportsParenthesis;
    }

    get type(): ASTType.SupportsParenthesis {
        return ASTType.SupportsParenthesis;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        SerializeStructVector(this.supports, writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): SupportsParenthesis {

        reader.assert_byte(0);


        var supports = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new SupportsParenthesis(supports, tok);
    }
}



export class SupportDeclaration extends ASTNode<ASTType> {

    declaration: Property;
    tok: Token;

    constructor(
        _declaration: Property,
        _tok: Token,) {
        super();
        this.declaration = _declaration;
        this.tok = _tok;

    }
    replace_declaration(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (Property.nodeIs(child)) {

            let old = this.declaration;

            this.declaration = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.declaration.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_declaration(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is SupportDeclaration {
        if (typeof s == "object")
            return s instanceof SupportDeclaration;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is SupportDeclaration {
        return s.type == ASTType.SupportDeclaration;
    }

    static Type(): ASTType.SupportDeclaration {
        return ASTType.SupportDeclaration;
    }

    get type(): ASTType.SupportDeclaration {
        return ASTType.SupportDeclaration;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.declaration.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): SupportDeclaration {

        reader.assert_byte(0);


        var declaration = Property.Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new SupportDeclaration(declaration, tok);
    }
}



export class SupportsSelector extends ASTNode<ASTType> {

    selectors: (c_C_SPECIFIER | c_D_SPECIFIER | c_B_SPECIFIER | Combinator)[];
    tok: Token;

    constructor(
        _selectors: (c_C_SPECIFIER | c_D_SPECIFIER | c_B_SPECIFIER | Combinator)[],
        _tok: Token,) {
        super();
        this.selectors = _selectors;
        this.tok = _tok;

    }
    replace_selectors(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.selectors.length && j >= 0) {
                return this.selectors.splice(j, 1)[0];
            }
        } else if (isC_SPECIFIER(child)
            || isD_SPECIFIER(child)
            || isB_SPECIFIER(child)
            || Combinator.nodeIs(child)) {
            if (j < 0) {
                this.selectors.unshift(child);
            } else if (j >= this.selectors.length) {
                this.selectors.push(child);
            } else {
                return this.selectors.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        for (let i = 0; i < this.selectors.length; i++) {
            this.selectors[i].$$____Iterate_$_$_$(_yield, this, 0, i);
        }
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_selectors(child, j);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is SupportsSelector {
        if (typeof s == "object")
            return s instanceof SupportsSelector;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is SupportsSelector {
        return s.type == ASTType.SupportsSelector;
    }

    static Type(): ASTType.SupportsSelector {
        return ASTType.SupportsSelector;
    }

    get type(): ASTType.SupportsSelector {
        return ASTType.SupportsSelector;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        SerializeStructVector(this.selectors, writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): SupportsSelector {

        reader.assert_byte(0);


        var selectors = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new SupportsSelector(selectors, tok);
    }
}



export class Condition extends ASTNode<ASTType> {

    condition: (MediaOr | MediaAnd | MediaParenthesis | MediaFeature | MediaFunction);
    tok: Token;

    constructor(
        _condition: (MediaOr | MediaAnd | MediaParenthesis | MediaFeature | MediaFunction),
        _tok: Token,) {
        super();
        this.condition = _condition;
        this.tok = _tok;

    }
    replace_condition(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (MediaOr.nodeIs(child)
            || MediaAnd.nodeIs(child)
            || MediaParenthesis.nodeIs(child)
            || MediaFeature.nodeIs(child)
            || MediaFunction.nodeIs(child)) {

            let old = this.condition;

            this.condition = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.condition.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_condition(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Condition {
        if (typeof s == "object")
            return s instanceof Condition;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Condition {
        return s.type == ASTType.Condition;
    }

    static Type(): ASTType.Condition {
        return ASTType.Condition;
    }

    get type(): ASTType.Condition {
        return ASTType.Condition;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.condition.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Condition {

        reader.assert_byte(0);


        var condition = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new Condition(condition, tok);
    }
}



export class Type extends ASTNode<ASTType> {

    modifier: string;
    val: MediaType;
    and: (MediaNot | MediaOr | MediaAnd | MediaParenthesis | MediaFeature | MediaFunction) | null;
    tok: Token;

    constructor(
        _modifier: string,
        _val: MediaType,
        _and: (MediaNot | MediaOr | MediaAnd | MediaParenthesis | MediaFeature | MediaFunction) | null,
        _tok: Token,) {
        super();
        this.modifier = _modifier;
        this.val = _val;
        this.and = _and;
        this.tok = _tok;

    }
    replace_val(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (MediaType.nodeIs(child)) {

            let old = this.val;

            this.val = child;

            return old;
        }
        return null;
    }

    replace_and(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (child === null) {
            let old = this.and;

            this.and = null;

            return old;
        }
        else
            if (MediaNot.nodeIs(child)
                || MediaOr.nodeIs(child)
                || MediaAnd.nodeIs(child)
                || MediaParenthesis.nodeIs(child)
                || MediaFeature.nodeIs(child)
                || MediaFunction.nodeIs(child)) {

                let old = this.and;

                this.and = child;

                return old;
            }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.val.$$____Iterate_$_$_$(_yield, this, 0, 0);

        if (this.and instanceof ASTNode)
            this.and.$$____Iterate_$_$_$(_yield, this, 1, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_val(child);
            case 1: return this.replace_and(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Type {
        if (typeof s == "object")
            return s instanceof Type;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Type {
        return s.type == ASTType.Type;
    }

    static Type(): ASTType.Type {
        return ASTType.Type;
    }

    get type(): ASTType.Type {
        return ASTType.Type;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);
        writer.write_string(this.modifier);

        this.val.serialize(writer);

        if (!this.and)
            writer.write_null();
        else
            this.and.serialize(writer);


        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Type {

        reader.assert_byte(0);

        var modifier = reader.read_string();

        var val = MediaType.Deserialize(reader);

        var and = reader.assert_null() ? null : Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new Type(modifier, val, and, tok);
    }
}



export class MediaOr extends ASTNode<ASTType> {

    left: (MediaOr | MediaAnd | MediaParenthesis | MediaFeature | MediaFunction);
    right: Token;
    tok: Token;

    constructor(
        _left: (MediaOr | MediaAnd | MediaParenthesis | MediaFeature | MediaFunction),
        _right: Token,
        _tok: Token,) {
        super();
        this.left = _left;
        this.right = _right;
        this.tok = _tok;

    }
    replace_left(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (MediaOr.nodeIs(child)
            || MediaAnd.nodeIs(child)
            || MediaParenthesis.nodeIs(child)
            || MediaFeature.nodeIs(child)
            || MediaFunction.nodeIs(child)) {

            let old = this.left;

            this.left = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.left.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_left(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaOr {
        if (typeof s == "object")
            return s instanceof MediaOr;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaOr {
        return s.type == ASTType.MediaOr;
    }

    static Type(): ASTType.MediaOr {
        return ASTType.MediaOr;
    }

    get type(): ASTType.MediaOr {
        return ASTType.MediaOr;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.left.serialize(writer);

        this.right.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaOr {

        reader.assert_byte(0);


        var left = Deserialize(reader);

        var right = Token.Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new MediaOr(left, right, tok);
    }
}



export class MediaNot extends ASTNode<ASTType> {

    media: (MediaParenthesis | MediaFeature | MediaFunction);
    tok: Token;

    constructor(
        _media: (MediaParenthesis | MediaFeature | MediaFunction),
        _tok: Token,) {
        super();
        this.media = _media;
        this.tok = _tok;

    }
    replace_media(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (MediaParenthesis.nodeIs(child)
            || MediaFeature.nodeIs(child)
            || MediaFunction.nodeIs(child)) {

            let old = this.media;

            this.media = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.media.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_media(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaNot {
        if (typeof s == "object")
            return s instanceof MediaNot;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaNot {
        return s.type == ASTType.MediaNot;
    }

    static Type(): ASTType.MediaNot {
        return ASTType.MediaNot;
    }

    get type(): ASTType.MediaNot {
        return ASTType.MediaNot;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.media.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaNot {

        reader.assert_byte(0);


        var media = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new MediaNot(media, tok);
    }
}



export class MediaAnd extends ASTNode<ASTType> {

    left: (MediaAnd | MediaParenthesis | MediaFeature | MediaFunction);
    right: Token;
    tok: Token;

    constructor(
        _left: (MediaAnd | MediaParenthesis | MediaFeature | MediaFunction),
        _right: Token,
        _tok: Token,) {
        super();
        this.left = _left;
        this.right = _right;
        this.tok = _tok;

    }
    replace_left(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (MediaAnd.nodeIs(child)
            || MediaParenthesis.nodeIs(child)
            || MediaFeature.nodeIs(child)
            || MediaFunction.nodeIs(child)) {

            let old = this.left;

            this.left = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.left.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_left(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaAnd {
        if (typeof s == "object")
            return s instanceof MediaAnd;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaAnd {
        return s.type == ASTType.MediaAnd;
    }

    static Type(): ASTType.MediaAnd {
        return ASTType.MediaAnd;
    }

    get type(): ASTType.MediaAnd {
        return ASTType.MediaAnd;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.left.serialize(writer);

        this.right.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaAnd {

        reader.assert_byte(0);


        var left = Deserialize(reader);

        var right = Token.Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new MediaAnd(left, right, tok);
    }
}



export class MediaParenthesis extends ASTNode<ASTType> {

    media: (MediaOr | MediaAnd | MediaParenthesis | MediaFeature | MediaFunction);
    tok: Token;

    constructor(
        _media: (MediaOr | MediaAnd | MediaParenthesis | MediaFeature | MediaFunction),
        _tok: Token,) {
        super();
        this.media = _media;
        this.tok = _tok;

    }
    replace_media(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (MediaOr.nodeIs(child)
            || MediaAnd.nodeIs(child)
            || MediaParenthesis.nodeIs(child)
            || MediaFeature.nodeIs(child)
            || MediaFunction.nodeIs(child)) {

            let old = this.media;

            this.media = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.media.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_media(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaParenthesis {
        if (typeof s == "object")
            return s instanceof MediaParenthesis;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaParenthesis {
        return s.type == ASTType.MediaParenthesis;
    }

    static Type(): ASTType.MediaParenthesis {
        return ASTType.MediaParenthesis;
    }

    get type(): ASTType.MediaParenthesis {
        return ASTType.MediaParenthesis;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.media.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaParenthesis {

        reader.assert_byte(0);


        var media = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new MediaParenthesis(media, tok);
    }
}



export class MediaFeature extends ASTNode<ASTType> {

    feature: (MediaEquality | MediaRangeDescending | MediaRangeAscending | MediaValue | Boolean);
    tok: Token;

    constructor(
        _feature: (MediaEquality | MediaRangeDescending | MediaRangeAscending | MediaValue | Boolean),
        _tok: Token,) {
        super();
        this.feature = _feature;
        this.tok = _tok;

    }
    replace_feature(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (MediaEquality.nodeIs(child)
            || MediaRangeDescending.nodeIs(child)
            || MediaRangeAscending.nodeIs(child)
            || MediaValue.nodeIs(child)
            || Boolean.nodeIs(child)) {

            let old = this.feature;

            this.feature = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.feature.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_feature(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaFeature {
        if (typeof s == "object")
            return s instanceof MediaFeature;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaFeature {
        return s.type == ASTType.MediaFeature;
    }

    static Type(): ASTType.MediaFeature {
        return ASTType.MediaFeature;
    }

    get type(): ASTType.MediaFeature {
        return ASTType.MediaFeature;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.feature.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaFeature {

        reader.assert_byte(0);


        var feature = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new MediaFeature(feature, tok);
    }
}



export class MediaFunction extends ASTNode<ASTType> {

    name: Token;
    value: string;
    tok: Token;

    constructor(
        _name: Token,
        _value: string,
        _tok: Token,) {
        super();
        this.name = _name;
        this.value = _value;
        this.tok = _tok;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaFunction {
        if (typeof s == "object")
            return s instanceof MediaFunction;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaFunction {
        return s.type == ASTType.MediaFunction;
    }

    static Type(): ASTType.MediaFunction {
        return ASTType.MediaFunction;
    }

    get type(): ASTType.MediaFunction {
        return ASTType.MediaFunction;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.name.serialize(writer);
        writer.write_string(this.value);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaFunction {

        reader.assert_byte(0);


        var name = Token.Deserialize(reader);
        var value = reader.read_string();

        var tok = Token.Deserialize(reader);

        return new MediaFunction(name, value, tok);
    }
}



export class MediaValue extends ASTNode<ASTType> {

    key: MediaName;
    val: (Number | Length | MediaName | Ratio);
    tok: Token;

    constructor(
        _key: MediaName,
        _val: (Number | Length | MediaName | Ratio),
        _tok: Token,) {
        super();
        this.key = _key;
        this.val = _val;
        this.tok = _tok;

    }
    replace_key(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (MediaName.nodeIs(child)) {

            let old = this.key;

            this.key = child;

            return old;
        }
        return null;
    }

    replace_val(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (Number.nodeIs(child)
            || Length.nodeIs(child)
            || MediaName.nodeIs(child)
            || Ratio.nodeIs(child)) {

            let old = this.val;

            this.val = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.key.$$____Iterate_$_$_$(_yield, this, 0, 0);

        this.val.$$____Iterate_$_$_$(_yield, this, 1, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_key(child);
            case 1: return this.replace_val(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaValue {
        if (typeof s == "object")
            return s instanceof MediaValue;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaValue {
        return s.type == ASTType.MediaValue;
    }

    static Type(): ASTType.MediaValue {
        return ASTType.MediaValue;
    }

    get type(): ASTType.MediaValue {
        return ASTType.MediaValue;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.key.serialize(writer);

        this.val.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaValue {

        reader.assert_byte(0);


        var key = MediaName.Deserialize(reader);

        var val = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new MediaValue(key, val, tok);
    }
}



export class MediaEquality extends ASTNode<ASTType> {

    sym: Token;
    left: (MediaName | Number | Length | Ratio);
    right: (Number | Length | MediaName | Ratio);
    tok: Token;

    constructor(
        _sym: Token,
        _left: (MediaName | Number | Length | Ratio),
        _right: (Number | Length | MediaName | Ratio),
        _tok: Token,) {
        super();
        this.sym = _sym;
        this.left = _left;
        this.right = _right;
        this.tok = _tok;

    }
    replace_left(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (MediaName.nodeIs(child)
            || Number.nodeIs(child)
            || Length.nodeIs(child)
            || Ratio.nodeIs(child)) {

            let old = this.left;

            this.left = child;

            return old;
        }
        return null;
    }

    replace_right(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (Number.nodeIs(child)
            || Length.nodeIs(child)
            || MediaName.nodeIs(child)
            || Ratio.nodeIs(child)) {

            let old = this.right;

            this.right = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.left.$$____Iterate_$_$_$(_yield, this, 0, 0);

        this.right.$$____Iterate_$_$_$(_yield, this, 1, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_left(child);
            case 1: return this.replace_right(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaEquality {
        if (typeof s == "object")
            return s instanceof MediaEquality;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaEquality {
        return s.type == ASTType.MediaEquality;
    }

    static Type(): ASTType.MediaEquality {
        return ASTType.MediaEquality;
    }

    get type(): ASTType.MediaEquality {
        return ASTType.MediaEquality;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.sym.serialize(writer);

        this.left.serialize(writer);

        this.right.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaEquality {

        reader.assert_byte(0);


        var sym = Token.Deserialize(reader);

        var left = Deserialize(reader);

        var right = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new MediaEquality(sym, left, right, tok);
    }
}



export class MediaRangeDescending extends ASTNode<ASTType> {

    sym1: Token;
    sym2: Token;
    max: (Number | Length | MediaName | Ratio);
    id: Token;
    min: (Number | Length | MediaName | Ratio);
    tok: Token;

    constructor(
        _sym1: Token,
        _sym2: Token,
        _max: (Number | Length | MediaName | Ratio),
        _id: Token,
        _min: (Number | Length | MediaName | Ratio),
        _tok: Token,) {
        super();
        this.sym1 = _sym1;
        this.sym2 = _sym2;
        this.max = _max;
        this.id = _id;
        this.min = _min;
        this.tok = _tok;

    }
    replace_max(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (Number.nodeIs(child)
            || Length.nodeIs(child)
            || MediaName.nodeIs(child)
            || Ratio.nodeIs(child)) {

            let old = this.max;

            this.max = child;

            return old;
        }
        return null;
    }

    replace_min(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (Number.nodeIs(child)
            || Length.nodeIs(child)
            || MediaName.nodeIs(child)
            || Ratio.nodeIs(child)) {

            let old = this.min;

            this.min = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.max.$$____Iterate_$_$_$(_yield, this, 0, 0);

        this.min.$$____Iterate_$_$_$(_yield, this, 1, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_max(child);
            case 1: return this.replace_min(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaRangeDescending {
        if (typeof s == "object")
            return s instanceof MediaRangeDescending;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaRangeDescending {
        return s.type == ASTType.MediaRangeDescending;
    }

    static Type(): ASTType.MediaRangeDescending {
        return ASTType.MediaRangeDescending;
    }

    get type(): ASTType.MediaRangeDescending {
        return ASTType.MediaRangeDescending;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.sym1.serialize(writer);

        this.sym2.serialize(writer);

        this.max.serialize(writer);

        this.id.serialize(writer);

        this.min.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaRangeDescending {

        reader.assert_byte(0);


        var sym1 = Token.Deserialize(reader);

        var sym2 = Token.Deserialize(reader);

        var max = Deserialize(reader);

        var id = Token.Deserialize(reader);

        var min = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new MediaRangeDescending(sym1, sym2, max, id, min, tok);
    }
}



export class MediaRangeAscending extends ASTNode<ASTType> {

    sym1: Token;
    sym2: Token;
    min: (Number | Length | MediaName | Ratio);
    id: Token;
    max: (Number | Length | MediaName | Ratio);
    tok: Token;

    constructor(
        _sym1: Token,
        _sym2: Token,
        _min: (Number | Length | MediaName | Ratio),
        _id: Token,
        _max: (Number | Length | MediaName | Ratio),
        _tok: Token,) {
        super();
        this.sym1 = _sym1;
        this.sym2 = _sym2;
        this.min = _min;
        this.id = _id;
        this.max = _max;
        this.tok = _tok;

    }
    replace_min(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (Number.nodeIs(child)
            || Length.nodeIs(child)
            || MediaName.nodeIs(child)
            || Ratio.nodeIs(child)) {

            let old = this.min;

            this.min = child;

            return old;
        }
        return null;
    }

    replace_max(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (Number.nodeIs(child)
            || Length.nodeIs(child)
            || MediaName.nodeIs(child)
            || Ratio.nodeIs(child)) {

            let old = this.max;

            this.max = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.min.$$____Iterate_$_$_$(_yield, this, 0, 0);

        this.max.$$____Iterate_$_$_$(_yield, this, 1, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_min(child);
            case 1: return this.replace_max(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaRangeAscending {
        if (typeof s == "object")
            return s instanceof MediaRangeAscending;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaRangeAscending {
        return s.type == ASTType.MediaRangeAscending;
    }

    static Type(): ASTType.MediaRangeAscending {
        return ASTType.MediaRangeAscending;
    }

    get type(): ASTType.MediaRangeAscending {
        return ASTType.MediaRangeAscending;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.sym1.serialize(writer);

        this.sym2.serialize(writer);

        this.min.serialize(writer);

        this.id.serialize(writer);

        this.max.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaRangeAscending {

        reader.assert_byte(0);


        var sym1 = Token.Deserialize(reader);

        var sym2 = Token.Deserialize(reader);

        var min = Deserialize(reader);

        var id = Token.Deserialize(reader);

        var max = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new MediaRangeAscending(sym1, sym2, min, id, max, tok);
    }
}



export class MediaName extends ASTNode<ASTType> {

    val: Token;
    tok: Token;

    constructor(
        _val: Token,
        _tok: Token,) {
        super();
        this.val = _val;
        this.tok = _tok;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaName {
        if (typeof s == "object")
            return s instanceof MediaName;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaName {
        return s.type == ASTType.MediaName;
    }

    static Type(): ASTType.MediaName {
        return ASTType.MediaName;
    }

    get type(): ASTType.MediaName {
        return ASTType.MediaName;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.val.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaName {

        reader.assert_byte(0);


        var val = Token.Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new MediaName(val, tok);
    }
}



export class MediaType extends ASTNode<ASTType> {

    val: Token;
    tok: Token;

    constructor(
        _val: Token,
        _tok: Token,) {
        super();
        this.val = _val;
        this.tok = _tok;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is MediaType {
        if (typeof s == "object")
            return s instanceof MediaType;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is MediaType {
        return s.type == ASTType.MediaType;
    }

    static Type(): ASTType.MediaType {
        return ASTType.MediaType;
    }

    get type(): ASTType.MediaType {
        return ASTType.MediaType;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.val.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): MediaType {

        reader.assert_byte(0);


        var val = Token.Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new MediaType(val, tok);
    }
}



export class Boolean extends ASTNode<ASTType> {

    val: boolean;
    tok: Token;

    constructor(
        _val: boolean,
        _tok: Token,) {
        super();
        this.val = _val;
        this.tok = _tok;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Boolean {
        if (typeof s == "object")
            return s instanceof Boolean;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Boolean {
        return s.type == ASTType.Boolean;
    }

    static Type(): ASTType.Boolean {
        return ASTType.Boolean;
    }

    get type(): ASTType.Boolean {
        return ASTType.Boolean;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);
        writer.write_byte(this.val == true ? 1 : 0);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Boolean {

        reader.assert_byte(0);

        var val = !!reader.read_byte();

        var tok = Token.Deserialize(reader);

        return new Boolean(val, tok);
    }
}



export class Ratio extends ASTNode<ASTType> {

    numerator: Number;
    denominator: Number;
    tok: Token;

    constructor(
        _numerator: Number,
        _denominator: Number,
        _tok: Token,) {
        super();
        this.numerator = _numerator;
        this.denominator = _denominator;
        this.tok = _tok;

    }
    replace_numerator(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (Number.nodeIs(child)) {

            let old = this.numerator;

            this.numerator = child;

            return old;
        }
        return null;
    }

    replace_denominator(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (Number.nodeIs(child)) {

            let old = this.denominator;

            this.denominator = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.numerator.$$____Iterate_$_$_$(_yield, this, 0, 0);

        this.denominator.$$____Iterate_$_$_$(_yield, this, 1, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_numerator(child);
            case 1: return this.replace_denominator(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Ratio {
        if (typeof s == "object")
            return s instanceof Ratio;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Ratio {
        return s.type == ASTType.Ratio;
    }

    static Type(): ASTType.Ratio {
        return ASTType.Ratio;
    }

    get type(): ASTType.Ratio {
        return ASTType.Ratio;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.numerator.serialize(writer);

        this.denominator.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Ratio {

        reader.assert_byte(0);


        var numerator = Number.Deserialize(reader);

        var denominator = Number.Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new Ratio(numerator, denominator, tok);
    }
}



export class Percentage extends ASTNode<ASTType> {

    value: string;
    tok: Token;

    constructor(
        _value: string,
        _tok: Token,) {
        super();
        this.value = _value;
        this.tok = _tok;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Percentage {
        if (typeof s == "object")
            return s instanceof Percentage;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Percentage {
        return s.type == ASTType.Percentage;
    }

    static Type(): ASTType.Percentage {
        return ASTType.Percentage;
    }

    get type(): ASTType.Percentage {
        return ASTType.Percentage;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);
        writer.write_string(this.value);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Percentage {

        reader.assert_byte(0);

        var value = reader.read_string();

        var tok = Token.Deserialize(reader);

        return new Percentage(value, tok);
    }
}



export class Length extends ASTNode<ASTType> {

    value: Number;
    unit: string;
    tok: Token;

    constructor(
        _value: Number,
        _unit: string,
        _tok: Token,) {
        super();
        this.value = _value;
        this.unit = _unit;
        this.tok = _tok;

    }
    replace_value(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (Number.nodeIs(child)) {

            let old = this.value;

            this.value = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.value.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_value(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Length {
        if (typeof s == "object")
            return s instanceof Length;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Length {
        return s.type == ASTType.Length;
    }

    static Type(): ASTType.Length {
        return ASTType.Length;
    }

    get type(): ASTType.Length {
        return ASTType.Length;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.value.serialize(writer);
        writer.write_string(this.unit);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Length {

        reader.assert_byte(0);


        var value = Number.Deserialize(reader);
        var unit = reader.read_string();

        var tok = Token.Deserialize(reader);

        return new Length(value, unit, tok);
    }
}



export class URL extends ASTNode<ASTType> {

    value: string;
    tok: Token;

    constructor(
        _value: string,
        _tok: Token,) {
        super();
        this.value = _value;
        this.tok = _tok;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is URL {
        if (typeof s == "object")
            return s instanceof URL;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is URL {
        return s.type == ASTType.URL;
    }

    static Type(): ASTType.URL {
        return ASTType.URL;
    }

    get type(): ASTType.URL {
        return ASTType.URL;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);
        writer.write_string(this.value);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): URL {

        reader.assert_byte(0);

        var value = reader.read_string();

        var tok = Token.Deserialize(reader);

        return new URL(value, tok);
    }
}



export class String extends ASTNode<ASTType> {

    value: string;
    tok: Token;

    constructor(
        _value: string,
        _tok: Token,) {
        super();
        this.value = _value;
        this.tok = _tok;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is String {
        if (typeof s == "object")
            return s instanceof String;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is String {
        return s.type == ASTType.String;
    }

    static Type(): ASTType.String {
        return ASTType.String;
    }

    get type(): ASTType.String {
        return ASTType.String;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);
        writer.write_string(this.value);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): String {

        reader.assert_byte(0);

        var value = reader.read_string();

        var tok = Token.Deserialize(reader);

        return new String(value, tok);
    }
}



export class Number extends ASTNode<ASTType> {

    val: number;
    tok: Token;

    constructor(
        _val: number,
        _tok: Token,) {
        super();
        this.val = _val;
        this.tok = _tok;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Number {
        if (typeof s == "object")
            return s instanceof Number;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Number {
        return s.type == ASTType.Number;
    }

    static Type(): ASTType.Number {
        return ASTType.Number;
    }

    get type(): ASTType.Number {
        return ASTType.Number;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);
        writer.write_double(this.val);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Number {

        reader.assert_byte(0);

        var val = reader.read_double();

        var tok = Token.Deserialize(reader);

        return new Number(val, tok);
    }
}



export class Identifier extends ASTNode<ASTType> {

    val: string;
    tok: Token;

    constructor(
        _val: string,
        _tok: Token,) {
        super();
        this.val = _val;
        this.tok = _tok;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Identifier {
        if (typeof s == "object")
            return s instanceof Identifier;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Identifier {
        return s.type == ASTType.Identifier;
    }

    static Type(): ASTType.Identifier {
        return ASTType.Identifier;
    }

    get type(): ASTType.Identifier {
        return ASTType.Identifier;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);
        writer.write_string(this.val);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Identifier {

        reader.assert_byte(0);

        var val = reader.read_string();

        var tok = Token.Deserialize(reader);

        return new Identifier(val, tok);
    }
}



export class IdSelector extends ASTNode<ASTType> {

    val: Token;
    tok: Token;
    precedence: number;

    constructor(
        _val: Token,
        _tok: Token,
        _precedence: number,) {
        super();
        this.val = _val;
        this.tok = _tok;
        this.precedence = _precedence;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is IdSelector {
        if (typeof s == "object")
            return s instanceof IdSelector;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is IdSelector {
        return s.type == ASTType.IdSelector;
    }

    static Type(): ASTType.IdSelector {
        return ASTType.IdSelector;
    }

    get type(): ASTType.IdSelector {
        return ASTType.IdSelector;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.val.serialize(writer);

        this.tok.serialize(writer);
        writer.write_double(this.precedence);
    }

    static Deserialize(reader: ByteReader): IdSelector {

        reader.assert_byte(0);


        var val = Token.Deserialize(reader);

        var tok = Token.Deserialize(reader);
        var precedence = reader.read_double();

        return new IdSelector(val, tok, precedence);
    }
}



export class ClassSelector extends ASTNode<ASTType> {

    val: Token;
    tok: Token;
    precedence: number;

    constructor(
        _val: Token,
        _tok: Token,
        _precedence: number,) {
        super();
        this.val = _val;
        this.tok = _tok;
        this.precedence = _precedence;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is ClassSelector {
        if (typeof s == "object")
            return s instanceof ClassSelector;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is ClassSelector {
        return s.type == ASTType.ClassSelector;
    }

    static Type(): ASTType.ClassSelector {
        return ASTType.ClassSelector;
    }

    get type(): ASTType.ClassSelector {
        return ASTType.ClassSelector;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.val.serialize(writer);

        this.tok.serialize(writer);
        writer.write_double(this.precedence);
    }

    static Deserialize(reader: ByteReader): ClassSelector {

        reader.assert_byte(0);


        var val = Token.Deserialize(reader);

        var tok = Token.Deserialize(reader);
        var precedence = reader.read_double();

        return new ClassSelector(val, tok, precedence);
    }
}



export class PseudoClassSelector extends ASTNode<ASTType> {

    id: Token;
    val: string;
    tok: Token;
    precedence: number;

    constructor(
        _id: Token,
        _val: string,
        _tok: Token,
        _precedence: number,) {
        super();
        this.id = _id;
        this.val = _val;
        this.tok = _tok;
        this.precedence = _precedence;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is PseudoClassSelector {
        if (typeof s == "object")
            return s instanceof PseudoClassSelector;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is PseudoClassSelector {
        return s.type == ASTType.PseudoClassSelector;
    }

    static Type(): ASTType.PseudoClassSelector {
        return ASTType.PseudoClassSelector;
    }

    get type(): ASTType.PseudoClassSelector {
        return ASTType.PseudoClassSelector;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.id.serialize(writer);
        writer.write_string(this.val);

        this.tok.serialize(writer);
        writer.write_double(this.precedence);
    }

    static Deserialize(reader: ByteReader): PseudoClassSelector {

        reader.assert_byte(0);


        var id = Token.Deserialize(reader);
        var val = reader.read_string();

        var tok = Token.Deserialize(reader);
        var precedence = reader.read_double();

        return new PseudoClassSelector(id, val, tok, precedence);
    }
}



export class PseudoElementSelector extends ASTNode<ASTType> {

    id: Token;
    val: string;
    tok: Token;
    precedence: number;

    constructor(
        _id: Token,
        _val: string,
        _tok: Token,
        _precedence: number,) {
        super();
        this.id = _id;
        this.val = _val;
        this.tok = _tok;
        this.precedence = _precedence;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is PseudoElementSelector {
        if (typeof s == "object")
            return s instanceof PseudoElementSelector;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is PseudoElementSelector {
        return s.type == ASTType.PseudoElementSelector;
    }

    static Type(): ASTType.PseudoElementSelector {
        return ASTType.PseudoElementSelector;
    }

    get type(): ASTType.PseudoElementSelector {
        return ASTType.PseudoElementSelector;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.id.serialize(writer);
        writer.write_string(this.val);

        this.tok.serialize(writer);
        writer.write_double(this.precedence);
    }

    static Deserialize(reader: ByteReader): PseudoElementSelector {

        reader.assert_byte(0);


        var id = Token.Deserialize(reader);
        var val = reader.read_string();

        var tok = Token.Deserialize(reader);
        var precedence = reader.read_double();

        return new PseudoElementSelector(id, val, tok, precedence);
    }
}



export class AttributeSelector extends ASTNode<ASTType> {

    name: QualifiedName;
    tok: Token;
    precedence: number;
    match_type: Token | null;
    match_val: (String | Identifier) | null;
    mod: Token | null;

    constructor(
        _name: QualifiedName,
        _tok: Token,
        _precedence: number,
        _match_type: Token | null,
        _match_val: (String | Identifier) | null,
        _mod: Token | null,) {
        super();
        this.name = _name;
        this.tok = _tok;
        this.precedence = _precedence;
        this.match_type = _match_type;
        this.match_val = _match_val;
        this.mod = _mod;

    }
    replace_name(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (QualifiedName.nodeIs(child)) {

            let old = this.name;

            this.name = child;

            return old;
        }
        return null;
    }

    replace_match_val(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (child === null) {
            let old = this.match_val;

            this.match_val = null;

            return old;
        }
        else
            if (String.nodeIs(child)
                || Identifier.nodeIs(child)) {

                let old = this.match_val;

                this.match_val = child;

                return old;
            }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.name.$$____Iterate_$_$_$(_yield, this, 0, 0);

        if (this.match_val instanceof ASTNode)
            this.match_val.$$____Iterate_$_$_$(_yield, this, 1, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_name(child);
            case 1: return this.replace_match_val(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is AttributeSelector {
        if (typeof s == "object")
            return s instanceof AttributeSelector;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is AttributeSelector {
        return s.type == ASTType.AttributeSelector;
    }

    static Type(): ASTType.AttributeSelector {
        return ASTType.AttributeSelector;
    }

    get type(): ASTType.AttributeSelector {
        return ASTType.AttributeSelector;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.name.serialize(writer);

        this.tok.serialize(writer);
        writer.write_double(this.precedence);

        if (!this.match_type)
            writer.write_null();
        else
            this.match_type.serialize(writer);


        if (!this.match_val)
            writer.write_null();
        else
            this.match_val.serialize(writer);


        if (!this.mod)
            writer.write_null();
        else
            this.mod.serialize(writer);

    }

    static Deserialize(reader: ByteReader): AttributeSelector {

        reader.assert_byte(0);


        var name = QualifiedName.Deserialize(reader);

        var tok = Token.Deserialize(reader);
        var precedence = reader.read_double();

        var match_type = reader.assert_null() ? null : Token.Deserialize(reader);

        var match_val = reader.assert_null() ? null : Deserialize(reader);

        var mod = reader.assert_null() ? null : Token.Deserialize(reader);

        return new AttributeSelector(name, tok, precedence, match_type, match_val, mod);
    }
}



export class TypeSelector extends ASTNode<ASTType> {

    name: QualifiedName;
    tok: Token;

    constructor(
        _name: QualifiedName,
        _tok: Token,) {
        super();
        this.name = _name;
        this.tok = _tok;

    }
    replace_name(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (QualifiedName.nodeIs(child)) {

            let old = this.name;

            this.name = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.name.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_name(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is TypeSelector {
        if (typeof s == "object")
            return s instanceof TypeSelector;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is TypeSelector {
        return s.type == ASTType.TypeSelector;
    }

    static Type(): ASTType.TypeSelector {
        return ASTType.TypeSelector;
    }

    get type(): ASTType.TypeSelector {
        return ASTType.TypeSelector;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.name.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): TypeSelector {

        reader.assert_byte(0);


        var name = QualifiedName.Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new TypeSelector(name, tok);
    }
}



export class QualifiedName extends ASTNode<ASTType> {

    namespace: string;
    val: string;
    tok: Token;
    precedence: number;
    name: string;

    constructor(
        _namespace: string,
        _val: string,
        _tok: Token,
        _precedence: number,
        _name: string,) {
        super();
        this.namespace = _namespace;
        this.val = _val;
        this.tok = _tok;
        this.precedence = _precedence;
        this.name = _name;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is QualifiedName {
        if (typeof s == "object")
            return s instanceof QualifiedName;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is QualifiedName {
        return s.type == ASTType.QualifiedName;
    }

    static Type(): ASTType.QualifiedName {
        return ASTType.QualifiedName;
    }

    get type(): ASTType.QualifiedName {
        return ASTType.QualifiedName;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);
        writer.write_string(this.namespace);
        writer.write_string(this.val);

        this.tok.serialize(writer);
        writer.write_double(this.precedence);
        writer.write_string(this.name);
    }

    static Deserialize(reader: ByteReader): QualifiedName {

        reader.assert_byte(0);

        var namespace = reader.read_string();
        var val = reader.read_string();

        var tok = Token.Deserialize(reader);
        var precedence = reader.read_double();
        var name = reader.read_string();

        return new QualifiedName(namespace, val, tok, precedence, name);
    }
}



export class Property extends ASTNode<ASTType> {

    name: string;
    value: string;
    important: boolean;

    constructor(
        _name: string,
        _value: string,
        _important: boolean,) {
        super();
        this.name = _name;
        this.value = _value;
        this.important = _important;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Property {
        if (typeof s == "object")
            return s instanceof Property;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Property {
        return s.type == ASTType.Property;
    }

    static Type(): ASTType.Property {
        return ASTType.Property;
    }

    get type(): ASTType.Property {
        return ASTType.Property;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);
        writer.write_string(this.name);
        writer.write_string(this.value);
        writer.write_byte(this.important == true ? 1 : 0);
    }

    static Deserialize(reader: ByteReader): Property {

        reader.assert_byte(0);

        var name = reader.read_string();
        var value = reader.read_string();
        var important = !!reader.read_byte();

        return new Property(name, value, important);
    }
}



export class Selector extends ASTNode<ASTType> {

    val: (c_C_SPECIFIER | c_D_SPECIFIER | c_B_SPECIFIER | Combinator)[];

    constructor(
        _val: (c_C_SPECIFIER | c_D_SPECIFIER | c_B_SPECIFIER | Combinator)[],) {
        super();
        this.val = _val;

    }
    replace_val(child: ASTNode<ASTType>, j: number): null | ASTNode<ASTType> {

        if (child === null) {
            if (j < this.val.length && j >= 0) {
                return this.val.splice(j, 1)[0];
            }
        } else if (isC_SPECIFIER(child)
            || isD_SPECIFIER(child)
            || isB_SPECIFIER(child)
            || Combinator.nodeIs(child)) {
            if (j < 0) {
                this.val.unshift(child);
            } else if (j >= this.val.length) {
                this.val.push(child);
            } else {
                return this.val.splice(j, 1, child)[0];
            }
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        for (let i = 0; i < this.val.length; i++) {
            this.val[i].$$____Iterate_$_$_$(_yield, this, 0, i);
        }
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_val(child, j);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Selector {
        if (typeof s == "object")
            return s instanceof Selector;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Selector {
        return s.type == ASTType.Selector;
    }

    static Type(): ASTType.Selector {
        return ASTType.Selector;
    }

    get type(): ASTType.Selector {
        return ASTType.Selector;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        SerializeStructVector(this.val, writer);
    }

    static Deserialize(reader: ByteReader): Selector {

        reader.assert_byte(0);


        var val = Deserialize(reader);

        return new Selector(val);
    }
}



export class And extends ASTNode<ASTType> {

    supports: (SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction);
    tok: Token;

    constructor(
        _supports: (SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction),
        _tok: Token,) {
        super();
        this.supports = _supports;
        this.tok = _tok;

    }
    replace_supports(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (SupportsParenthesis.nodeIs(child)
            || SupportsSelector.nodeIs(child)
            || SupportDeclaration.nodeIs(child)
            || MediaFunction.nodeIs(child)) {

            let old = this.supports;

            this.supports = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.supports.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_supports(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is And {
        if (typeof s == "object")
            return s instanceof And;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is And {
        return s.type == ASTType.And;
    }

    static Type(): ASTType.And {
        return ASTType.And;
    }

    get type(): ASTType.And {
        return ASTType.And;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.supports.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): And {

        reader.assert_byte(0);


        var supports = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new And(supports, tok);
    }
}



export class Or extends ASTNode<ASTType> {

    supports: (SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction);
    tok: Token;

    constructor(
        _supports: (SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction),
        _tok: Token,) {
        super();
        this.supports = _supports;
        this.tok = _tok;

    }
    replace_supports(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (SupportsParenthesis.nodeIs(child)
            || SupportsSelector.nodeIs(child)
            || SupportDeclaration.nodeIs(child)
            || MediaFunction.nodeIs(child)) {

            let old = this.supports;

            this.supports = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.supports.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_supports(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Or {
        if (typeof s == "object")
            return s instanceof Or;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Or {
        return s.type == ASTType.Or;
    }

    static Type(): ASTType.Or {
        return ASTType.Or;
    }

    get type(): ASTType.Or {
        return ASTType.Or;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.supports.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Or {

        reader.assert_byte(0);


        var supports = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new Or(supports, tok);
    }
}



export class Combinator extends ASTNode<ASTType> {

    val: Token;

    constructor(
        _val: Token,) {
        super();
        this.val = _val;

    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

    }

    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null { return null; }


    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Combinator {
        if (typeof s == "object")
            return s instanceof Combinator;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Combinator {
        return s.type == ASTType.Combinator;
    }

    static Type(): ASTType.Combinator {
        return ASTType.Combinator;
    }

    get type(): ASTType.Combinator {
        return ASTType.Combinator;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.val.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Combinator {

        reader.assert_byte(0);


        var val = Token.Deserialize(reader);

        return new Combinator(val);
    }
}



export class Not extends ASTNode<ASTType> {

    supports: (SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction);
    tok: Token;

    constructor(
        _supports: (SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction),
        _tok: Token,) {
        super();
        this.supports = _supports;
        this.tok = _tok;

    }
    replace_supports(child: ASTNode<ASTType>): null | ASTNode<ASTType> {

        if (SupportsParenthesis.nodeIs(child)
            || SupportsSelector.nodeIs(child)
            || SupportDeclaration.nodeIs(child)
            || MediaFunction.nodeIs(child)) {

            let old = this.supports;

            this.supports = child;

            return old;
        }
        return null;
    }

    $$____Iterate_$_$_$(
        _yield: (a: ASTNode<ASTType>, b: ASTNode<ASTType>, c: number, d: number) => boolean,
        parent: ASTNode<ASTType>,
        i: number,
        j: number,
    ) {
        if (!_yield(this, parent, i, j)) { return; };

        this.supports.$$____Iterate_$_$_$(_yield, this, 0, 0);
    }
    Replace(child: ASTNode<ASTType>, i: number, j: number): ASTNode<ASTType> | null {

        switch (i) {
            case 0: return this.replace_supports(child);
        }
        return null;
    }

    /* Token(): Token{
        return this.tok;
    } */

    static is(s: any): s is Not {
        if (typeof s == "object")
            return s instanceof Not;
        return false;
    }

    static nodeIs(s: ASTNode<ASTType>): s is Not {
        return s.type == ASTType.Not;
    }

    static Type(): ASTType.Not {
        return ASTType.Not;
    }

    get type(): ASTType.Not {
        return ASTType.Not;
    }

    serialize(writer: ByteWriter) {

        writer.write_byte(0);

        this.supports.serialize(writer);

        this.tok.serialize(writer);
    }

    static Deserialize(reader: ByteReader): Not {

        reader.assert_byte(0);


        var supports = Deserialize(reader);

        var tok = Token.Deserialize(reader);

        return new Not(supports, tok);
    }
}



/**
```
{ t_Stylesheet, c_RuleParent, rules:$1, tok }
```*/
function _FN0_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Stylesheet = new Stylesheet(
        v0,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Stylesheet, c_RuleParent, rules:$NULL, tok }
```*/
function _FN1_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Stylesheet = new Stylesheet(
        [],
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_Rule,

    selectors:$1,

    properties:$3,

    tok,

    parent:c_RuleParent
 }
```*/
function _FN2_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Rule = new Rule(
        v0,
        v2,
        tok,
        null,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_Rule,

    selectors:$1,

    properties:$NULL,

    tok,

    parent:c_RuleParent
 }
```*/
function _FN3_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Rule = new Rule(
        v0,
        [],
        tok,
        null,
    );;

    args.push(ref_0);
}
/**
```
{ t_FontFace, descriptors:$3, tok }
```*/
function _FN4_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: FontFace = new FontFace(
        v2,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_FontFace, descriptors:$NULL, tok }
```*/
function _FN5_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: FontFace = new FontFace(
        [],
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_Keyframes,

    name:$3,

    keyframes:$4,

    tok,

    parent:c_RuleParent
 }
```*/
function _FN6_(args: any[], tok: Token): any {
    let v4 = args.pop();
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Keyframes = new Keyframes(
        v2,
        v3,
        tok,
        null,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_Supports,

    c_RuleParent,

    condition:$2,

    rules:$4,

    tok,

    parent:c_RuleParent
 }
```*/
function _FN7_(args: any[], tok: Token): any {
    let v4 = args.pop();
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Supports = new Supports(
        v1,
        v3,
        tok,
        null,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_Supports,

    c_RuleParent,

    condition:$2,

    rules:$NULL,

    tok,

    parent:c_RuleParent
 }
```*/
function _FN8_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Supports = new Supports(
        v1,
        [],
        tok,
        null,
    );;

    args.push(ref_0);
}
/**
```
{ t_Import, uri:$2, condition:$3, media:$4, tok }
```*/
function _FN9_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Import = new Import(
        v1,
        v2,
        v3,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Import, uri:$2, condition:$NULL, media:$3, tok }
```*/
function _FN10_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Import = new Import(
        v1,
        [],
        v2,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Import, uri:$2, condition:$3, media:$NULL, tok }
```*/
function _FN11_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Import = new Import(
        v1,
        v2,
        [],
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Import, uri:$2, condition:$NULL, media:$NULL, tok }
```*/
function _FN12_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Import = new Import(
        v1,
        [],
        [],
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_CharSet, value:$2, tok }
```*/
function _FN13_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: CharSet = new CharSet(
        v1,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Media, c_RuleParent, queries:$2, rules:$4, tok }
```*/
function _FN14_(args: any[], tok: Token): any {
    let v4 = args.pop();
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Media = new Media(
        v1,
        v3,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Media, c_RuleParent, queries:$2, rules:$NULL, tok }
```*/
function _FN15_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Media = new Media(
        v1,
        [],
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Page, selector:$2, rules:$4, tok }
```*/
function _FN16_(args: any[], tok: Token): any {
    let v4 = args.pop();
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Page = new Page(
        v1,
        v3,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Page, selector:$NULL, rules:$3, tok }
```*/
function _FN17_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Page = new Page(
        null,
        v2,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Page, selector:$2, rules:$NULL, tok }
```*/
function _FN18_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Page = new Page(
        v1,
        [],
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Page, selector:$NULL, rules:$NULL, tok }
```*/
function _FN19_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Page = new Page(
        null,
        [],
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_UnknownAtRule, name:str($2), value:str($4), tok }
```*/
function _FN20_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: UnknownAtRule = new UnknownAtRule(
        v1.toString(),
        "",
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_UnknownAtRule, name:str($2), value:str($3), tok }
```*/
function _FN21_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: UnknownAtRule = new UnknownAtRule(
        v1.toString(),
        "",
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_KeyframeBlock, selectors:$1, properties:$3, tok }
```*/
function _FN22_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: KeyframeBlock = new KeyframeBlock(
        v0,
        v2,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_KeyframeBlock, selectors:$1, properties:$NULL, tok }
```*/
function _FN23_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: KeyframeBlock = new KeyframeBlock(
        v0,
        [],
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_KeyframeSelector, val:{ t_KeyFrameTo }, tok }
```*/
function _FN24_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: KeyFrameTo = new KeyFrameTo(

    );;
    let ref_1: KeyframeSelector = new KeyframeSelector(
        ref_0,
        tok,
    );;

    args.push(ref_1);
}
/**
```
{ t_KeyframeSelector, val:{ t_KeyFrameFrom }, tok }
```*/
function _FN25_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: KeyFrameFrom = new KeyFrameFrom(

    );;
    let ref_1: KeyframeSelector = new KeyframeSelector(
        ref_0,
        tok,
    );;

    args.push(ref_1);
}
/**
```
{ t_KeyframeSelector, val:$1, tok }
```*/
function _FN26_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: KeyframeSelector = new KeyframeSelector(
        v0,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_SupportsParenthesis, supports:$2, tok }
```*/
function _FN27_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: SupportsParenthesis = new SupportsParenthesis(
        v1,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_SupportDeclaration, declaration:$2, tok }
```*/
function _FN28_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: SupportDeclaration = new SupportDeclaration(
        v1,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_SupportsSelector, selectors:$3, tok }
```*/
function _FN29_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: SupportsSelector = new SupportsSelector(
        v2,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Condition, condition:$1, tok }
```*/
function _FN30_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Condition = new Condition(
        v0,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Type, modifier:str($1), val:$2, and:$4, tok }
```*/
function _FN31_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Type = new Type(
        v0.toString(),
        v1,
        v3,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Type, modifier:str($NULL), val:$1, and:$3, tok }
```*/
function _FN32_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Type = new Type(
        "",
        v0,
        v2,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Type, modifier:str($1), val:$2, and:$NULL, tok }
```*/
function _FN33_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Type = new Type(
        v0.toString(),
        v1,
        null,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Type, modifier:str($NULL), val:$1, and:$NULL, tok }
```*/
function _FN34_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Type = new Type(
        "",
        v0,
        null,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_MediaOr, left:$1, right:$2, tok }
```*/
function _FN35_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: MediaOr = new MediaOr(
        v0,
        v1,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_MediaNot, media:$2, tok }
```*/
function _FN36_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: MediaNot = new MediaNot(
        v1,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_MediaAnd, left:$1, right:$2, tok }
```*/
function _FN37_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: MediaAnd = new MediaAnd(
        v0,
        v1,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_MediaParenthesis, media:$2, tok }
```*/
function _FN38_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: MediaParenthesis = new MediaParenthesis(
        v1,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_MediaFeature, feature:$2, tok }
```*/
function _FN39_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: MediaFeature = new MediaFeature(
        v1,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_MediaFunction, name:$1, value:str($3), tok }
```*/
function _FN40_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: MediaFunction = new MediaFunction(
        v0,
        v2,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_MediaFunction, name:$1, value:str($NULL), tok }
```*/
function _FN41_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: MediaFunction = new MediaFunction(
        v0,
        "",
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_MediaValue, key:$1, val:$3, tok }
```*/
function _FN42_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: MediaValue = new MediaValue(
        v0,
        v2,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_MediaEquality, sym:$2, left:$1, right:$3, tok }
```*/
function _FN43_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: MediaEquality = new MediaEquality(
        v1,
        v0,
        v2,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_MediaRangeDescending,

    sym1:$2,

    sym2:$4,

    max:$1,

    id:$3,

    min:$5,

    tok
 }
```*/
function _FN44_(args: any[], tok: Token): any {
    let v4 = args.pop();
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: MediaRangeDescending = new MediaRangeDescending(
        v1,
        v3,
        v0,
        v2,
        v4,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_MediaRangeAscending,

    sym1:$2,

    sym2:$4,

    min:$1,

    id:$3,

    max:$5,

    tok
 }
```*/
function _FN45_(args: any[], tok: Token): any {
    let v4 = args.pop();
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: MediaRangeAscending = new MediaRangeAscending(
        v1,
        v3,
        v0,
        v2,
        v4,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_MediaName, val:$1, tok }
```*/
function _FN46_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: MediaName = new MediaName(
        v0,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_MediaType, val:$1, tok }
```*/
function _FN47_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: MediaType = new MediaType(
        v0,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Boolean, val:true, tok, tok }
```*/
function _FN48_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Boolean = new Boolean(
        true,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Boolean, val:false, tok, tok }
```*/
function _FN49_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Boolean = new Boolean(
        false,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Ratio, numerator:$1, denominator:$3, tok }
```*/
function _FN50_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Ratio = new Ratio(
        v0,
        v2,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Percentage, value:str($1), tok }
```*/
function _FN51_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Percentage = new Percentage(
        v0.toString(),
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Length, value:$1, unit:str($2), tok }
```*/
function _FN52_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Length = new Length(
        v0,
        v1.toString(),
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_URL, value:str($3), tok }
```*/
function _FN53_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: URL = new URL(
        v2.toString(),
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_String, value:str($2), tok }
```*/
function _FN54_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: String = new String(
        v1,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_String, value:str($NULL), tok }
```*/
function _FN55_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: String = new String(
        "",
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Number, val:f64($1), tok }
```*/
function _FN56_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Number = new Number(
        parseFloat(v0.toString()),
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Identifier, val:str($1), tok }
```*/
function _FN57_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Identifier = new Identifier(
        v0.toString(),
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_IdSelector,

    c_B_SPECIFIER,

    val:$2,

    tok,

    precedence:0
 }
```*/
function _FN58_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: IdSelector = new IdSelector(
        v1,
        tok,
        0.0,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_ClassSelector,

    val:$2,

    tok,

    precedence:0,

    c_C_SPECIFIER
 }
```*/
function _FN59_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: ClassSelector = new ClassSelector(
        v1,
        tok,
        0.0,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_PseudoClassSelector,

    id:$2,

    val:$3,

    tok,

    precedence:0,

    c_C_SPECIFIER
 }
```*/
function _FN60_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: PseudoClassSelector = new PseudoClassSelector(
        v1,
        v2,
        tok,
        0.0,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_PseudoClassSelector,

    id:$2,

    val:$NULL,

    tok,

    precedence:0,

    c_C_SPECIFIER
 }
```*/
function _FN61_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: PseudoClassSelector = new PseudoClassSelector(
        v1,
        '',
        tok,
        0.0,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_PseudoElementSelector,

    id:$2,

    val:$3,

    tok,

    precedence:0,

    c_D_SPECIFIER
 }
```*/
function _FN62_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: PseudoElementSelector = new PseudoElementSelector(
        v1,
        v2,
        tok,
        0.0,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_PseudoElementSelector,

    id:$2,

    val:$NULL,

    tok,

    precedence:0,

    c_D_SPECIFIER
 }
```*/
function _FN63_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: PseudoElementSelector = new PseudoElementSelector(
        v1,
        '',
        tok,
        0.0,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_AttributeSelector,

    name:$2,

    tok,

    precedence:0,

    c_C_SPECIFIER
 }
```*/
function _FN64_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: AttributeSelector = new AttributeSelector(
        v1,
        tok,
        0.0,
        null,
        null,
        null,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_AttributeSelector,

    name:$2,

    match_type:$3,

    match_val:$4,

    mod:$5,

    tok,

    precedence:0,

    c_C_SPECIFIER
 }
```*/
function _FN65_(args: any[], tok: Token): any {
    let v5 = args.pop();
    let v4 = args.pop();
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: AttributeSelector = new AttributeSelector(
        v1,
        tok,
        0.0,
        v2,
        v3,
        v4,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_AttributeSelector,

    name:$2,

    match_type:$3,

    match_val:$4,

    mod:$NULL,

    tok,

    precedence:0,

    c_C_SPECIFIER
 }
```*/
function _FN66_(args: any[], tok: Token): any {
    let v4 = args.pop();
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: AttributeSelector = new AttributeSelector(
        v1,
        tok,
        0.0,
        v2,
        v3,
        null,
    );;

    args.push(ref_0);
}
/**
```
{ t_TypeSelector, c_D_SPECIFIER, name:$1, tok }
```*/
function _FN67_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: TypeSelector = new TypeSelector(
        v0,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_TypeSelector,

    name:{ 

        t_QualifiedName,

        namespace:$1,

        val:"*",

        tok,

        precedence:0
     },

    tok
 }
```*/
function _FN68_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: QualifiedName = new QualifiedName(
        v0,
        "*",
        tok,
        0.0,
        '',
    );;
    let ref_1: TypeSelector = new TypeSelector(
        ref_0,
        tok,
    );;

    args.push(ref_1);
}
/**
```
{ 

    t_TypeSelector,

    name:{ 

        t_QualifiedName,

        namespace:$NULL,

        val:"*",

        tok,

        precedence:0
     },

    tok
 }
```*/
function _FN69_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: QualifiedName = new QualifiedName(
        '',
        "*",
        tok,
        0.0,
        '',
    );;
    let ref_1: TypeSelector = new TypeSelector(
        ref_0,
        tok,
    );;

    args.push(ref_1);
}
/**
```
{ t_QualifiedName, namespace:$1, name:str($2), tok }
```*/
function _FN70_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: QualifiedName = new QualifiedName(
        v0,
        '',
        tok,
        0,
        v1.toString(),
    );;

    args.push(ref_0);
}
/**
```
{ t_QualifiedName, namespace:$NULL, name:str($1), tok }
```*/
function _FN71_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: QualifiedName = new QualifiedName(
        '',
        '',
        tok,
        0,
        v0.toString(),
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_Property,

    name:str($1),

    value:str($3),

    important:bool($4)
 }
```*/
function _FN72_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Property = new Property(
        v0.toString(),
        v2,
        !!(v3),
    );;

    args.push(ref_0);
}
/**
```
{ 

    t_Property,

    name:str($1),

    value:str($3),

    important:bool($NULL)
 }
```*/
function _FN73_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Property = new Property(
        v0.toString(),
        v2,
        false,
    );;

    args.push(ref_0);
}
/**
```
{ t_Selector, val:$1 }
```*/
function _FN74_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Selector = new Selector(
        v0,
    );;

    args.push(ref_0);
}
/**
```
{ t_And, supports:$2, tok }
```*/
function _FN75_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: And = new And(
        v1,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Or, supports:$2, tok }
```*/
function _FN76_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Or = new Or(
        v1,
        tok,
    );;

    args.push(ref_0);
}
/**
```
{ t_Combinator, val:$1 }
```*/
function _FN77_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Combinator = new Combinator(
        v0,
    );;

    args.push(ref_0);
}
/**
```
[$1]
```*/
function _FN78_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (Rule)[] = [v0];

    args.push(ref_0);
}
/**
```
$__first__+$__last__
```*/
function _FN79_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    v0.push(v1);

    args.push(v0);
}
/**
```
$1
```*/
function _FN80_(args: any[], tok: Token): any {
    let v0 = args.pop();


    args.push(v0);
}
/**
```
$1
```*/
function _FN81_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();


    args.push(v0);
}
/**
```
[{ t_Not, supports:$2, tok }]
```*/
function _FN82_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Not = new Not(
        v1,
        tok,
    );;
    let ref_1: (Not)[] = [ref_0];

    args.push(ref_1);
}
/**
```
$1+$2
```*/
function _FN83_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    v0.push(...v1);

    args.push(v0);
}
/**
```
$1+$NULL
```*/
function _FN84_(args: any[], tok: Token): any {
    let v0 = args.pop();


    args.push(v0);
}
/**
```
[$1]
```*/
function _FN85_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (Condition | Type)[] = [v0];

    args.push(ref_0);
}
/**
```
$__first__+$__last__
```*/
function _FN86_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    v0.push(v2);

    args.push(v0);
}
/**
```
[$1]+$2+$3
```*/
function _FN87_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: (TypeSelector | TypeSelector | IdSelector | ClassSelector | AttributeSelector | PseudoClassSelector | PseudoElementSelector)[] = [v0];
    ref_0.push(...v1);
    ref_0.push(...v2);

    args.push(ref_0);
}
/**
```
[$NULL]+$1+$2
```*/
function _FN88_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: (IdSelector | ClassSelector | AttributeSelector | PseudoClassSelector | PseudoElementSelector)[] = [];
    ref_0.push(...v0);
    ref_0.push(...v1);

    args.push(ref_0);
}
/**
```
[$1]+$NULL+$2
```*/
function _FN89_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: (TypeSelector | TypeSelector | PseudoElementSelector | PseudoClassSelector)[] = [v0];
    ref_0.push(...v1);

    args.push(ref_0);
}
/**
```
[$1]+$2+$NULL
```*/
function _FN90_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: (TypeSelector | TypeSelector | IdSelector | ClassSelector | AttributeSelector | PseudoClassSelector)[] = [v0];
    ref_0.push(...v1);

    args.push(ref_0);
}
/**
```
[$NULL]+$NULL+$1
```*/
function _FN91_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (PseudoElementSelector | PseudoClassSelector)[] = [];
    ref_0.push(...v0);

    args.push(ref_0);
}
/**
```
[$NULL]+$1+$NULL
```*/
function _FN92_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (IdSelector | ClassSelector | AttributeSelector | PseudoClassSelector)[] = [];
    ref_0.push(...v0);

    args.push(ref_0);
}
/**
```
[$1]+$NULL+$NULL
```*/
function _FN93_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (TypeSelector | TypeSelector)[] = [v0];

    args.push(ref_0);
}
/**
```
str($1)
```*/
function _FN94_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();
    args.push(v0.toString());
}
/**
```
[$2]
```*/
function _FN95_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: (Property)[] = [v1];

    args.push(ref_0);
}
/**
```
$__first__+$__last__
```*/
function _FN96_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    v0.push(v3);

    args.push(v0);
}
/**
```
[$1]
```*/
function _FN97_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (Property)[] = [v0];

    args.push(ref_0);
}
/**
```
str(tok)
```*/
function _FN98_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();
    args.push(tok.toString());
}
/**
```
$1+""
```*/
function _FN99_(args: any[], tok: Token): any {
    let v0 = args.pop();
    args.push((v0).toString1());
}
/**
```
$1+$2
```*/
function _FN100_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();
    args.push(v0 + (v1).toString());
}
/**
```
[$1]
```*/
function _FN101_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (string | number | boolean | Token)[] = [];
    ref_0.push(v0);

    args.push(ref_0);
}
/**
```
$__first__+$__last__
```*/
function _FN102_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    v0.push(v2);

    args.push(v0);
}
/**
```
$2
```*/
function _FN103_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();
    args.push(v1);
}
/**
```
$1+$2
```*/
function _FN104_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();
    args.push(v0 + v1);
}
/**
```
$2+""
```*/
function _FN105_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();
    args.push((v1).toString1());
}
/**
```
$1+$3
```*/
function _FN106_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();
    args.push(v0 + (v2).toString());
}
/**
```
[$1]
```*/
function _FN107_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (Media | Import | Keyframes | Supports | CharSet | FontFace | UnknownAtRule)[] = [v0];

    args.push(ref_0);
}
/**
```
[$1]
```*/
function _FN108_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (Selector)[] = [v0];

    args.push(ref_0);
}
/**
```
[$1]
```*/
function _FN109_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (KeyframeBlock)[] = [v0];

    args.push(ref_0);
}
/**
```
$3
```*/
function _FN110_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();


    args.push(v2);
}
/**
```
[$1]
```*/
function _FN111_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (KeyframeSelector)[] = [v0];

    args.push(ref_0);
}
/**
```
[$1]
```*/
function _FN112_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (SupportsParenthesis | SupportsSelector | SupportDeclaration | MediaFunction)[] = [v0];

    args.push(ref_0);
}
/**
```
[$1]
```*/
function _FN113_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (Or)[] = [v0];

    args.push(ref_0);
}
/**
```
[$1]
```*/
function _FN114_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (And)[] = [v0];

    args.push(ref_0);
}
/**
```
[$1]
```*/
function _FN115_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Token[] = [v0];

    args.push(ref_0);
}
/**
```
$__first__+$__last__
```*/
function _FN116_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    v0.push(v1);

    args.push(v0);
}
/**
```
[$1]
```*/
function _FN117_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (string | number | boolean | Token)[] = [];
    ref_0.push(v0);

    args.push(ref_0);
}
/**
```
[$2]
```*/
function _FN118_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: Token[] = [v1];

    args.push(ref_0);
}
/**
```
[$1]
```*/
function _FN119_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: Combinator[] = [...v0];

    args.push(ref_0);
}
/**
```
[$1]
```*/
function _FN120_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (IdSelector | ClassSelector | AttributeSelector | PseudoClassSelector)[] = [v0];

    args.push(ref_0);
}
/**
```
[$1]
```*/
function _FN121_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: PseudoElementSelector[] = [...v0];

    args.push(ref_0);
}
/**
```
$1+$3
```*/
function _FN122_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();

    v2.push(v0);

    args.push(v2);
}
/**
```
$NULL+$2
```*/
function _FN123_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();


    args.push(v1);
}
/**
```
$1+$2
```*/
function _FN124_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    v1.push(v0);

    args.push(v1);
}
/**
```
[$1]+$2
```*/
function _FN125_(args: any[], tok: Token): any {
    let v1 = args.pop();
    let v0 = args.pop();

    let ref_0: (PseudoElementSelector | PseudoElementSelector | PseudoClassSelector)[] = [v0];
    ref_0.push(...v1);

    args.push(ref_0);
}
/**
```
[$1]+$NULL
```*/
function _FN126_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: (PseudoElementSelector | PseudoElementSelector)[] = [v0];

    args.push(ref_0);
}
/**
```
[$2]
```*/
function _FN127_(args: any[], tok: Token): any {
    let v0 = args.pop();

    let ref_0: null[] = [];

    args.push(ref_0);
}
/**
```

```*/
function _FN128_(args: any[], tok: Token): any { }
/**
```

```*/
function _FN129_(args: any[], tok: Token): any {
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();
    args.push(v2);
}
/**
```

```*/
function _FN130_(args: any[], tok: Token): any {
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();
    args.push(v3);
}
/**
```

```*/
function _FN131_(args: any[], tok: Token): any {
    let v6 = args.pop();
    let v5 = args.pop();
    let v4 = args.pop();
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();
    args.push(v6);
}
/**
```

```*/
function _FN132_(args: any[], tok: Token): any {
    let v5 = args.pop();
    let v4 = args.pop();
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();
    args.push(v5);
}
/**
```

```*/
function _FN133_(args: any[], tok: Token): any {
    let v4 = args.pop();
    let v3 = args.pop();
    let v2 = args.pop();
    let v1 = args.pop();
    let v0 = args.pop();
    args.push(v4);
}



export const FunctionMaps = [
    _FN128_,
    _FN0_,
    _FN1_,
    _FN2_,
    _FN3_,
    _FN78_,
    _FN79_,
    _FN80_,
    _FN81_,
    _FN80_,
    _FN80_,
    _FN81_,
    _FN81_,
    _FN81_,
    _FN80_,
    _FN80_,
    _FN80_,
    _FN80_,
    _FN4_,
    _FN5_,
    _FN6_,
    _FN7_,
    _FN8_,
    _FN9_,
    _FN9_,
    _FN10_,
    _FN10_,
    _FN11_,
    _FN11_,
    _FN12_,
    _FN12_,
    _FN13_,
    _FN14_,
    _FN15_,
    _FN16_,
    _FN17_,
    _FN18_,
    _FN19_,
    _FN20_,
    _FN21_,
    _FN128_,
    _FN128_,
    _FN22_,
    _FN23_,
    _FN24_,
    _FN25_,
    _FN26_,
    _FN82_,
    _FN83_,
    _FN84_,
    _FN27_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN28_,
    _FN29_,
    _FN85_,
    _FN86_,
    _FN30_,
    _FN31_,
    _FN32_,
    _FN31_,
    _FN33_,
    _FN34_,
    _FN33_,
    _FN128_,
    _FN35_,
    _FN128_,
    _FN36_,
    _FN128_,
    _FN37_,
    _FN128_,
    _FN36_,
    _FN128_,
    _FN38_,
    _FN128_,
    _FN128_,
    _FN39_,
    _FN39_,
    _FN39_,
    _FN40_,
    _FN41_,
    _FN42_,
    _FN43_,
    _FN43_,
    _FN44_,
    _FN45_,
    _FN43_,
    _FN43_,
    _FN43_,
    _FN43_,
    _FN43_,
    _FN43_,
    _FN43_,
    _FN43_,
    _FN44_,
    _FN44_,
    _FN45_,
    _FN45_,
    _FN44_,
    _FN45_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN46_,
    _FN47_,
    _FN128_,
    _FN123_,
    _FN128_,
    _FN123_,
    _FN123_,
    _FN123_,
    _FN123_,
    _FN129_,
    _FN123_,
    _FN128_,
    _FN48_,
    _FN49_,
    _FN50_,
    _FN51_,
    _FN52_,
    _FN52_,
    _FN53_,
    _FN54_,
    _FN54_,
    _FN55_,
    _FN55_,
    _FN56_,
    _FN129_,
    _FN128_,
    _FN130_,
    _FN128_,
    _FN130_,
    _FN129_,
    _FN129_,
    _FN57_,
    _FN128_,
    _FN123_,
    _FN123_,
    _FN123_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN131_,
    _FN132_,
    _FN133_,
    _FN130_,
    _FN129_,
    _FN123_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN83_,
    _FN128_,
    _FN87_,
    _FN88_,
    _FN89_,
    _FN90_,
    _FN91_,
    _FN92_,
    _FN93_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN58_,
    _FN59_,
    _FN60_,
    _FN61_,
    _FN62_,
    _FN63_,
    _FN64_,
    _FN65_,
    _FN65_,
    _FN65_,
    _FN65_,
    _FN65_,
    _FN65_,
    _FN66_,
    _FN65_,
    _FN65_,
    _FN66_,
    _FN65_,
    _FN65_,
    _FN66_,
    _FN65_,
    _FN65_,
    _FN66_,
    _FN65_,
    _FN65_,
    _FN66_,
    _FN65_,
    _FN66_,
    _FN65_,
    _FN66_,
    _FN65_,
    _FN66_,
    _FN65_,
    _FN66_,
    _FN65_,
    _FN66_,
    _FN65_,
    _FN67_,
    _FN68_,
    _FN69_,
    _FN70_,
    _FN71_,
    _FN94_,
    _FN94_,
    _FN95_,
    _FN96_,
    _FN97_,
    _FN86_,
    _FN72_,
    _FN73_,
    _FN98_,
    _FN98_,
    _FN98_,
    _FN98_,
    _FN128_,
    _FN130_,
    _FN123_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN123_,
    _FN123_,
    _FN123_,
    _FN123_,
    _FN128_,
    _FN128_,
    _FN99_,
    _FN100_,
    _FN99_,
    _FN99_,
    _FN99_,
    _FN100_,
    _FN100_,
    _FN100_,
    _FN129_,
    _FN123_,
    _FN101_,
    _FN102_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN130_,
    _FN128_,
    _FN130_,
    _FN129_,
    _FN129_,
    _FN129_,
    _FN128_,
    _FN128_,
    _FN123_,
    _FN128_,
    _FN123_,
    _FN128_,
    _FN123_,
    _FN123_,
    _FN128_,
    _FN100_,
    _FN100_,
    _FN100_,
    _FN100_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN103_,
    _FN103_,
    _FN99_,
    _FN104_,
    _FN105_,
    _FN106_,
    _FN99_,
    _FN99_,
    _FN99_,
    _FN99_,
    _FN105_,
    _FN105_,
    _FN105_,
    _FN105_,
    _FN100_,
    _FN100_,
    _FN100_,
    _FN100_,
    _FN106_,
    _FN106_,
    _FN106_,
    _FN106_,
    _FN100_,
    _FN100_,
    _FN100_,
    _FN100_,
    _FN128_,
    _FN128_,
    _FN128_,
    _FN107_,
    _FN79_,
    _FN78_,
    _FN79_,
    _FN108_,
    _FN86_,
    _FN109_,
    _FN79_,
    _FN110_,
    _FN110_,
    _FN85_,
    _FN86_,
    _FN111_,
    _FN86_,
    _FN112_,
    _FN113_,
    _FN79_,
    _FN114_,
    _FN79_,
    _FN99_,
    _FN100_,
    _FN99_,
    _FN99_,
    _FN100_,
    _FN100_,
    _FN115_,
    _FN116_,
    _FN117_,
    _FN79_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN99_,
    _FN100_,
    _FN99_,
    _FN99_,
    _FN99_,
    _FN99_,
    _FN100_,
    _FN100_,
    _FN100_,
    _FN100_,
    _FN99_,
    _FN100_,
    _FN99_,
    _FN99_,
    _FN99_,
    _FN99_,
    _FN100_,
    _FN100_,
    _FN100_,
    _FN100_,
    _FN118_,
    _FN86_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN119_,
    _FN83_,
    _FN120_,
    _FN79_,
    _FN121_,
    _FN83_,
    _FN103_,
    _FN115_,
    _FN79_,
    _FN115_,
    _FN79_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN115_,
    _FN79_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN115_,
    _FN79_,
    _FN115_,
    _FN79_,
    _FN115_,
    _FN79_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN115_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN79_,
    _FN74_,
    _FN97_,
    _FN75_,
    _FN76_,
    _FN122_,
    _FN123_,
    _FN124_,
    _FN125_,
    _FN126_,
    _FN77_,
    _FN77_,
    _FN77_,
    _FN77_,
    _FN127_,
    _FN79_,
];
