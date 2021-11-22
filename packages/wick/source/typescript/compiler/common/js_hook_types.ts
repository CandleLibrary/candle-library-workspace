import { JSNodeType } from "@candlelib/js";
import { registerHookType } from "./extended_types.js";


export const
    BindingIdentifierBinding = registerHookType("binding-id", JSNodeType.IdentifierBinding),
    BindingIdentifierReference = registerHookType("ref-id", JSNodeType.IdentifierReference);
