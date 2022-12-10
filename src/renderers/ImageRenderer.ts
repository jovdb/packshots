import { IImageRendererConfig } from "../../components/config/ImageRendererConfig";
import { ImageCache } from "../ImageCache";
import { IPackshotConfig } from "../IPackshot";
import { getImageUrl } from "../stores/packshot";
import type { IRenderer, IRenderResult } from "./IRenderer";

export class ImageRenderer implements IRenderer {
  public imageCache: ImageCache;

  constructor() {
    this.imageCache = new ImageCache();
  }

  async loadAsync(
    config: IImageRendererConfig,
    packshotConfig: IPackshotConfig,
  ) {
    const url = getImageUrl(packshotConfig, config?.image);
    await this.imageCache.loadImage(url);
  }

  public render(
    targetContext: CanvasRenderingContext2D,
    config: IImageRendererConfig,
    packshotConfig: IPackshotConfig,
  ): IRenderResult | undefined | void {
    const url = getImageUrl(packshotConfig, config?.image);
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
