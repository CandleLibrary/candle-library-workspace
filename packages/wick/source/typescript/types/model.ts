
/**
 * An interface for objects that allow components
 * to subscribe to the object and receive updates
 * via the subscriber's `onModelUpdate ` method.
 */
export interface ObservableModel {
    OBSERVABLE: true,
    subscribe: (ObservableWatcher) => boolean;
    unsubscribe: (ObservableWatcher) => boolean;
    data: any;
}

export interface ObservableWatcher {
    onModelUpdate(data: ObservableModel);

    /**
     * If model is set then should cause this 
     * object to unsubscribe from its model
     */
    removeModel();
}