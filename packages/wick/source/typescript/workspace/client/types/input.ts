import { FlameSystem } from "./flame_system";

export const enum ButtonType {
    NONE,
    LEFT,
    MIDDLE,
    RIGHT,
    $4,
    $5,
    $6,
}

export interface InputHandler {
    down: (e: PointerEvent, sys: FlameSystem) => InputHandler;
    up: (e: PointerEvent, sys: FlameSystem) => InputHandler;
    drag: (e: PointerEvent, button: ButtonType, sys: FlameSystem) => InputHandler;
    move?: (e: PointerEvent, sys: FlameSystem) => InputHandler;
    wheel: (e: WheelEvent, sys: FlameSystem) => InputHandler;
}