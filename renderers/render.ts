import { ILayerState } from "../state/Layer";
import { createRenderer } from "./factory";
import { IRenderer } from "./IRenderer";

export function createRenderers(
	targetContext: CanvasRenderingContext2D | null | undefined,
	layers: ILayerState[],
) {
	if (!targetContext) return [];
	const targetSize = {
		width: targetContext.canvas.width,
		height: targetContext.canvas.height,
	}

	return layers
		.filter(layer => layer.ui?.isVisible !== false)
		.map(layer => createRenderer(layer.type, layer.config, targetSize));
}


export async function loadRenders(
	renderers: IRenderer[],
) {
	await Promise.allSettled(renderers.map(r => r.loadAsync?.()));
}

export async function render(
	targetContext: CanvasRenderingContext2D | null | undefined,
	renderers: IRenderer[],
) {
	if (!targetContext) return;
	targetContext.clearRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);
	renderers.forEach(renderer => renderer.render(targetContext));
}
