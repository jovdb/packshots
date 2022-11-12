export interface IRenderer {
    render(
        targetContext: CanvasRenderingContext2D,
        config: {},
    ): void;

    loadAsync?(config: {}): Promise<void>;

    dispose?(): void;
}