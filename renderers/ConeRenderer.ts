import { Camera, ConeGeometry, CylinderGeometry, DoubleSide, Material, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer } from "three";
import { cameraDefaultConfig, ICameraConfig } from "../components/config/CameraConfig";
import { IConeConfig } from "../components/config/ConeConfig";
import type { IRenderer } from "./IRenderer";

export class ConeRenderer implements IRenderer {

    private config: IConeConfig
    private scene: Scene;
    private geometry: ConeGeometry;
    private camera: Camera;
    private renderer: WebGLRenderer;
    public image: HTMLImageElement | null | undefined;
    private mesh: Mesh | undefined;
    private material: Material | undefined;
    private texture: Texture | undefined;

    constructor(
        private targetSize: { width: number; height: number; },
        config: IConeConfig,
    ) {

        this.config = {
            cone: config.cone || { topDiameter: 10, bottomDiameter: 10, height: 15 },
            camera: config.camera || cameraDefaultConfig,
            image: config.image || { url: "" },
        };

        const info = this.createScene();
        this.scene = info.scene;
        this.geometry = info.geometry;
        this.camera = info.camera;
        this.mesh = info.mesh;
        this.renderer = info.renderer;
    }

    private createScene() {
        const scene = new Scene();
        const {
            cone,
            camera: cameraConfig,
        } = this.config;

        // --------------------
        // Camera
        // --------------------
        const camera = new PerspectiveCamera(cameraConfig?.fieldOfViewInDeg ?? 75, this.targetSize.width / this.targetSize.height);
        camera.position.x = cameraConfig.position[0] ?? 0;
        camera.position.y = cameraConfig.position[1] ?? 0;
        camera.position.z = cameraConfig.position[2] ?? 50;
        if (cameraConfig.direction) camera.lookAt(new Vector3(cameraConfig.direction[0], cameraConfig.direction[1], cameraConfig.direction[2]));

        // --------------------
        // Renderer
        // --------------------
        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(this.targetSize.width, this.targetSize.height);

        // --------------------
        // Scene
        // --------------------
        const geometry = new CylinderGeometry((cone.topDiameter ?? 10) / 2 , (cone.bottomDiameter ?? 10) / 2, cone.height ?? 15, 60);
        const mesh = new Mesh(geometry, undefined); // Material assigned later
        scene.add(mesh);

        return {
            scene,
            geometry,
            camera,
            renderer,
            mesh,
        }
    }

    async loadAsync() {
        if (this.texture || !this.mesh) return;

        // Load Texture/Image
        const loader = new TextureLoader();
        const url = this.config?.image?.url ?? "";
        this.texture = url ? await loader.loadAsync(url) : undefined;

        // Create Material
        if (!this.texture) return;
        this.texture.needsUpdate = true;
        this.material = new MeshBasicMaterial({ map: this.texture, side: DoubleSide });

        // Update Mesh
        this.mesh.material = this.material;
    }

    public render(targetContext: CanvasRenderingContext2D) {
        this.renderer.render(this.scene, this.camera);
        targetContext.drawImage(this.renderer.getContext().canvas, 0, 0);
    }

    public getCorners2d(): [
        topLeft: Vector2,
        topRight: Vector2,
        bottomRight: Vector2,
        bottomLeft: Vector2,
    ] {
        // Get 3D Corners
        const corners3d: Vector3[] = [];
        const positionAttribute = this.geometry.getAttribute("position"); // read vertex
        for (let i = 0; i < positionAttribute.count; i++) {
            const vertex = new Vector3();
            vertex.fromBufferAttribute(positionAttribute, i); // read vertex
            corners3d.push(vertex);
        }

        // Convert to 2D corners
        this.camera.updateMatrixWorld();
        const corners2d = corners3d.map(v => {
            const projected = v.clone().project(this.camera);
            return new Vector2(
                Math.round((projected.x + 1) * this.targetSize.width / 2),
                Math.round((-projected.y + 1) * this.targetSize.height / 2),
            );
        });

        return [corners2d[0], corners2d[1], corners2d[3], corners2d[2]]
    }

    public getCamera(corners2d: Vector2[]): ICameraConfig {
        // Camera Calibration: https://www.analyticsvidhya.com/blog/2021/10/a-comprehensive-guide-for-camera-calibration-in-computer-vision/
        // https://math.stackexchange.com/questions/296794/finding-the-transform-matrix-from-4-projected-points-with-javascript
        // https://se.mathworks.com/matlabcentral/answers/410103-how-to-find-projective-transformation-with-4-points
        // https://gregorkovalcik.github.io/opencv_contrib/tutorial_charuco_detection.html
        // https://www.youtube.com/watch?v=
        // https://www.researchgate.net/publication/284786954_Camera_Calibration_and_Pose_Estimation_from_Planes
        // https://docs.opencv.org/4.x/d7/d53/tutorial_py_pose.html

        if (corners2d?.length !== 4) throw new Error("Four corner points expected");
    }

    public dispose() {
        this.geometry?.dispose();
        this.texture?.dispose();
        this.renderer.dispose();
        this.material?.dispose();
    }
}