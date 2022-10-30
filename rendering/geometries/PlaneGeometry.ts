import THREE, { Vector2, Vector3, PlaneGeometry as PlaneGeometry2, Raycaster, MeshBasicMaterial, Mesh, DoubleSide, Scene} from "three";
import { IGeometry } from "./IGeometry";

export class PlaneGeometry implements IGeometry {
    private planeGeometry: PlaneGeometry2;
    private plane: Mesh;

    constructor(
        public readonly width: number,
        public readonly height: number,
    ) {
        this.planeGeometry = new PlaneGeometry2(width, height);
        const material = new MeshBasicMaterial( {color: 0xffff00, side: DoubleSide} );
        this.plane = new Mesh( this.planeGeometry, material);
        const scene = new Scene();
        scene.add(this.plane);

    }

    private a = 0;

    public intersect(
        cameraPosition: Vector3,
        rayDirection: Vector3,
    ) {
        // https://www.intenseye.com/resources/image-rectification-and-distance-measurement
if (this.a === 20) {
    // debugger;
}
        const raycaster = new Raycaster(cameraPosition, rayDirection);
        const intersection = raycaster.intersectObject(this.plane)[0];
        this.a++;
        if (!intersection) return;
debugger
        return new Vector2(intersection.uv?.x, intersection.uv?.y);
    }
}
