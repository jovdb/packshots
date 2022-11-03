export interface IRenderer<TConfig> {
    render(
        targetSize: { width: number; height: number },
        image: HTMLImageElement,
        config: TConfig,
    ): CanvasRenderingContext2D | WebGLRenderingContext | WebGL2RenderingContext;
}