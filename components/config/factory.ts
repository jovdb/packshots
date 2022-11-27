import { ImageRendererConfig } from "./ImageRendererConfig";
import { MaskRendererConfig } from "./MaskRendererConfig";
import { PlaneRendererConfig } from "./PlaneRendererConfig";

export type ConfigComponent<T extends {}> = React.FC<{
  config: T;
  onChange: (config: T) => void;
}>;

export function getConfigComponent(
  type: string,
): ConfigComponent<any> | null | undefined {
  switch (type) {
    case "image":
      return ImageRendererConfig;
    case "plane":
      return PlaneRendererConfig;
    case "cone":
      throw new Error("Not supported", { cause: "SS" });
    case "mask":
      return MaskRendererConfig;
    default:
      throw new Error(`Unknown config type: ${type}`);
  }
}
