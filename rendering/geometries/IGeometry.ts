import { Vector3 } from "three";

export interface IGeometry {
    intersect(cameraPosition: Vector3, rd: Vector3): Vector3;
}
