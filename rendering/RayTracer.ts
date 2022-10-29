import { Matrix3, Matrix4, Vector3, Vector2 } from "three";
import { IGeometry } from "./geometries/IGeometry";
import { ITextureSampler } from "./samplers/ITextureSampler";

export function rayTracerRenderer({
	geometry,
	sampler,
	imageData: targetImageData,
	eyePosition,
	canvasToRay,
	uvTransform,
}: {
    geometry: IGeometry,
    sampler: ITextureSampler,
    imageData: ImageData,
    eyePosition: Vector3,
    canvasToRay: Matrix4,
    uvTransform: Matrix3,
}) {
	const uMax = sampler.width - 1;
	const vMax = sampler.height - 1;
	const xMax = targetImageData.width - 1;

	// TODO: Tile-based rendering for better caching?
	for (let y = 0; y <= targetImageData.height; y++) {
		for (let x = 0; x <= xMax; ++x) {
			const rd = new Vector3(x, y, 1).applyMatrix4(canvasToRay);
			const hit = geometry.intersect(eyePosition, rd);

			if (!hit || hit.z <= 0) continue;

			const uv = new Vector2(hit.x, hit.y)
				.applyMatrix3(uvTransform)
				.round(); // round to sample pixel

			if (uv.x < 0 || uv.y < 0 || uv.x >= uMax || uv.y >= vMax) continue; // outside image
			
			const rgba = sampler.sample(uv);
			const index = (y * targetImageData.width + x) * 4;
			targetImageData.data[index] = rgba.x;
			targetImageData.data[index + 1] = rgba.y;
			targetImageData.data[index + 2] = rgba.z;
			targetImageData.data[index + 3] = rgba.w;
		}
	}
}
