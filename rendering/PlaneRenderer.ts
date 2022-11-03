import { BoxGeometry, Camera, DoubleSide, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer } from "three";
import { ICamera } from "../components/CameraConfig";
import { IPlaneConfig } from "../data/shapes/plane/PlaneConfig";
import { IRenderer } from "./IRenderer";

export interface IPlaneRendererProps {
    geometry: IPlaneConfig,
    camera: ICamera;
}

export class PlaneRenderer implements IRenderer<IPlaneRendererProps> {

    private scene: Scene;
    private geometry: PlaneGeometry;
    private camera: Camera;
    private renderer: WebGLRenderer;

    constructor(
        private targetSize: { width: number; height: number; },
        private image: HTMLImageElement,
        private config: IPlaneRendererProps,
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
        // TODO: Diretion

        // --------------------
        // Renderer
        // --------------------
        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(this.targetSize.width, this.targetSize.height);

        // Add the canvas to the DOM
        // document.body.appendChild(renderer.domElement);

        // --------------------
        // Scene
        // --------------------
        const geometry = new PlaneGeometry(this.config.geometry.width, this.config.geometry.height);
        const texture = new Texture(this.image);
        texture.needsUpdate = true;
        const material = new MeshBasicMaterial({  map: texture, side: DoubleSide });
        const mesh = new Mesh(geometry, material);
        mesh.position.set(0, 0, 0)
        scene.add(mesh);

        return {
            scene,
            geometry,
            camera,
            renderer,
        }
    }

    public render(): WebGLRenderingContext {

        // Render
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
        const positionAttribute  = this.geometry.getAttribute("position"); // read vertex
        for ( let i = 0; i < positionAttribute.count; i ++ ) {
            const vertex = new Vector3();
            vertex.fromBufferAttribute( positionAttribute, i ); // read vertex
            corners3d.push(vertex);
        }

        // Convert to 2D corners
        this.camera.updateMatrixWorld();
        return corners3d.map(v => {
            const projected = v.clone().project(this.camera);
            return new Vector2(
                Math.round( (projected.x + 1 ) * this.targetSize.width  / 2 ),
                Math.round( (-projected.y + 1 ) * this.targetSize.height / 2 ),
            );
        }) as any;
    }
}