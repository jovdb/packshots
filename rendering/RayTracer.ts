import { Matrix4, Vector3 } from "three";
import { IGeometry } from "./geometries/IGeometry";
import { ITextureSampler } from "./samplers/ITextureSampler";

export function rayTracerRenderer({
	geometry,
	spreadSampler,
	packshotBackgroundImageData,
	targetImageData,
	cameraVector,
	cameraToProjectionVector,
}: {
	/** Geometry to place spread on */
	geometry: IGeometry,
	/** Spread sampler */
	spreadSampler: ITextureSampler | undefined,
	/* Packshot Image */
	packshotBackgroundImageData: ImageData;
	/** target to place spread pixels on */
	targetImageData: ImageData,
	/** Vector to place camera from origin */
	cameraVector: Vector3,
	/** Vector to position packshot projection relative to camera */
	cameraToProjectionVector: Vector3,
}) {
	const xMax = targetImageData.width - 1;
	const xCenter =  Math.floor(targetImageData.width / 2);
	const yCenter =  Math.floor(targetImageData.height / 2);

	const projectionVector = cameraVector
		.clone()
		.add(cameraToProjectionVector);

	// Start with packshot image
	targetImageData.data.set(packshotBackgroundImageData.data);

	if (!spreadSampler) return;
	for (let y = 0; y <= targetImageData.height; y++) {
		for (let x = 0; x <= xMax; ++x) {

			// Cast rays through the packshot projection
			const rayDirection = new Vector3(
				x - xCenter,
				y - yCenter,
				0,
			)

				// Position Packshot projection
				.add(projectionVector);

			// Check if ray intersects or geomerty (place, clone, ...)
			const hit = geometry.intersect(cameraVector, rayDirection);
			if (!hit) continue;

			// Get spread pixel at intersection
			const rgba = spreadSampler.sample(hit);

			// Place spread pixel on the packshot
			// Place copy packshot pixel
			const index = (y * targetImageData.width + x) * 4;
			targetImageData.data[index] = rgba.x;
			targetImageData.data[index + 1] = rgba.y;
			targetImageData.data[index + 2] = rgba.z;
			targetImageData.data[index + 3] = rgba.w; // TODO: Apply transparency
		}
	}
}
