import { IMaskConfig } from "../../components/config/MaskConfig";
import { ImageCache } from "./ImageCache";
import { IRenderer } from "./IRenderer";

export class MaskRenderer implements IRenderer {
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

    render(targetContext: CanvasRenderingContext2D, config: IMaskConfig) {
        const url = config?.image.url ?? "";
        const image = this.imageCache.getImage(url, true);
        const { context } = this;
        if (!context) return undefined;

        // Stretch image to full canvas size
        if (image) {
            context.canvas.width = targetContext.canvas.width;
            context.canvas.height = targetContext.canvas.height;
            
            context.globalCompositeOperation = "source-in";

            context.drawImage(
                image,
                0, 0, image.width, image.height,
                0, 0, context.canvas.width, context.canvas.height,
            );

            return () => {
                context.globalCompositeOperation = "source-out";
    
                targetContext.drawImage(
                    context.canvas,
                    0, 0, context.canvas.width, context.canvas.height,
                    0, 0, targetContext.canvas.width, targetContext.canvas.height,
                );
            }
        }

        return undefined;
    }
}