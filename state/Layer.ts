export interface ILayerState {
    name: string,
    type: "image" | "plane" | "cone",
    config: unknown,
}