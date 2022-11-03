import { BoxGeometry, Camera, ConeGeometry, CylinderGeometry, DoubleSide, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer } from "three";
import { ICamera } from "../components/CameraConfig";
import { IPlaneConfig } from "../data/shapes/plane/PlaneConfig";
import { IRenderer } from "./IRenderer";

export interface IConeRendererProps {
    geometry: IPlaneConfig,
    camera: ICamera;
}

export class ConeRenderer implements IRenderer<IConeRendererProps> {

    private scene: Scene;
    private geometry: ConeGeometry;
    private camera: Camera;
    private renderer: WebGLRenderer;

    constructor(
        private targetSize: { width: number; height: number; },
        private image: HTMLImageElement,
        private config: IConeRendererProps,
    ) {
        const info = this.createScene();
        this.scene = info.scene;
        this.geometry = info.geometry;
        this.camera = info.camera;
        this.renderer = info.renderer;
    }

    private createScene() {
        const scene = new Scene();

        // --------------------
        // Camera
        // --------------------
        const camera = new PerspectiveCamera(this.config.camera.fieldOfViewInDeg, this.targetSize.width / this.targetSize.height);
        camera.position.x = this.config.camera.position.x;
        camera.position.y = this.config.camera.position.y;
        camera.position.z = this.config.camera.position.z;
        camera.lookAt(this.config.camera.direction);
        // TODO: Add Direction

        // --------------------
        // Renderer
        // --------------------
        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(this.targetSize.width, this.targetSize.height);

        // --------------------
        // Scene
        // --------------------
        const geometry = new CylinderGeometry(10, 10, 15, 60);
        const texture = new Texture(this.image);
        if (this.image?.complete) texture.needsUpdate = true;

        const material = new MeshBasicMaterial({ map: texture, side: DoubleSide });
        const mesh = new Mesh(geometry, [material, null, null]);
        // https://stackoverflow.com/questions/8315546/texturing-a-cylinder-in-three-js
        scene.add(mesh);

        return {
            scene,
            geometry,
            camera,
            renderer,
        }
    }

    public render(): WebGLRenderingContext {
        this.renderer.render(this.scene, this.camera);
        return this.renderer.getContext();
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

    public getCamera(corners2d: Vector2[]): ICamera {
        // Camera Calibration: https://www.analyticsvidhya.com/blog/2021/10/a-comprehensive-guide-for-camera-calibration-in-computer-vision/
        // https://math.stackexchange.com/questions/296794/finding-the-transform-matrix-from-4-projected-points-with-javascript
        // https://se.mathworks.com/matlabcentral/answers/410103-how-to-find-projective-transformation-with-4-points
        // https://gregorkovalcik.github.io/opencv_contrib/tutorial_charuco_detection.html
        // https://www.youtube.com/watch?v=
        // https://www.researchgate.net/publication/284786954_Camera_Calibration_and_Pose_Estimation_from_Planes
        // https://docs.opencv.org/4.x/d7/d53/tutorial_py_pose.html

        if (corners2d?.length !== 4) throw new Error("Four corner points expected");

    }
}