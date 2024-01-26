import { IImageRendererConfig } from "../components/config/ImageRendererConfig";
import { ImageCache } from "../ImageCache";
import { getImageUrl, PackshotRoot } from "../stores/app";
import type { IRenderer, IRenderResult } from "./IRenderer";

export class ImageRenderer implements IRenderer {
  public imageCache: ImageCache;

  constructor() {
    this.imageCache = new ImageCache();
  }

  async loadAsync(
    config: IImageRendererConfig,
    root: PackshotRoot,
  ) {
    const url = await getImageUrl(root, config?.image);
    await this.imageCache.loadImage(url);
  }

  public render(
    targetContext: CanvasRenderingContext2D,
  ): IRenderResult | undefined | void {
    const image = this.imageCache.getImage(true);

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
