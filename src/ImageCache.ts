import { loadImageAsync } from "./utils/image";

export class ImageCache {
  private image: HTMLImageElement | undefined;
  private imageUrl: string | undefined;
  private imagePromise: Promise<HTMLImageElement> | undefined;

  /** Get image or load image */
  public loadImage(url: string | undefined): HTMLImageElement | undefined | Promise<HTMLImageElement> {
    url ||= undefined;

    // Already loaded
    if (url === this.imageUrl) {
      if (this.imagePromise) return this.imagePromise;
      if (this.image) return this.image;
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
    this.imagePromise = url ? loadImageAsync(url) : undefined;
    if (this.imagePromise) this.imagePromise.then(
      img => {
        this.image = img;
        this.imagePromise = undefined;
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
  public getImage(required?: boolean) {
    if (this.isLoaded()) return this.image;
    if (required && this.imageUrl && !this.image) throw new Error("Loaded image expected.");
    return undefined; // No or other image is loaded
  }

  /** Synchroniously get image */
  public getImagePromise() {
    return this.imagePromise || Promise.resolve(this.image);
  }

  public isLoaded() {
    return this.image;
  }
}
