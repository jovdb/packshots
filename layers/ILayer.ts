export interface ILayerState<TConfig = unknown> {
    name: string,
    type: "image" | "plane" | "plane2" | "cone",
    config: TConfig,
    ui?: {
        isExpanded?: boolean;
        isVisible?: boolean;
    }
}