import { IImageRendererConfig } from "../components/config/ImageRendererConfig";
import { IMaskRenderingConfig } from "../components/config/MaskRendererConfig";
import { ImageCache } from "../ImageCache";
import { getImageUrl, PackshotRoot } from "../stores/app";
import { IRenderer, IRenderResult } from "./IRenderer";

export class MaskRenderer implements IRenderer {
  public imageCache: ImageCache;
  private context: CanvasRenderingContext2D;

  constructor() {
    this.imageCache = new ImageCache();
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Error creating canvas context");
    this.context = context;
  }

  async loadAsync(
    config: IImageRendererConfig,
    root: PackshotRoot,
  ) {
    const url = await getImageUrl(root, config?.image);
    await this.imageCache.loadImage(url);
  }

  render(
    drawOnContext: CanvasRenderingContext2D,
    config: IMaskRenderingConfig
  ): IRenderResult | undefined {
    const image = this.imageCache.getImage(true);
    const { context } = this;

    // Stretch image to full canvas size
    if (image && !config.isDisabled) {
      context.canvas.width = drawOnContext.canvas.width;
      context.canvas.height = drawOnContext.canvas.height;
      context.clearRect(0, 0, drawOnContext.canvas.width, drawOnContext.canvas.height);

      // Draw Mask on a new layer
      context.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        0,
        0,
        context.canvas.width,
        context.canvas.height,
      );

      context.globalCompositeOperation = "source-in";

      return {
        childContext: context,
        afterChildren: () => {
          context.globalCompositeOperation = "source-out";

          // Draw the Masked image
          drawOnContext.drawImage(
            context.canvas,
            0,
            0,
            context.canvas.width,
            context.canvas.height,
            0,
            0,
            drawOnContext.canvas.width,
            drawOnContext.canvas.height,
          );

          return drawOnContext;
        },
      };
    }

    return undefined;
  }
}
