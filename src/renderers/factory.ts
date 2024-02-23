import { IRenderer } from "./IRenderer";

import { PlaneWebGlRenderer } from "./PlaneWebGlRenderer/PlaneWebGlRenderer";
import { ConeCanvasRenderer } from "./ConeCanvasRenderer/ConeCanvasRenderer";
import { ImageRenderer } from "./ImageRenderer";
import { MaskChannelRenderer } from "./MaskChannelRenderer";
import { NegativeWasmRenderer } from "./NegativeWasmRenderer";
import { IRendererConfig } from "../IPackshot";
import { NegativeRenderer } from "./NegativeRenderer";
import { NegativeImageDataRenderer } from "./NegativeImageDataRenderer";
import { INegativeRenderingConfig } from "../components/config/NegativeRendererConfig";
import { VoidRenderer } from "./VoidRenderer";

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
    case "negative": {
      const negativeConfig = config as INegativeRenderingConfig;
      if (negativeConfig.isDisabled) return new VoidRenderer();
      switch (negativeConfig?.method) {
        case "canvas":
          return new NegativeRenderer();
        case "imagedata":
          return new NegativeImageDataRenderer();
        case "wasm":
          return new NegativeWasmRenderer();
        case "webgpu":
          alert("WebGPU renderer not yet available");
          return new VoidRenderer();
        default:
          alert(`Unknown negative method: '${negativeConfig?.method}'`);
          return new VoidRenderer();
      }
    }
    default:
      throw new Error(`Unknown render type: ${type}`);
  }
}
