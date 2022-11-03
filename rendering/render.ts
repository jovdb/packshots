import { Vector3 } from "three";
import { IGeometry } from "./geometries/IGeometry";
import { PlaneRenderer } from "./PlaneRenderer";
import { renderOnGeometry } from "./renderOnGeometry";
import { ITextureSampler } from "./samplers/ITextureSampler";

export function render({
	targetContext,
	packshotBackgroundImage,
	packshotOverlayImage,
	spreadImage,
	spreadSampler,
	geometry,
	camera,
	cameraToProjectionVector,
}: {
	/** context to draw on */
	targetContext: CanvasRenderingContext2D;
	/** Geometry to place spread on */
	geometry: IGeometry;
	/** Spread sampler */
	spreadSampler: ITextureSampler | undefined;
	/* Spread Image */
	spreadImage: HTMLImageElement | null | undefined;
	/* Packshot Backgound Image */
	packshotBackgroundImage: HTMLImageElement | null | undefined;
	/* Packshot Overlay Image */
	packshotOverlayImage: HTMLImageElement | null | undefined;
	/** Vector to place camera from origin */
	camera: {
		position: Vector3;
		direction: Vector3;
	};
	/** Vector to position packshot projection relative to camera */
	cameraToProjectionVector: Vector3;
}) {
	const targetSize = {
		width: targetContext.canvas.width,
		height: targetContext.canvas.height,
	}

	targetContext.clearRect(0, 0, targetSize.width, targetSize.height);
	// targetContext.translate(-0.5, -0.5);

	// Packshot Background
	if (packshotBackgroundImage) {
		targetContext.drawImage(packshotBackgroundImage, 0, 0);
	}

	// Add Spread Layer
	if (spreadSampler) {
		const geometryContext = renderOnGeometry({
			geometry,
			spreadSampler,
			targetSize,
			cameraToProjectionVector,
			camera,
		});
		if (geometryContext) {
			targetContext.drawImage(geometryContext.canvas, 0, 0);
		}
	}

	// Add Packshot Overlay
	if (packshotOverlayImage) {
		targetContext.drawImage(packshotOverlayImage, 0, 0);
	}

	if (spreadImage) {
		const renderer = new PlaneRenderer(
			targetSize,
			spreadImage, 
			{
				geometry,
				camera,
			},
		);
		const ctx = renderer.render();
		targetContext.drawImage(ctx.canvas, 0, 0);
	}

	return targetContext;
}
