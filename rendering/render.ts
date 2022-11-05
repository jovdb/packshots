import { ILayerState } from "../state/Layer";
import { createRenderer } from "./factory";
import { IRenderer } from "./IRenderer";

export async function loadRenders(
	targetContext: CanvasRenderingContext2D | null | undefined,
	layers: ILayerState[],
) {
	if (!targetContext) return [];
	const targetSize = {
		width: targetContext.canvas.width,
		height: targetContext.canvas.height,
	}

	const renderers = layers
		.filter(layer => layer.ui?.isVisible !== false)
		.map(layer => createRenderer(layer.type, layer.config, targetSize));
	await Promise.allSettled(renderers.map(r => r.loadAsync?.()));

	return renderers;
}

export async function render(
	targetContext: CanvasRenderingContext2D,
	renderers: IRenderer[],
) {
	if (!targetContext) return;
	targetContext.clearRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);
	renderers.slice().reverse().forEach(renderer => renderer.render(targetContext));
}
