export interface IRenderer<TConfig = unknown> {
    render(
        targetContext: CanvasRenderingContext2D,
        //targetSize: { width: number; height: number },
        //image: HTMLImageElement,
        config: TConfig,
    ): void;
}