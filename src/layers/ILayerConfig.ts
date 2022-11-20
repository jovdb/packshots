import { IRenderer } from "../renderers/IRenderer";

export interface ILayerConfig<TConfig = {}> {
    name: string,
    type: "image" | "plane" | "plane2" | "plane3" | "cone",
    config: TConfig,
    ui?: {
        isExpanded?: boolean;
        isVisible?: boolean;
    };
    mask?: {};
}