import { ImageRenderer } from "./ImageRenderer";
import { IRenderer } from "./IRenderer";
// import { MaskRenderer } from "./MaskRendering";
import { PlaneWebGlRenderer } from "./PlaneWebGlRenderer/PlaneWebGlRenderer";
// import { ConeWebGlRenderer } from "./ConeWebglRenderer/ConeWebGlRenderer";
import { ConeCanvasRenderer } from "./ConeCanvasRenderer/ConeCanvasRenderer";
import { MaskChannelRenderer } from "./MaskChannelRendering";

export function createRenderer(
  type: string,
): IRenderer {
  switch (type) {
    case "image":
      return new ImageRenderer();
    case "mask":
      return new MaskChannelRenderer();
    case "plane":
      return new PlaneWebGlRenderer();
    case "cone":
      return new ConeCanvasRenderer();
    default:
      throw new Error(`Unknown render type: ${type}`);
  }
}
