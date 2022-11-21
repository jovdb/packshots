import { ImageRenderer } from "./ImageRenderer";
import { IRenderer } from "./IRenderer";
import { MaskRenderer } from "./MaskRendering";
import { PlaneWebGlRenderer } from "./PlaneWebGlRenderer";

export function createRenderer(
    type: "image" | "plane" | "cone" | "mask",
): IRenderer {
    switch (type) {
        case "image": return new ImageRenderer();
        case "mask": return new MaskRenderer();
        case "plane": return new PlaneWebGlRenderer();
        default: throw new Error(`Unknown render type: ${type}`);
    }
}