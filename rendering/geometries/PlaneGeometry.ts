import { Vector3 } from "three";
import { IGeometry } from "./IGeometry";

export class PlaneGeometry implements IGeometry {

    constructor(
        public readonly width: number,
        public readonly height: number,
    ) {        
    }

    public intersect(cameraPosition: Vector3, rd: Vector3) {
        return rd.multiplyScalar(0.02); 
    }
}
