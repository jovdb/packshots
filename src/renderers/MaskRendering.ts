import { IMaskConfig } from "../../components/config/MaskConfig";
import { ImageCache } from "./ImageCache";
import { IRenderer } from "./IRenderer";

export class MaskRenderer implements IRenderer<boolean> {
    public imageCache: ImageCache;
    private context: CanvasRenderingContext2D | null;

    constructor() {
        this.imageCache = new ImageCache();
        const canvas = document.createElement("canvas");
        this.context = canvas.getContext("2d");
    }

    async loadAsync(config: IMaskConfig) {
        const url = config?.image.url ?? "";
        await this.imageCache.loadImage(url);
    }

    render(targetContext: CanvasRenderingContext2D, config: IMaskConfig): boolean {
        const url = config?.image.url ?? "";
        const image = this.imageCache.getImage(url, true);
        if (!this.context) return false;

        // Stretch image to full canvas size
        if (image) {
            this.context.canvas.width = targetContext.canvas.width;
            this.context.canvas.height = targetContext.canvas.height;
            
            this.context.globalCompositeOperation = "source-in";

            this.context.drawImage(
                image,
                0, 0, image.width, image.height,
                0, 0, this.context.canvas.width, this.context.canvas.height,
            );
        }

        return !!image
    }

    renderAfterChild(targetContext: CanvasRenderingContext2D, renderResult: boolean) {
        if (!this.context) return;
        if (renderResult) this.context.globalCompositeOperation = "source-out";
    
        targetContext.drawImage(
            this.context.canvas,
            0, 0, this.context.canvas.width, this.context.canvas.height,
            0, 0, targetContext.canvas.width, targetContext.canvas.height,
        );
    }

}