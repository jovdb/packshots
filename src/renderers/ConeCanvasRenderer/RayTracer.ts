import { Vector3, Matrix3, Matrix4 } from "three";
import { createContext2d } from "../../utils/image";
import { IGeometry } from "../geometries/IGeometry";
import { ITextureSampler } from "../samplers/ITextureSampler";

/** Render a spread with geometry on a canvas */
export function rayTracer({
  targetSize,
  geometry,
  spreadSampler,
  cameraPosition,
  cameraToProjectionMatrix,
  uvMatrix,
}: {
  targetSize: { width: number; height: number } | undefined;
  /** Geometry to place spread on */
  geometry: IGeometry;
  /** Spread sampler */
  spreadSampler: ITextureSampler | undefined;
  /** Camera placement from origin */
  cameraPosition: Vector3;
  /** Vector to position packshot projection relative to camera */
  cameraToProjectionMatrix: Matrix4;
  
  uvMatrix: Matrix3;
}) {
  if (!targetSize) return undefined;

  // Create context to render on
  const renderContext = createContext2d(targetSize.width, targetSize.height);
  const renderImageData = renderContext?.getImageData(0, 0, targetSize?.width, targetSize?.height);
  if (!spreadSampler || !renderContext || !renderImageData) return undefined;

  for (let y = 0; y <= renderImageData.height; y++) {
    for (let x = 0; x <= renderImageData.width - 1; ++x) {
      // Cast rays through the packshot projection
      const rayDirection = new Vector3(x, y, 1)
        .applyMatrix4(cameraToProjectionMatrix);

      // Check if ray intersects on geomerty (plane, clone, ...)
      const hit = geometry.intersect(cameraPosition, rayDirection);
      if (!hit) continue;

      // Get spread pixel at intersection
      const imagePos = hit.applyMatrix3(uvMatrix).round();
      const rgba = spreadSampler.sample(imagePos);

      // Place spread pixel on the packshot
      const index = (y * renderImageData.width + x) * 4;
      renderImageData.data[index] = rgba.x;
      renderImageData.data[index + 1] = rgba.y;
      renderImageData.data[index + 2] = rgba.z;
      renderImageData.data[index + 3] = rgba.w;
    }
  }

  renderContext.putImageData(renderImageData, 0, 0);
  return renderContext;
}
