import { WorkspaceSystem } from "./workspace_system";

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
    down: (e: PointerEvent, sys: WorkspaceSystem) => InputHandler;
    up: (e: PointerEvent, sys: WorkspaceSystem) => InputHandler;
    drag: (e: PointerEvent, button: ButtonType, sys: WorkspaceSystem) => InputHandler;
    move?: (e: PointerEvent, sys: WorkspaceSystem) => InputHandler;
    wheel: (e: WheelEvent, sys: WorkspaceSystem) => InputHandler;
}