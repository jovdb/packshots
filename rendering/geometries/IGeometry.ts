import { Vector2, Vector3 } from "three";

export interface IGeometry {
    /** 
     * Normalized point on spread image (in spread coordinates) where ray intersects,
     * (0, 0): top-left pixel of the image
     * (1, 1): bottom-right pixel of the image 
     * undefined: no intersection
     * @param cameraPosition Point where ray starts
     * @param rayDirection trough which the ray goes
     */
    intersect(cameraPosition: Vector3, rayDirection: Vector3): Vector2 | undefined;
}
