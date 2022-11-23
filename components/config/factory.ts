import { ImageConfig } from "./ImageConfig2";
import { ConeConfig } from "./ConeConfig";
import { PlaneRendererConfig } from "./PlaneRendererConfig";
import { MaskRendererConfig } from "./MaskRendererConfig";
import { ImageRendererConfig } from "./ImageRendererConfig";

export type ConfigComponent<T extends {}> = React.FC<{
    config: T;
    onChange: (config: T) => void;
}>;


export function getConfigComponent(
    type: string,
): ConfigComponent<any> | null | undefined {
    switch (type) {
        case "image": return ImageRendererConfig;
        case "plane": return PlaneRendererConfig;
        case "cone": return ConeConfig;
        case "mask": return MaskRendererConfig;
        default: throw new Error(`Unknown config type: ${type}`);
    }
}
