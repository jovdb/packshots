import { Matrix3, Matrix4, Vector3 } from "three";
import { IConeRendererConfig } from "../../../components/config/ConeRendererConfig";
import { getImageDataAsync } from "../../../utils/image";
import { ConeGeometry } from "../geometries/ConeGeometry";
import type { IRenderer, IRenderResult } from "../IRenderer";
import { PointTextureSampler } from "../samplers/PointTextureSampler";
import { rayTracer } from "./RayTracer";

export class ConeCanvasRenderer implements IRenderer {
  private imageUrl: string | undefined;
  private imageData: ImageData | undefined;

  async loadAsync(config: IConeRendererConfig) {
    const url = config?.image.url ?? "";
    this.imageUrl = url;
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
    if (!renderImageData) return undefined;
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

    const renderedContext = rayTracer({
      targetSize: { width: drawOnContext.canvas.width, height: drawOnContext.canvas.height },
      geometry: new ConeGeometry({
        topDiameter: 9.2,
        bottomDiameter: 6.3,
        height: 10,
      }),
      spreadSampler: new PointTextureSampler(renderImageData),
      cameraPosition,
      cameraToProjectionMatrix,
      uvMatrix,
    });

    if (renderedContext) {
      drawOnContext.drawImage(
        renderedContext.canvas,
        0,
        0,
        renderedContext.canvas.width,
        renderedContext.canvas.height,
        0,
        0,
        targetWidth,
        targetHeight,
      );
    }
  }

  dispose(): void {
    this.imageUrl = undefined;
    this.imageData = undefined;
  }
}
