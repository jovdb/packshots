import { loadImageAsync } from "../../utils/image";


export class ImageCache {
    private image: HTMLImageElement | undefined;
    private imageUrl: string | undefined;
    private imagePromise: Promise<HTMLImageElement> | undefined;

    public async loadAsync(url: string | undefined) {
        url ||= undefined;

        // Already loaded
        if (url === this.imageUrl) {
            await this.imagePromise;
            return;
        }

        // Removed
        if (!url) {
            this.image = undefined;
            this.imagePromise = undefined;
            this.imageUrl = undefined;
            return;
        }

        // Load
        this.image = undefined; // Make sure if the images matches the url and not the previous error
        this.imageUrl = url;
        this.imagePromise = loadImageAsync(url);
        this.image = await this.imagePromise;
    }

    public getImage(url: string | undefined, required?: boolean) {
        url ||= undefined;
        if (this.image && this.imageUrl === url)
            return this.image;
        if (required && !this.image)
            throw new Error("Image not loaded");
        return undefined; // No or other image is loaded4
    }
}
