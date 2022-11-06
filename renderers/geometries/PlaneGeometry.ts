import { Vector2, Vector3, PlaneGeometry as PlaneGeometry2, Raycaster, MeshBasicMaterial, Mesh, DoubleSide } from "three";
import { IGeometry } from "./IGeometry";

export class PlaneGeometry implements IGeometry {
    private planeGeometry: PlaneGeometry2;
    private plane: Mesh;

    constructor(
        public readonly width: number,
        public readonly height: number,
    ) {
        this.planeGeometry = new PlaneGeometry2(width, height);
        this.planeGeometry.translate(2, 0, 0);
        const material = new MeshBasicMaterial( {color: 0xffff00, side: DoubleSide} );
        this.plane = new Mesh(this.planeGeometry, material);
    }

    public intersect(
        cameraPosition: Vector3,
        rayDirection: Vector3,
    ) {
        // https://www.intenseye.com/resources/image-rectification-and-distance-measurement
        const normalizedRayDirection = rayDirection.clone().normalize();
        const raycaster = new Raycaster(cameraPosition, normalizedRayDirection);
        const intersection = raycaster.intersectObject(this.plane)[0];
        if (!intersection?.uv) return;

        // Because plane is on origin with z = 0, we can return x and y values
        return new Vector2(intersection.uv.x, intersection.uv.y);
    }
}
