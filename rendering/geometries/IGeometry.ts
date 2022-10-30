import { Vector2, Vector3 } from "three";

export interface IGeometry {
    /** 
     * Point on spread image (in spread coordinates) where ray intersects, return undefined if no intersection
     * @param cameraPosition Point where ray starts
     * @param rayDirection trough which the ray goes
     */
    intersect(cameraPosition: Vector3, rayDirection: Vector3): Vector2 | undefined;
}
