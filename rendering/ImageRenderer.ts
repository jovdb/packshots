import type { IRenderer } from "./IRenderer";

export interface IImageRendererProps {
    image: HTMLImageElement;
}

export class ImageRenderer implements IRenderer<IImageRendererProps> {
    constructor(
        private config: IImageRendererProps,
    ) {
    }

    public render(targetContext: CanvasRenderingContext2D) {
        if (this.config.image) {
            targetContext.drawImage(this.config.image, 0, 0);
        }
    }
}