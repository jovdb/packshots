import { IRenderer, IRenderResult } from "./IRenderer";

export class NegativeWasmRenderer implements IRenderer {
  /** Context to draw the children on */
  private childContext: CanvasRenderingContext2D;

  constructor() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Error creating canvas context");
    this.childContext = context;
  }

  async loadAsync(
  ) {
    // TODO:
    // - Load here the WASM module?
    // - Allocate buffers?
  }

  render(
    drawOnContext: CanvasRenderingContext2D,
  ): IRenderResult | undefined {

    const { childContext } = this;

    // Reset render context on which children will be drawn  
    childContext.canvas.width = drawOnContext.canvas.width;
    childContext.canvas.height = drawOnContext.canvas.height;
    childContext.clearRect(0, 0, drawOnContext.canvas.width, drawOnContext.canvas.height);

    return {
      childContext: childContext,

      afterChildren: () => {

        // Read of the context that is filled by child renderers
        const imageData = childContext.getImageData(0, 0, drawOnContext.canvas.width, drawOnContext.canvas.height);

        // Place on buffer and pass to WASM?
        // Do WASM magic here
        for (let i = 0; i < imageData.data.length; i += 4) {
          imageData.data[i] = 255 - imageData.data[i];
          imageData.data[i + 1] = 255 - imageData.data[i + 1];
          imageData.data[i + 2] = 255 - imageData.data[i + 2];
          imageData.data[i + 3] = 255;
        }

        // Draw the result
        childContext.putImageData(imageData, 0, 0);
        drawOnContext.drawImage(
          childContext.canvas,
          0,
          0,
          childContext.canvas.width,
          childContext.canvas.height,
          0,
          0,
          drawOnContext.canvas.width,
          drawOnContext.canvas.height,
        );
      },
    };
  }
}
