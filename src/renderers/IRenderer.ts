export interface IRenderer {
    /**
     * Returns a function to call after the children are rendered
     * Can be used for nested renders like a mask renderer
     */
    render(
        targetContext: CanvasRenderingContext2D,
        config: {},
        isDragging: boolean,
    ): (() => void) | undefined | void;

    // Prepare this renderer with the specified data
    // If missing or returns undefined, no async data is needed are already available.
    loadAsync?(config: {}): void | Promise<void>;

    dispose?(): void;
}
