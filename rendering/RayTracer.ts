import { Matrix4, Vector2, Vector3 } from "three";
import { createContext2d, loadImageAsync } from "../utils/image";
import { IGeometry } from "./geometries/IGeometry";
import { ITextureSampler } from "./samplers/ITextureSampler";

export function render({
	targetContext,
	packshotBackgroundImage,
	packshotOverlayImage,
	
	spreadSampler,
	geometry,
	cameraVector,
	cameraToProjectionVector,
}: {
	/** context to draw on */
	targetContext: CanvasRenderingContext2D,
	/** Geometry to place spread on */
	// geometry: IGeometry,
	/** Spread sampler */
	// spreadSampler: ITextureSampler | undefined,
	/* Packshot Backgound Image */
	packshotBackgroundImage: HTMLImageElement | null | undefined;
	/* Packshot Overlay Image */
	packshotOverlayImage: HTMLImageElement | null | undefined;
	/** Vector to place camera from origin */
	// cameraVector: Vector3,
	/** Vector to position packshot projection relative to camera */
	// cameraToProjectionVector: Vector3,
}) {
	const targetSize = {
		width: targetContext.canvas.width ,
		height: targetContext.canvas.height,
	}

	targetContext.clearRect(0, 0, targetSize.width, targetSize.height);
	//targetContext.translate(0.5, 0.5);

	// Packshot Background
	if (packshotBackgroundImage) {
		targetContext.drawImage(packshotBackgroundImage, 0, 0);
	}

	// Add Spread Layer
	const geometryContext = renderGeometry({
		geometry,
		spreadSampler,
		targetSize,
		cameraToProjectionVector,
		cameraVector,
	});
	if (geometryContext) {
		targetContext.drawImage(geometryContext.canvas, 0, 0);
	}

	// Add Packshot Overlay
	if (packshotOverlayImage) {
		targetContext.drawImage(packshotOverlayImage, 0, 0);
	}

	return targetContext;
}


/** Render a spread with geometry on a canvas */
export function renderGeometry({
	targetSize,
	geometry,
	spreadSampler,
	cameraVector,
	cameraToProjectionVector,
}: {
	targetSize: { width: number; height: number} | undefined;
	/** Geometry to place spread on */
	geometry: IGeometry;
	/** Spread sampler */
	spreadSampler: ITextureSampler | undefined;
	/** Vector to place camera from origin */
	cameraVector: Vector3;
	/** Vector to position packshot projection relative to camera */
	cameraToProjectionVector: Vector3;
}) {

	if (!targetSize) return undefined;

	// Create context to render on
	const renderContext = createContext2d(targetSize.width, targetSize.height);
	const renderImageData = renderContext?.getImageData(0, 0, targetSize?.width, targetSize?.height);
	if (!renderContext || !renderImageData) return undefined;

	const xMax = renderImageData.width - 1;
	const xCenter =  Math.floor(renderImageData.width / 2);
	const yCenter =  Math.floor(renderImageData.height / 2);

	if (!spreadSampler) return;
	for (let y = 0; y <= renderImageData.height; y++) {
		for (let x = 0; x <= xMax; ++x) {

			// Cast rays through the packshot projection
			const rayDirection = new Vector3(
				x - xCenter,
				y - yCenter,
				0,
			)

				// Position Packshot projection
				.add(cameraToProjectionVector);

			// Check if ray intersects on geomerty (plane, clone, ...)
			const hit = geometry.intersect(cameraVector, rayDirection);
			if (!hit) continue;

			// Get spread pixel at intersection
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


