//CSS
import {
    CSSNodeTypeLU, length,
    parseDeclaration, percentage, url
} from "@candlelib/css";
import { JSNodeTypeLU, JSParserEnv, JSParserEnvironment } from "@candlelib/js";
import { HTMLNodeTypeLU } from "../../types/all.js";
export const NodeTypes = Object.assign({}, CSSNodeTypeLU, HTMLNodeTypeLU, JSNodeTypeLU);

type WickParserEnvironment = any & JSParserEnv & {
    ASI: boolean;
    /**
     * Test
     */
    comments: Comment[],
    typ: any;
    cls: any;
};


const env = <WickParserEnvironment>{

    table: {},

    typ: NodeTypes,

    cls: Object.assign({}, JSParserEnvironment.cls),

    functions: {
        //CSS
        parseDeclaration,
        url,
        percentage,
        length,

        //JS
        //parseTemplate: JSParserEnvironment.functions.parseTemplate,
        //parseString: JSParserEnvironment.functions.parseString,
        reinterpretArrowParameters: JSParserEnvironment.functions.reinterpretArrowParameters,
        reinterpretParenthesized: JSParserEnvironment.functions.reinterpretParenthesized,
    },

    options: {
        integrate: false,

        onstart: () => {
            env.comments = [];
            env.ASI = true;
        }
    }

};


export default env;
