import { IMaskRenderingConfig } from "../../components/config/MaskRendererConfig";
import { createContext2d, getImageDataAsync } from "../../utils/image";
import { IRenderer, IRenderResult } from "./IRenderer";

export class MaskChannelRenderer implements IRenderer {
  public imageContext: CanvasRenderingContext2D | undefined;
  public contextPromise: Promise<CanvasRenderingContext2D | undefined> | undefined;
  public cacheKey: string;
  private debugMask: boolean;
  private context: CanvasRenderingContext2D;

  constructor() {
    this.cacheKey = "";
    this.debugMask = false;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Error creating canvas context");
    this.context = context;
  }

  async loadAsync(config: IMaskRenderingConfig) {
    const url = config?.image.url ?? "";
    const colorChannelIndex = config.colorChannel || 0;
    const imageDataCacheKey = `${colorChannelIndex}-${url};`;
    // Already loaded/loading
    if (this.cacheKey === imageDataCacheKey) {
      if (!this.contextPromise) return; // Already Loaded

      // Reuse current loading
      try {
        await this.contextPromise; // Reuseprevious started loading
      } catch (err) {
        // Previous process will reset memeber variables
        console.error(err);
        throw new Error("Error loading mask", { cause: err });
      }
      return;
    }

    async function loadImageChannelAsync() {
      const { imageData, context } = await getImageDataAsync(url);
      if (!imageData) return;

      const numberOfPixels = imageData.width * imageData.height;
      // Loop over colors
      for (let pixelIndex = 0; pixelIndex < numberOfPixels; ++pixelIndex) {
        // Use one color channel and create a greyscale image with it
        let value = imageData.data[pixelIndex * 4 + colorChannelIndex];
        if (colorChannelIndex === 3) value = 255 - value; // Inverted for alpha, so a transparent hole is visible and other channels are visisble

        // Make greyscale image of the single channel as mask
        imageData.data[pixelIndex * 4 + 0] = 255;
        imageData.data[pixelIndex * 4 + 1] = 255;
        imageData.data[pixelIndex * 4 + 2] = 255;
        imageData.data[pixelIndex * 4 + 3] = value;
      }

      context.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);
      return context;
    }

    try {
      this.contextPromise = loadImageChannelAsync();
      this.imageContext = await this.contextPromise;
      this.cacheKey = imageDataCacheKey;
    } catch (err) {
      this.contextPromise = undefined;
      this.cacheKey = "";
      this.imageContext = undefined;
      console.error(err);
      throw new Error("Error loading mask", { cause: err });
    } finally {
      this.contextPromise = undefined;
    }
  }

  render(drawOnContext: CanvasRenderingContext2D, config: IMaskRenderingConfig): IRenderResult | undefined {
    const { context, imageContext: maskContext } = this;

    // Stretch image to full canvas size
    if (maskContext && !config.isDisabled) {
      // Draw mask on an empty context
      context.canvas.width = drawOnContext.canvas.width;
      context.canvas.height = drawOnContext.canvas.height;
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);

      // Draw Mask on a the new layer
      context.drawImage(
        maskContext.canvas,
        0,
        0,
        maskContext.canvas.width,
        maskContext.canvas.height,
        0,
        0,
        context.canvas.width,
        context.canvas.height,
      );

      context.globalCompositeOperation = "source-in";

      return {
        nextContext: this.debugMask
          ? createContext2d(drawOnContext.canvas.width, drawOnContext.canvas.width, 1) // Temporary unused context so we can see mask
          : context, // Draw on this separate context
        afterChildren: () => {
          // Draw the Masked image on the target layer
          drawOnContext.drawImage(
            context.canvas,
            0,
            0,
            context.canvas.width,
            context.canvas.height,
            0,
            0,
            drawOnContext.canvas.width,
            drawOnContext.canvas.height,
          );

          return drawOnContext;
        },
      };
    }

    return undefined;
  }
}
