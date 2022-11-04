export interface IRenderer<TConfig> {
    render(
        targetContext: CanvasRenderingContext2D,
        targetSize: { width: number; height: number },
        image: HTMLImageElement,
        config: TConfig,
    ): void;
}