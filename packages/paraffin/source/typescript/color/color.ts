import { col_css } from "./color_css.js";
import { col_pwg } from "./color_pwg.js";
import { col_x11 } from "./color_x11.js";

export { col_css };
export { col_pwg };
export { col_x11 };

export type color = col_css | col_pwg | col_x11;

export function xtColor(text?: color, background?: color) {

    let
        text_color_code = col_css.white,
        background_color_code = col_css.black,
        str = [];

    if (text !== undefined) {
        if (typeof text == "number")
            text_color_code = text & 0xFF;

        str.push(`38;5;${text_color_code}`);
    }

    if (background !== undefined) {
        if (typeof background == "number")
            background_color_code = background & 0xFF;

        str.push(`48;5;${background_color_code}`);
    }

    return str.join(";");
}

export const xtReset = "0";
export const xtBold = "1";
export const xtDim = "2";
export const xtUnderline = "4";
export const xtBlink = "5";
export const xtInvert = "7";
export const xtRHidden = "8";
export const xtRBold = "21";
export const xtRDim = "22";
export const xtRUnderline = "24";
export const xtRBlink = "25";
export const xtRInvert = "27";
export const xtHidden = "28";
export const xtF = (...format_codes) => `\x1b[${format_codes.join(";")}m`;