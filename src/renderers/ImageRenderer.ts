import { loadImageAsync } from "../../utils/image";
import type { IRenderer } from "./IRenderer";

export interface IImageRendererProps {
    imageUrl: string;
}

export class ImageCache {
    private image: HTMLImageElement | undefined;
    private imagePromise: Promise<HTMLImageElement> | undefined;

    public async loadAsync(url: string | undefined) {
        url ||= undefined;

        // Already loaded
        if (url === this.image?.src) {
            await this.imagePromise;
            return;
        }

        // Removed
        if (!url) {
            this.image = undefined;
            this.imagePromise = undefined;
            return;
        }

        // Load
        this.image = undefined; // Make sure if the images matches the url and not the previous error
        this.imagePromise = loadImageAsync(url);
        this.image = await this.imagePromise;
    }

    public getImage(url: string | undefined, required?: boolean) {
        url ||= undefined;
        if (this.image?.src === url) return this.image;
        if (required && !this.image) throw new Error("Image not loaded");
        return undefined; // No or other image is loaded4
    }
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