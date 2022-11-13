export interface IRenderer {
    render(
        targetContext: CanvasRenderingContext2D,
        config: {},
    ): void;

    loadAsync?(config: {}): void | Promise<void>;

    dispose?(): void;
}