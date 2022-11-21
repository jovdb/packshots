import { IMaskConfig } from "../../components/config/MaskConfig";
import { ImageCache } from "./ImageCache";
import { IRenderer } from "./IRenderer";

export class MaskRenderer implements IRenderer<boolean> {
    public imageCache: ImageCache;

    constructor() {
        this.imageCache = new ImageCache();
    }

    async loadAsync(config: IMaskConfig) {
        const url = config?.imageUrl ?? "";
        await this.imageCache.loadImage(url);
    }

    render(targetContext: CanvasRenderingContext2D, config: IMaskConfig): boolean {
        const url = config?.imageUrl ?? "";
        const image = this.imageCache.getImage(url, true);

        // Stretch image to full canvas size
        if (image) {
            targetContext.globalCompositeOperation = "source-out";

            targetContext.drawImage(
                image,
                0, 0, image.width, image.height,
                0, 0, targetContext.canvas.width, targetContext.canvas.height,
            );
        }

        return !!image
    }

    renderAfterChild(targetContext: CanvasRenderingContext2D, renderResult: boolean) {
        if (renderResult) targetContext.globalCompositeOperation = "source-in";
    }

}