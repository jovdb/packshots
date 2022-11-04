import { loadImageAsync } from "../utils/image";
import type { IRenderer } from "./IRenderer";

export interface IImageRendererProps {
    imageUrl: string;
}

export class ImageRenderer implements IRenderer {
    private image: HTMLImageElement | undefined;

    constructor(
        private config: IImageRendererProps,
    ) {
    }

    async loadAsync() {
        const url = this.config?.imageUrl ?? "";
        if (!url) return;
        this.image = await loadImageAsync(url);
    }

    public render(targetContext: CanvasRenderingContext2D) {
        if (this.config?.imageUrl && !this.image) throw new Error("image to render not loaded");
        if (this.image) targetContext.drawImage(this.image, 0, 0);
    }
}