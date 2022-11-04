import { ILayerState } from "../../state/Layer";
import { ImageConfig } from "./ImageConfig";

export type ConfigComponent<T extends {}> = React.FC<{
    config: T;
    onChange: (config: Partial<T>) => void;
}>;


export function getConfigComponent(
    layer: ILayerState,
): ConfigComponent<any> | null | undefined {
    switch (layer.type) {
        case "image": return ImageConfig;
        case "plane": return null;
        case "cone": return null;
        default: throw new Error(`Unknown config type: ${layer.type}`);
    }
}