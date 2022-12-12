import { Matrix3, Matrix4, Vector2, Vector3 } from "three";
import { IConeRendererConfig } from "../../../components/config/ConeRendererConfig";
import { getImageDataAsync } from "../../../utils/image";
import { ControlPoint } from "../../controlPoints/IControlPoints";
import { getImageUrl, PackshotRoot } from "../../stores/app";
import { ConeGeometry } from "../geometries/ConeGeometry";
import type { IRenderer, IRenderResult } from "../IRenderer";
import { PointTextureSampler } from "../samplers/PointTextureSampler";
import { controlPointsToCamera } from "./ControlPoints";
import { rayTracer } from "./RayTracer";

function toCanvasPoint(
  controlPoint: ControlPoint,
  canvasSize: { width: number; height: number },
  packshotImageSize: { width: number; height: number },
  superSamplingFactor = 1,
): Vector2 {
  const x = canvasSize.width / 2 + controlPoint[0] * packshotImageSize.width / 2;
  const y = canvasSize.height / 2 + controlPoint[1] * packshotImageSize.height / 2;
  return new Vector2(x * superSamplingFactor, y * superSamplingFactor);
}

export class ConeCanvasRenderer implements IRenderer {
  private imageUrl: string | undefined;
  private imageData: ImageData | undefined;

  async loadAsync(
    config: IConeRendererConfig,
    root: PackshotRoot,
  ) {
    const url = await getImageUrl(root, config.image);
    this.imageUrl = url;
    if (!url) {
      this.imageData = undefined;
      return;
    }
    try {
      this.imageData = await getImageDataAsync(url);
    } catch (err) {
      this.imageData = undefined;
      throw err;
    }
  }

  render(
    drawOnContext: CanvasRenderingContext2D,
    config: IConeRendererConfig,
  ): IRenderResult | undefined | void {
    const renderImageData = this.imageData;
    if (!renderImageData || !config) return undefined;
    const { width: targetWidth, height: targetHeight } = drawOnContext.canvas;

    const cameraPosition = new Vector3(
      1.4183631,
      57.543503,
      -6.3503857,
    );

    // dprint-ignore
    const cameraToProjectionMatrix = new Matrix4().fromArray([
      -0.0010906963,  0.00010193007,  -1.9692556E-05, 0,
      4.993524E-06,   -0.00020674475, -0.0010858503,  0,
      2.2639997,      13.13533,       1,              0,
      0,              0,              0,              1, 
    ]);

    // dprint-ignore
    const uvMatrix = new Matrix3().fromArray([
      80.7, 0,    0,
      0,    80.7, 0,
      0,    0,    1,
    ]);

    const a = this.controlPointsToCamera(config, drawOnContext.canvas, renderImageData);
    console.log(a);

    const renderedContext: CanvasRenderingContext2D | undefined = undefined;
    /*
    const renderedContext = rayTracer({
      targetSize: { width: drawOnContext.canvas.width, height: drawOnContext.canvas.height },
      geometry: new ConeGeometry({
        diameterTop: config.diameterTop,
        diameterBottom: config.diameterBottom ?? config.diameterTop,
        height: config.height,
      }),
      spreadSampler: new PointTextureSampler(renderImageData),
      cameraPosition,
      cameraToProjectionMatrix,
      uvMatrix,
    });
    */

    if (renderedContext) {
      drawOnContext.drawImage(
        renderedContext.canvas,
        0,
        0,
        targetWidth,
        targetWidth,
        0,
        0,
        targetWidth,
        targetHeight,
      );
    }
  }

  /**
   * Cone Points:
   *         ^
   *      -----5-----
   *   4 ´           ` 6
   *    \ `---------´ /
   *     \           /
   *      \         /
   *       \   2   /
   *        1-----3
   */
  public getWorldPoints(config: IConeRendererConfig): Vector3[] {
    const r1 = config.diameterTop / 2;
    const r2 = (config.diameterBottom ?? config.diameterTop) / 2;
    const hh = config.height / 2;

    return [
      new Vector3(-r1, 0, -hh),
      new Vector3(0, r1, -hh),
      new Vector3(r1, 0, -hh),
      new Vector3(-r2, 0, hh),
      new Vector3(0, r2, hh),
      new Vector3(r2, 0, hh),
    ];
  }

  public controlPointsToCamera(
    config: IConeRendererConfig,
    canvasSize: { width: number; height: number },
    packshotSize: { width: number; height: number },
  ) {
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

    const { controlPoints } = config;
    if (controlPoints.length !== 6) throw new Error("6 control points required");

    const worldPoints = this.getWorldPoints(config);
    const canvasPoints = controlPoints.map(p => toCanvasPoint(p, canvasSize, packshotSize));
    console.log(worldPoints, canvasPoints);
  }

  dispose(): void {
    this.imageUrl = undefined;
    this.imageData = undefined;
  }
}
