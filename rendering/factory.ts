import { ConeRenderer } from "./ConeRenderer";
import { ImageRenderer } from "./ImageRenderer";
import { PlaneRenderer } from "./PlaneRenderer";

export function createRenderer(
    type: "image" | "plane" | "cone",
    config: unknown,
    targetSize: { width: number; height: number; },
) {
    switch (type) {
        case "image": return new ImageRenderer(config as any);
        case "plane": return new PlaneRenderer(targetSize, config as any);
        case "cone": return new ConeRenderer(targetSize, config as any);
        default: throw new Error(`Unknown render type: ${type}`);
    }
}