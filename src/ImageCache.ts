import { loadImageAsync } from "../utils/image";

export class ImageCache {
  private image: HTMLImageElement | undefined;
  private imageUrl: string | undefined;
  private imagePromise: Promise<HTMLImageElement> | undefined;

  /** Get image or load image */
  public loadImage(url: string | undefined): HTMLImageElement | undefined | Promise<HTMLImageElement> {
    url ||= undefined;

    // Already loaded
    if (url === this.imageUrl) {
      return this.image;
    }

    // Removed
    if (!url) {
      this.image = undefined;
      this.imagePromise = undefined;
      this.imageUrl = undefined;
      return undefined;
    }

    // Load
    this.image = undefined; // Make sure if the images matches the url and not the previous error
    this.imageUrl = url;
    this.imagePromise = loadImageAsync(url);
    this.imagePromise.then(
      img => {
        this.image = img;
      },
      (e) => {
        this.image = undefined;
        this.imagePromise = undefined;
        this.imageUrl = undefined;
        throw e;
      },
    );
    return this.imagePromise;
  }

  /** Synchroniously get image */
  public getImage(url: string | undefined, required?: boolean) {
    url ||= undefined;
    if (this.isLoaded(url)) return this.image;
    if (required && !this.image) throw new Error("Loaded image expected.");
    return undefined; // No or other image is loaded4
  }

  /** Synchroniously get image */
  public isLoaded(url: string | undefined) {
    url ||= undefined;
    return !!this.image && this.imageUrl === url;
  }
}
