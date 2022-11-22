export interface IRenderer<TRenderResult = unknown> {
    render(
        targetContext: CanvasRenderingContext2D,
        config: {},
        isDragging: boolean,
    ): TRenderResult;

    /** Can be used for nested renders like a mask renderer */
    renderAfterChild?(
        targetContext: CanvasRenderingContext2D,
        /** The result of the previously called render function */
        renderResult: TRenderResult,
    ): void;

    loadAsync?(config: {}): void | Promise<void>;

    dispose?(): void;
}