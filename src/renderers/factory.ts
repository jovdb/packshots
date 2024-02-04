import { IRenderer } from "./IRenderer";

import { PlaneWebGlRenderer } from "./PlaneWebGlRenderer/PlaneWebGlRenderer";
import { ConeCanvasRenderer } from "./ConeCanvasRenderer/ConeCanvasRenderer";
import { ImageRenderer } from "./ImageRenderer";
import { MaskChannelRenderer } from "./MaskChannelRenderer";
import { NegativeWasmRenderer } from "./NegativeWasmRenderer";

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
      return new PlaneWebGlRenderer();
    case "cone":
      return new ConeCanvasRenderer();
    case "negative":
      return new NegativeWasmRenderer();
    default:
      throw new Error(`Unknown render type: ${type}`);
  }
}
