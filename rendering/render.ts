import { Vector3 } from "three";
import { IGeometry } from "./geometries/IGeometry";
import { ImageRenderer } from "./ImageRenderer";
import { IRenderer } from "./IRenderer";
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
	layers,
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
	layers: IRenderer[];
}) {
	const targetSize = {
		width: targetContext.canvas.width,
		height: targetContext.canvas.height,
	}

	targetContext.clearRect(0, 0, targetSize.width, targetSize.height);
	// targetContext.translate(-0.5, -0.5);

	// Packshot Background
	if (packshotBackgroundImage) {
		const renderer = new ImageRenderer(packshotBackgroundImage);
		renderer.render(targetContext);
	}
/*
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
	*/

	layers?.forEach(layer => {
		layer.render(targetContext);
	});

	if (packshotOverlayImage) {
		const renderer = new ImageRenderer(packshotOverlayImage);
		renderer.render(targetContext);
	}

	return targetContext;
}
