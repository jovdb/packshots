import { ImageRenderer } from "./ImageRenderer";
import { IRenderer } from "./IRenderer";
import { MaskRenderer } from "./MaskRendering";
import { PlaneWebGlRenderer } from "./PlaneWebGlRenderer";
import { ConeWebGlRenderer } from "./ConeWebGlRenderer";

export function createRenderer(
  type: string,
): IRenderer {
  switch (type) {
    case "image":
      return new ImageRenderer();
    case "mask":
      return new MaskRenderer();
    case "plane":
      return new PlaneWebGlRenderer();
    case "cone":
      return new ConeWebGlRenderer();
    default:
      throw new Error(`Unknown render type: ${type}`);
  }
}
