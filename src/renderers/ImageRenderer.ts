import { ImageCache } from "./ImageCache";
import type { IRenderer } from "./IRenderer";

export interface IImageRendererProps {
    imageUrl: string;
}

export class ImageRenderer implements IRenderer {
    public imageCache: ImageCache;

    constructor() {
        this.imageCache = new ImageCache();
    }

    async loadAsync(config: IImageRendererProps) {
        const url = config?.imageUrl ?? "";
        await this.imageCache.loadAsync(url);
    }

    public render(
        targetContext: CanvasRenderingContext2D,
        config: IImageRendererProps,
    ) {
        const url = config?.imageUrl ?? "";
        const image = this.imageCache.getImage(url, true);

        // Stretch image to full canvas size
        if (image) targetContext.drawImage(
            image,
            0, 0, image.width, image.height,
            0, 0, targetContext.canvas.width, targetContext.canvas.height,
        );
    }
}