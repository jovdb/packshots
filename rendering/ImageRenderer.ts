import { IRenderer } from "./IRenderer";

export interface IImageRendererProps {
    image: HTMLImageElement;
}

export class ImageRenderer implements IRenderer<IImageRendererProps> {
    constructor(
        private image: HTMLImageElement,
    ) {
    }

    public render(targetContext: CanvasRenderingContext2D) {
        if (this.image) {
            targetContext.drawImage(this.image, 0, 0);
        }
    }
}