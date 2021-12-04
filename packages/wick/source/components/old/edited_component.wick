import { comp, frame, presets, px, py, width, height } from "@model";
import { sys } from "@api";

frame = "@iframe";

frame.onload = (
    () => {

        presets = Object.assign({}, sys.edit_wick.rt.presets, { window: frame.contentWindow, css_cache: [] });


        const { contentDocument: { body: { style } } } = frame;

        //style.top = 0;
        //style.left = 0;
        style.padding = 0;
        style.margin = 0;
        style.width = "100%";
        style.width = "100%";


        const c =
            new (sys.edit_wick.rt.gC(comp))
                (undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    presets
                );

        if (px && py && width && height) {
            frame.style.left = px + "px";
            frame.style.width = width + "px";
            frame.style.top = py + "px";
            frame.style.height = height + "px";
        }
        c.appendToDOM(frame.contentDocument.body);

        frame.contentDocument.body.style.overflow = "hidden";
    });

export default <iframe></iframe>;