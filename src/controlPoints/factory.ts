import { PlaneControlPoints } from "./PlaneControlPoints";

export function createControlPoints(
    type: "image" | "plane" | "cone",
) {
    switch (type) {
        case "plane": return new PlaneControlPoints();
        default: return undefined;
    }
}
