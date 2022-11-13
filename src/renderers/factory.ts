import { ConeRenderer } from "./ConeRenderer";
import { ImageRenderer } from "./ImageRenderer";
import { IRenderer } from "./IRenderer";
import { PlaneRenderer } from "./PlaneRenderer";
import { PlaneRenderer2 } from "./PlaneRenderer2";
import { PlaneGlFxRenderer } from "./PlaneGlFxRenderer";

export function createRenderer(
    type: "image" | "plane" | "cone" | "plane2" | "plane3",
    config: unknown,
): IRenderer {
    switch (type) {
        case "image": return new ImageRenderer();
        // case "plane": return new PlaneRenderer(targetSize, config as any);
        // case "plane2": return new PlaneRenderer2(targetSize, config as any);
        case "plane3": return new PlaneGlFxRenderer();
        // case "cone": return new ConeRenderer(targetSize, config as any);
        default: throw new Error(`Unknown render type: ${type}`);
    }
}