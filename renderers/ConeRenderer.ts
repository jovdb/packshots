import { Camera, ConeGeometry, CylinderGeometry, DoubleSide, Material, Matrix3, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Texture, TextureLoader, Vector2, Vector3, WebGLRenderer } from "three";
import { cameraDefaultConfig, ICameraConfig } from "../components/config/CameraConfig";
import { IConeConfig } from "../components/config/ConeConfig";
import type { IRenderer } from "./IRenderer";

const segments = 60;
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
        const geometry = new CylinderGeometry((cone.topDiameter ?? 10) / 2, (cone.bottomDiameter ?? 10) / 2, cone.height ?? 15, segments);
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
        this.material = new MeshBasicMaterial({ map: this.texture });

        // Update Mesh
        this.mesh.material = [this.material];
    }

    public render(targetContext: CanvasRenderingContext2D) {
        this.renderer.render(this.scene, this.camera);
        targetContext.drawImage(this.renderer.getContext().canvas, 0, 0);
    }

    public getControlPoints2d() {
        // Get 3D Corners
        const corners3d: Vector3[] = [];
        const positionAttribute = this.geometry.getAttribute("position"); // read vertex
        const vertexIndexes = [0, segments / 4, 3 * segments / 4];
        vertexIndexes.forEach(vertexIndex => {
            const vertex = new Vector3();
            vertex.fromBufferAttribute(positionAttribute, vertexIndex); // read vertex
            corners3d.push(vertex);
        });

        // Convert to 2D corners
        this.camera.updateMatrixWorld();
        const corners2d = corners3d.map(v => {
            const projected = v.clone().project(this.camera);
            return new Vector2(
                Math.round((projected.x + 1) * this.targetSize.width / 2),
                Math.round((-projected.y + 1) * this.targetSize.height / 2),
            );
        });

        return corners2d;
    }

    private getWorldPoints() {
        const r1 = this.config.cone.topDiameter / 2;
        const r2 = this.config.cone.bottomDiameter / 2;
        const hh = this.config.cone.height / 2;

        const worldPoints = [
            new Vector3(-r1, 0, -hh),
            new Vector3(0, r1, -hh),
            new Vector3(r1, 0, -hh),
            new Vector3(-r2, 0, hh),
            new Vector3(0, r2, hh),
            new Vector3(r2, 0, hh)
        ];

        return worldPoints;
    }

    private toCanvasPoint(data: Vector2, superSamplingFactor: number) {
        const canvasSize = this.targetSize;
        const x = canvasSize.width / 2 + data.x * canvasSize.width / 2;
        const y = canvasSize.height / 2 + data.y * canvasSize.height / 2;
        return new Vector2(x * superSamplingFactor, y * superSamplingFactor);
    }

    public getCameraFromControlPoints(corners2d: Vector2[]): ICameraConfig {
        // Camera Calibration: https://www.analyticsvidhya.com/blog/2021/10/a-comprehensive-guide-for-camera-calibration-in-computer-vision/
        // https://math.stackexchange.com/questions/296794/finding-the-transform-matrix-from-4-projected-points-with-javascript
        // https://se.mathworks.com/matlabcentral/answers/410103-how-to-find-projective-transformation-with-4-points
        // https://gregorkovalcik.github.io/opencv_contrib/tutorial_charuco_detection.html
        // https://www.youtube.com/watch?v=
        // https://www.researchgate.net/publication/284786954_Camera_Calibration_and_Pose_Estimation_from_Planes
        // https://docs.opencv.org/4.x/d7/d53/tutorial_py_pose.html

        /*
            I wasn't able to find a C# library that implemented the "Direct Linear Transform" that is needed.
            
            So I based the code below on the youtube video https://www.youtube.com/watch?v=GUbWsXU1mac
            and these slides https://www.ipb.uni-bonn.de/html/teaching/photo12-2021/2021-pho1-21-DLT.pptx.pdf 
            
            We know that the 6 projected screen points Si correspond to the following known 3D homogeneous points Qi:
        
            S0 => (-R1, 0, 0, 1),
            S1 => (0, R1, 0, 1),
            S2 => (R1, 0, 0, 1),
            S3 => (-R2, 0, H, 1),
            S4 => (0, R2, H, 1),
            S5 => (R2, 0 H, 1)
            
            The projection matrix is
            
            P = [A1 A2 A3 A4]
                [B1 B2 B3 B4]
                [C1 C2 C3 C4]
                
            The projection of a homogeneous 3D column matrix Q=(Qx, Qy, Qz, 1) is a 2D homogeneous screen point
            
            S = P.Q = [A.Q]
                    [B.Q]
                    [C.Q]
            
            A homogeneous (x,y,w) maps to the 2D point (x/w, y/w). So d*(x,y,w) also maps to (x/w, y/w)...
            
            We only know the screen point Si = (Xi, Yi), which actually is a line/ray from the camera principle point
            to the projection screen (Xi,Yi), so Si *is not a point*.
            
            So we only know the ratios:
            
            A.Q/C.Q = Sx
            B.Q/C.Q = Sy
            
            We can rewrite this as
            
            A.Q - C.Q * Sx = 0
            B.Q - C.Q * Sy = 0
            
            If we put all 6 points in, we get 12 equations:
            
            A.Qi - C.Qi * SiX = 0
            B.Qi - C.Qi * SiY = 0
            
            <=>

            A.Qi +  B*0  - C.Qi * SiX = 0
            A*0  +  B.Qi - C.Qi * SiY = 0
                
            <=>
                
            QiX*A1 + QiY*A2 + QiZ*A3 + 1*A4 + 0  *B1 + 0  *B2 +   0*B3 + 0*B4 - SiX*QiX*C1 - SiX*QiY*C2 - SiX*QiZ*C3 - SiX*C4 = 0  
            0  *A1 + 0  *A2 + 0  *A3 + 0*A4 + QiX*B1 + QiY*B2 + QiZ*B3 + 1*B4 - SiY*QiX*C1 - SiY*QiY*C2 - SiY*QiZ*C3 - SiY*C4 = 0
            
            We can write this as a matrix equation
            
            M . P = 0
            
            where
            
            M row i*2+0 = [QiX QiY QiZ 1   0 0 0 0       -SiX*QiX -SiX*QiY -SiX*QiZ -SiX]
            M row i*2+1 = [0 0 0 0         QiX QiY QiZ 1 -SiY*QiX -SiY*QiY -SiY*QiZ -SiY]
            
            and P = transpose([A1 A2 A3 A4 B1 B2 B3 B4 C1 C2 C3 C4])
            
            M is a 12x12 matrix, P is a 12x1 matrix, so M.P is a 12x1 matrix.
            
            Obviously P=0 is a solution, but one we never want, so we want to put a constraint on the equation.
            
            Since the projection matrix is only defined up-to a scaling factor,
            we can assume dot(P,P) = 1, e.g. the length of the vector ‖P‖ = 1.
            
            We will find the P that minimizes ‖M.P‖² under the constraint that ‖P‖² = 1.
            
            In other words, we want to minimize tr(M.P) . (M.P) such that tr(P).P = 1, or
            
            We can solve this using constrained least squares, by minimizing the loss function:
            
            L(p,λ) = tr(P).tr(M).M.P - λ(tr(P).P - 1)
            
            L is minimized wrt p if its derivative wrt p is zero:
            
            dL(p,λ)/dp = 2.tr(M).M.p - 2.λ.p = 0
            
            <=>
            
            tr(M).M.p = λ.p
            
            This is equivalent to finding the eigenvectors and eigenvalues of tr(M).M
            
            The eigenvector corresponding to the smallest eigenvalue λ gives the solution
        */

        if (corners2d?.length !== 3) throw new Error("Six control points expected");

        const superSamplingFactor = 1;
        const worldPoints = this.getWorldPoints();

        /**
         * Projected points in "normalized" screen coordinates:
         * (0,0) is at center,
         * (1,1) is at (PackshotSize/2, PackshotSize/2) 
         * (-1,-1) is at (-PackshotSize/2, -PackshotSize/2) 
         */
        const projectedPoints = [
            new Vector2(-0.2, -0.4),
            new Vector2(0, -0.2),
            new Vector2(0.2, -0.4),
            new Vector2(-0.3, 0.3),
            new Vector2(0, 0.4),
            new Vector2(0.3, 0.3),
        ];

        const canvasPoints = projectedPoints.map(p => this.toCanvasPoint(p, superSamplingFactor));

        const rows = canvasPoints.flatMap((screenPoint, i) => {
            const worldPoint = worldPoints[i];
            return [
                [
                    worldPoint.x, worldPoint.y, worldPoint.z, 1,
                    0, 0, 0, 0,
                    -screenPoint.x * worldPoint.x, -screenPoint.x * worldPoint.y, -screenPoint.x * worldPoint.z, -screenPoint.x,
                ],
                [
                    0, 0, 0, 0,
                    worldPoint.x, worldPoint.y, worldPoint.z, 1,
                    -screenPoint.y * worldPoint.x, -screenPoint.y * worldPoint.y, -screenPoint.y * worldPoint.z, -screenPoint.y,
                ],
            ];
        });

        function toProjMat(m: Matrix3): Matrix3
		{
            // Debug.Assert(m.RowCount == 12);
			// Debug.Assert(m.ColumnCount == 1);
			//return MatrixBuilder
                // 3x4
             //   .Dense(3, 4, (r, c) => m[r * 4 + c, 0]);
		}

        const mat1 = new Matrix4()
        // mat1.fromArray();
    }

    public dispose() {
        this.geometry?.dispose();
        this.texture?.dispose();
        this.renderer.dispose();
        this.material?.dispose();
    }
}