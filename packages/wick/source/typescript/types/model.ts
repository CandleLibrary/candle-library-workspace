
/**
 * An interface for objects that components can
 * subscribe to and receive change updates from
 * through calls to the  subscriber's `onModelUpdate`.
 */
export interface ObservableModel {
    OBSERVABLE: true,
    subscribe: (arg1: ObservableWatcher) => boolean;
    unsubscribe: (arg1: ObservableWatcher) => boolean;
}

export interface ObservableWatcher {
    onModelUpdate(data: ObservableModel): void;

    /**
     * If model is set then should cause this 
     * object to unsubscribe from its model
     */
    removeModel(): void;
}