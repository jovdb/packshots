import { ILayerState } from "../../state/Layer";
import { ImageConfig } from "./ImageConfig";
import { PlaneConfig } from "./PlaneConfig";
import { ConeConfig } from "./ConeConfig";

export type ConfigComponent<T extends {}> = React.FC<{
    config: T;
    onChange: (config: T) => void;
}>;


export function getConfigComponent(
    layer: ILayerState,
): ConfigComponent<any> | null | undefined {
    switch (layer.type) {
        case "image": return ImageConfig;
        case "plane": return PlaneConfig;
        case "cone": return ConeConfig;
        default: throw new Error(`Unknown config type: ${layer.type}`);
    }
}