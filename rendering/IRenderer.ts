export interface IRenderer {
    render(
        targetContext: CanvasRenderingContext2D,
    ): void;

    loadAsync?(): Promise<void>;

    dispose?(): void;
}