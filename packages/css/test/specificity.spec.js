import { rule, tools } from "../build/css.js";

const {
    rules: {
        getHighestSpecificity: ghs
    }
} = tools;

const ruleA = rule(".class{ }");
const ruleB = rule("#id{ }");

assert("Get max rule specificity", ghs(ruleA) < ghs(ruleB));