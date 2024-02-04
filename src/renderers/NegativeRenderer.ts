import { IRenderer, IRenderResult } from "./IRenderer";

export class NegativeRenderer implements IRenderer {
  render(
    drawOnContext: CanvasRenderingContext2D,
  ): IRenderResult | undefined {
    const context = drawOnContext;

    // Before children
  
    return {
      afterChildren: () => {
        // Perform Negative effect on children
        context.globalCompositeOperation = "difference";
        context.fillStyle = "white";
        context.fillRect(0, 0, drawOnContext.canvas.width, drawOnContext.canvas.height);

        return context;
      },
    };
  }
}
