export function MOVE_PANEL(system, panel, dx, dy) {
    panel.x -= dx;
    panel.y -= dy;

    if (panel.x < 0) panel.x = 0;
    if (panel.y < 0) panel.y = 0;
    if (panel.x + panel.width > window.screen.width) panel.x = window.screen.width - panel.width;
    if (panel.y + panel.height > window.screen.height) panel.y = window.screen.height - panel.height;
}