import { PlaneControlPoints } from "./PlaneControlPoints";

export function createControlPoints(
    type: "image" | "plane" | "cone" | "plane2" | "plane3",
) {
    switch (type) {
        case "plane2": return new PlaneControlPoints();
        case "plane3": return new PlaneControlPoints();
        default: return undefined;
    }
}
