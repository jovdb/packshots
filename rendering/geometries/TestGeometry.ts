import { Vector3 } from "three";
import { IGeometry } from "./IGeometry";

export class TestGeometry implements IGeometry {
    public intersect(cameraPosition: Vector3, rd: Vector3) {
        return rd;
    }
}
