/**
 * Helper Enum for storing CSS property precedence information.
 * 
 * https://www.w3.org/TR/CSS22/cascade.html#cascade
 * 
 *  Precedence terms, from least to greatest:
 *  - **Rule Order**: Order in which the rule appears in the cascade.
 *  - **Specificity**: The specificity of the selector used to match the target, using **A**, **B**, **C**, and **D** sub-terms
 * defined below.
 *  - **Important**: The presence of the [**!important**] specifier on a property.
 * 
 * _____
 * 
 * The precedence value is a 32 bit number split into 6 bit-regions based on the above
 * terms and sub-terms:
 *  
 * *(note: bit ordering is reversed)*
 * > ```ascii
 * > =================================================================
 * > 0 . . . . . . . 8 . . . . . . .16 . . . . . . .24 . . . . . . .32
 * > │ < 0                    15 > │    20 > │    25 > │      31 > │
 * > │                             │         │         │           │ 
 * > [   Rule Order:  15 bits     ][D: 5bits][C: 5bits][B: 5bits][][]
 * >                                                             │││ 
 * >                                                        30 > │││   
 * >                         A / Style Attribute Bit ────────────┘││
 * >                               [   Specificity Mask: 15 bits  ]│
 * >                                           Important! Bit ─────┘
 * > =================================================================
 * > ```
 * _____
 * #### Specificity sub-terms:
 *   https://www.w3.org/TR/CSS22/cascade.html#specificity
 *
 * - **A** = Property found in the element's style attribute
 * - **B** = Number of [**id**] selectors
 * - **C** = Number of [**class**], attribute, and pseudo-class selectors
 * - **D** = Number of [**type | tag**] and pseudo-element selectors
 * - **\*** = Match-All [**\***] selectors are ignored
 * 
 */
export const enum PrecedenceFlags {
    /**
     * Cascade order of the container rule, clamped to 32767 values
     */
    RULE_ORDER_MASK = ((1 << 15) - 1),

    RULE_ORDER_BIT_SHIFT = 0,

    /**
     * Number of type selectors and pseudo-elements, clamped to 31 values
     */
    D_MASK = ((1 << 20) - 1) ^ (PrecedenceFlags.RULE_ORDER_MASK),

    D_BIT_SHIFT = 15,

    /**
     * Number of class selectors attribute and pseudo-classes, clamped to 31 values
     */
    C_MASK = ((1 << 25) - 1) ^ (PrecedenceFlags.D_MASK | PrecedenceFlags.RULE_ORDER_MASK),

    C_BIT_SHIFT = 20,

    /**
     * Number of id selectors, clamped to 31 values
     */
    B_MASK = ((1 << 30) - 1) ^ (PrecedenceFlags.RULE_ORDER_MASK | PrecedenceFlags.C_MASK | PrecedenceFlags.D_MASK),

    B_BIT_SHIFT = 25,

    /**
     * Property from element's style attribute
     */
    A_MASK = (1 << 30),

    /**
     * Property from element's style attribute
     */
    A_BIT_SET = (1 << 30),

    A_BIT_SHIFT = 30,

    SPECIFICITY_MASK = (PrecedenceFlags.C_MASK | PrecedenceFlags.B_MASK | PrecedenceFlags.D_MASK | PrecedenceFlags.A_MASK),

    IMPORTANT_BIT_MASK = ((1 << 31) | 0),

    IMPORTANT_BIT_SET = ((1 << 31) | 0),

    IMPORTANT_BIT_SHIFT = 31
}
