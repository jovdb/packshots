import { IRenderer } from "./IRenderer";

import { PlaneWebGlRenderer } from "./PlaneWebGlRenderer/PlaneWebGlRenderer";
import { ConeCanvasRenderer } from "./ConeCanvasRenderer/ConeCanvasRenderer";
import { ImageRenderer } from "./ImageRenderer";
import { MaskChannelRenderer } from "./MaskChannelRenderer";
import { UvWebGlRenderer } from "./UvWebGlRenderer/UvWebGlRenderer";

export function createRenderer(
  type: string,
  config: IRendererConfig | undefined,
): IRenderer {
  switch (type) {
    case "image":
      return new ImageRenderer();
    case "mask":
      return new MaskChannelRenderer();
    case "plane":
      // return new PlaneWebGlRenderer();
      return new UvWebGlRenderer();
    case "cone":
      return new ConeCanvasRenderer();
    case "uv":
      return new UvWebGlRenderer();
    default:
      throw new Error(`Unknown render type: ${type}`);
  }
}
