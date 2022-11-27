import { IImageRendererConfig } from "../../components/config/ImageRendererConfig";
import { ImageCache } from "../ImageCache";
import type { IRenderer, IRenderResult } from "./IRenderer";

export class ImageRenderer implements IRenderer {
  public imageCache: ImageCache;

  constructor() {
    this.imageCache = new ImageCache();
  }

  async loadAsync(config: IImageRendererConfig) {
    const url = config?.image.url ?? "";
    await this.imageCache.loadImage(url);
  }

  public render(
    targetContext: CanvasRenderingContext2D,
    config: IImageRendererConfig,
  ): IRenderResult | undefined | void {
    const url = config?.image.url ?? "";
    const image = this.imageCache.getImage(url, true);

    // Stretch image to full canvas size
    if (image) {
      targetContext.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        0,
        0,
        targetContext.canvas.width,
        targetContext.canvas.height,
      );
    }
  }
}
