export interface IRenderer {
    render(
        targetContext: CanvasRenderingContext2D,
        config: {},
        isDragging: boolean,
    ): void;

    loadAsync?(config: {}): void | Promise<void>;

    dispose?(): void;
}