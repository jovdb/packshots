import { Vector2, Vector3 } from "three";
import { IGeometry } from "./IGeometry";

export class PlaneGeometry implements IGeometry {

    constructor(
        public readonly width: number,
        public readonly height: number,
    ) {
    }

    public intersect(
        cameraPosition: Vector3,
        rayDirection: Vector3
    ) {
        return new Vector2(rayDirection.x, rayDirection.y);
    }
}
