import { Matrix4, Vector2, Vector3 } from "three";
import { IGeometry } from "./geometries/IGeometry";
import { ITextureSampler } from "./samplers/ITextureSampler";

export function rayTracerRenderer({
	geometry,
	spreadSampler,
	packshotBackgroundImageData,
	packshotOverlayImageData,
	targetImageData,
	cameraVector,
	cameraToProjectionVector,
}: {
	/** Geometry to place spread on */
	geometry: IGeometry,
	/** Spread sampler */
	spreadSampler: ITextureSampler | undefined,
	/* Packshot Backgound Image */
	packshotBackgroundImageData: ImageData | undefined;
	/* Packshot Overlay Image */
	packshotOverlayImageData: ImageData | undefined;
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

	// Start with packshot image
	if (packshotBackgroundImageData) {
		targetImageData.data.set(packshotBackgroundImageData.data);
	}

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
				.add(cameraToProjectionVector);

			// Check if ray intersects or geomerty (place, clone, ...)
			const hit = geometry.intersect(cameraVector, rayDirection);
			if (!hit) continue;

			// Get spread pixel at intersection
			const imagePos = hit.multiply(new Vector2(spreadSampler.width, spreadSampler.height)).round();
			const rgba = spreadSampler.sample(imagePos);

			// Place spread pixel on the packshot
			// Place copy packshot pixel
			const index = (y * targetImageData.width + x) * 4;
			targetImageData.data[index] = rgba.x;
			targetImageData.data[index + 1] = rgba.y;
			targetImageData.data[index + 2] = rgba.z;
			targetImageData.data[index + 3] = rgba.w; // TODO: Apply transparency

			// TODO: Normal transparancy (QUICK AND DIRTY)
			if (packshotOverlayImageData && packshotOverlayImageData.data[index + 3] > 128) {
				targetImageData.data[index] = packshotOverlayImageData.data[index];
				targetImageData.data[index + 1] = packshotOverlayImageData.data[index + 1];
				targetImageData.data[index + 2] = packshotOverlayImageData.data[index + 1];
				targetImageData.data[index + 3] = packshotOverlayImageData.data[index + 1];
			} else {
				targetImageData.data[index] = rgba.x;
				targetImageData.data[index + 1] = rgba.y;
				targetImageData.data[index + 2] = rgba.z;
				targetImageData.data[index + 3] = rgba.w; // TODO: Apply transparency
			}
		}
	}
}


