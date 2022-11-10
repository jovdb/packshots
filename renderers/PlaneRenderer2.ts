import { Camera, DoubleSide, Material, Matrix3, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer } from "three";
import { cameraDefaultConfig, ICameraConfig } from "../components/config/CameraConfig";
import { IPlaneConfig2 } from "../components/config/PlaneConfig2";
import { IWithControlPoints } from "../control-points";
import { loadImageAsync } from "../utils/image";
import type { IRenderer } from "./IRenderer";

export class PlaneRenderer2 implements IRenderer, IWithControlPoints {
    private image: HTMLImageElement | undefined;
    private config: IPlaneConfig2
    private packshotSize: { width: number; height: number; };

    private scene: Scene;
    private geometry: PlaneGeometry;
    private camera: Camera;
    private renderer: WebGLRenderer;
    private mesh: Mesh | undefined;
    private material: Material | undefined;
    private texture: Texture | undefined;

    constructor(
        private targetSize: { width: number; height: number; },
        config: IPlaneConfig2,
    ) {
        this.packshotSize = targetSize;
        this.config = {
            image: config.image || { url: "" },
            projectionMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
        };

        const info = this.createScene();
        this.scene = info.scene;
        this.geometry = info.geometry;
        this.camera = info.camera;
        this.mesh = info.mesh;
        this.material = info.material;
        this.renderer = info.renderer;
    }

    private getCanvasControlPoint(vector: [x: number, y: number]): Vector2 {
        const x = this.targetSize.width / 2 + vector[0] * this.packshotSize.width / 2;
        const y = this.targetSize.height / 2 + vector[1] * this.packshotSize.height / 2;
        return new Vector2(x, y);
    }

    private getProjectionPoint(p: Vector2): [x: number, y: number] {
        const x = 2 * (p.x - this.targetSize.width / 2) / this.packshotSize.width;
        const y = 2 * (p.y - this.targetSize.height / 2) / this.packshotSize.height;
        return [x, y];
    }

    /** Returns the 3x3 matrix that maps an image to the projected points */
    private getMapping([p0, p1, p2, p3]: Vector2[]): Matrix3 | undefined {
        /*
            
            p0       p1
            +-------+
            |       |
            |       |
            +-------+
            p3       p2

            */

        // https://math.stackexchange.com/questions/296794/finding-the-transform-matrix-from-4-projected-points-with-javascript/339033#339033
        //
        // TODO: See also
        // https://math.stackexchange.com/questions/62936/transforming-2d-outline-into-3d-plane/63100#63100
        // https://math.stackexchange.com/questions/185708/problem-in-deducing-perspective-projection-matrix/186254#186254
        // https://en.wikipedia.org/wiki/Homography#Mathematical_definition


        /*
            q3       q1
            +-------+
            |       |
            |       |
            +-------+
            q2       q4
            */

        let q1 = p1;
        let q2 = p3;
        let q3 = p0;
        let q4 = p2;

        /*
        const mat = new Matrix4().fromArray([
            q1.x, q1.y, 1, 0,
            q2.x, q2.y, 1, 0,
            q3.x, q3.y, 1, 0,
            0, 0, 0, 1
        ]);
        const inv = mat.clone().invert();
        */

        const mat3 = new Matrix3().fromArray([
            q1.x, q1.y, 0,
            q2.x, q2.y, 0,
            q3.x, q3.y, 1,
        ]);
        const inv3 = mat3.clone().invert();

        var scales = new Vector3(q4.x, q4.x, 1).applyNormalMatrix(inv3);

        var s1 = scales.x;
        var s2 = scales.y;
        var s3 = scales.z;

        return new Matrix3().fromArray([
            q1.x * s1, q2.x * s2, q3.x * s3,
            q1.y * s1, q2.y * s2, q3.y * s3,
            s1, s2, s3
        ]);
    }

    private getProjectionMatrix([p0, p1, p2, p3]: [x: number, y: number][]): Matrix3 | undefined {
        const dst0 = this.getCanvasControlPoint(p0);
        const dst1 = this.getCanvasControlPoint(p1);
        const dst2 = this.getCanvasControlPoint(p2);
        const dst3 = this.getCanvasControlPoint(p3);

        const src0 = new Vector2(0, 0);
        const src1 = new Vector2(1, 0);
        const src2 = new Vector2(1, 1);
        const src3 = new Vector2(0, 1);

        const maybeA = this.getMapping([src0, src1, src2, src3]);
        const maybeB = this.getMapping([dst0, dst1, dst2, dst3]);

        if (!maybeA || !maybeB) return undefined;

        const invA = maybeA.invert();

        const matC = maybeB.premultiply(invA);

        // Testing
        // var t0 = matC.MapPoint(0, 0);
        // var t1 = matC.MapPoint(1, 0);
        // var t2 = matC.MapPoint(0, 1);
        // var t3 = matC.MapPoint(1, 1);

        return matC;
    }

    /** Get Horizontal FOV to fit mesh on screen */
    private getFov(planeMesh: Mesh<PlaneGeometry>, distanceFromCamera: number) {
        const planeWidth = planeMesh.geometry.parameters.width;
        return Math.atan2(planeWidth / 2, distanceFromCamera) * 360 / Math.PI;
    }

    private createScene() {
        const scene = new Scene();

        // --------------------
        // Renderer
        // --------------------
        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(this.targetSize.width, this.targetSize.height);

        // --------------------
        // Create Scene
        // --------------------
        console.log("width", this.image?.width);
        const geometry = new PlaneGeometry(this.image?.width || 10, this.image?.height || 10);
        const material = new MeshBasicMaterial({ color: 0xffff00, side: DoubleSide });
        const mesh = new Mesh(geometry, material); // Material assigned later
        scene.add(mesh);

        // --------------------
        // Camera
        // --------------------
        const z = 1;
        const fov = this.getFov(mesh, z);
        const camera = new PerspectiveCamera(fov, this.targetSize.width / this.targetSize.height);
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = z;


        return {
            scene,
            geometry,
            camera,
            material,
            renderer,
            mesh,
        }
    }

    public render(targetContext: CanvasRenderingContext2D) {
        if (this.image) {

            /*
                        const projectionMatrix = this.getProjectionMatrix([
                            [0, 0],
                            [1, 0],
                            [0, 1],
                            [1, 1],
                        ]);
                        if (!projectionMatrix) return;
            
                        // const matrixValues2 = projectionMatrix.toArray();
                        /*const matrixValues = [
                            1 / targetContext.canvas.width, 0, 0,
                            0, 1 / targetContext.canvas.height, 0,
                            0, 0, 1,
                        ];
                        */
            /*
                        const a = new Matrix3().fromArray([
                            1 / targetContext.canvas.width, 0, 0,
                            0, 1 / targetContext.canvas.height, 0,
                            0, 0, 1,
                        ]);
            
                        console.log(projectionMatrix);
                        const matrixValues = (projectionMatrix).invert().toArray();
            
                        const matrix4 = new Matrix4().fromArray([
                            matrixValues[0], matrixValues[1], matrixValues[2], 0,
                            matrixValues[3], matrixValues[4], matrixValues[5], 0,
                            matrixValues[6], matrixValues[7], matrixValues[8], 0,
                            0, 0, 0, 1,
                        ]);
            */
            const projectionMatrix = new Matrix4().fromArray(this.config.projectionMatrix);
            // this.camera.projectionMatrix.multiply(projectionMatrix);
            this.renderer.render(this.scene, this.camera);

            targetContext.drawImage(
                this.renderer.getContext().canvas,
                0, 0, this.packshotSize.width, this.packshotSize.height,
                0, 0, targetContext.canvas.width, targetContext.canvas.height,
            );
            console.log("rendered", this.texture);
        }
    }

    public async loadAsync() {
        this.image = await loadImageAsync(this.config.image.imageUrl);

        this.texture = new Texture(this.image);
        this.texture.needsUpdate = true;
        this.material = new MeshBasicMaterial({ map: this.texture, side: DoubleSide });
        // Update Mesh
        if (this.mesh) this.mesh.material = this.material;
        console.log("loaded");
    }

    getControlPoints2d(): Vector2[] {
        const planeSize = this.targetSize;
        const halfX = planeSize.width / 2;
        const halfY = planeSize.height / 2;

        const points = ([
            [-halfX, -halfY],
            [halfX, -halfY],
            [halfX, halfY],
            [-halfX, halfY],
        ] as [number, number][])
            // .map(p => this.getCanvasControlPoint(p))
            .map(p => new Vector3(p[0], p[1], 0).project(this.camera))
      //      .map(p => new Vector2(p.x / 8, p.y / 8))
            .map(p => new Vector2(p.x + this.targetSize.width / 2, p.y + this.targetSize.height / 2));
        return points;
    }

    getCameraFromControlPoints(corners2d: Vector2[]): ICameraConfig {
        throw new Error("Method not implemented.");
    }


    public dispose() {
        this.geometry.dispose();
        this.material?.dispose();
        this.texture?.dispose();
        this.renderer.dispose();
    }

}