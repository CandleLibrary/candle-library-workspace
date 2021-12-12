export const enum Status {
    CONNECTED = 1 << 0,
    TRANSITIONED_IN = 1 << 1,
    DESTROY_AFTER_TRANSITION = 1 << 2,
    CONTAINER_COMPONENT = 1 << 3,
    INITIALIZED = 1 << 4,
    ALLOW_UPDATE = 1 << 5,
    TRANSITIONED_OUT = 1 << 6,
    FOREIGN_HOST = 1 << 7,
    DIRTY = 1 << 8
}
