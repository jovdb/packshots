import { PlaneControlPoints } from "./PlaneControlPoints";

export function createControlPoints(
    type: "image" | "plane" | "cone" | "plane2",
) {
    switch (type) {
        case "plane2": return new PlaneControlPoints();
        default: return undefined;
    }
}
