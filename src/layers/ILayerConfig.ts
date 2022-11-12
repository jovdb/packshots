export interface ILayerConfig<TConfig = unknown> {
    name: string,
    type: "image" | "plane" | "plane2" | "plane3" | "cone",
    config: TConfig,
    ui?: {
        isExpanded?: boolean;
        isVisible?: boolean;
    }
}