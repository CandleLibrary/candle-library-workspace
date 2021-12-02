import { WickRTComponent } from "./component.js";

export function takeParentAddChild(parent: WickRTComponent, child: WickRTComponent) {
    //@ts-ignore
    parent.ch.push(child);

    //@ts-ignore
    child.par = parent;
};
