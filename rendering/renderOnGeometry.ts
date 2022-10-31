import { Matrix3, Vector2, Vector3, Vector4 } from "three";
import { ICamera } from "../components/ProjectionConfig";
import { createContext2d, loadImageAsync } from "../utils/image";
import { IGeometry } from "./geometries/IGeometry";
import { ITextureSampler } from "./samplers/ITextureSampler";

/** Render a spread with geometry on a canvas (using RayTracing) */
export function renderOnGeometry({
	targetSize,
	geometry,
	spreadSampler,
	camera,
}: {
	targetSize: { width: number; height: number} | undefined;
	/** Geometry to place spread on */
	geometry: IGeometry;
	/** Spread sampler */
	spreadSampler: ITextureSampler;
	/** Camera information */
	camera: ICamera;
}) {
	if (!targetSize) return undefined;
	// https://gabrielgambetta.com/computer-graphics-from-scratch/02-basic-raytracing.html

	// Create context to render on
	const renderContext = createContext2d(targetSize.width, targetSize.height);
	const renderImageData = renderContext?.getImageData(0, 0, targetSize.width, targetSize.height);
	if (!renderContext || !renderImageData) return undefined;

	const xMax = targetSize.width - 1;
	const xCenter =  Math.floor(targetSize.width / 2);
	const yCenter =  Math.floor(targetSize.height / 2);
/*
	const projectionMatrix = new Vector3()
		.add(new Vector3(0, 0, camera.viewPortDistance))
		.multiply(new Vector3(
			camera.viewPortSize.x / spreadSampler.width,
			camera.viewPortSize.y / spreadSampler.height,
			1,
		));
*/
	for (let y = 0; y <= targetSize.height; y++) {
		for (let x = 0; x <= xMax; ++x) {

			// Cast rays through the packshot projection
			const rayDirection = new Vector3(
				x - xCenter,
				y - yCenter,
				0,
			)

				// Position Packshot projection
				.multiply(new Vector3(
					camera.viewPortSize.x / targetSize.width,
					camera.viewPortSize.y / targetSize.height,
					1,
				))
				.add(new Vector3(0, 0, camera.viewPortDistance));
			console.log(targetSize.width);
			// Check if ray intersects on geomerty (plane, clone, ...)
			const hit = geometry.intersect(camera.position, rayDirection);
			if (!hit) continue;

			// Get spread pixel at intersection
			// (spread images is stretch to the planeà
			const imagePos = hit.multiply(new Vector2(spreadSampler.width, spreadSampler.height)).round();
			const rgba = spreadSampler.sample(imagePos);

			// Place spread pixel on the packshot
			// Place copy packshot pixel
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


