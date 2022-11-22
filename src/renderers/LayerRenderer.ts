import { isPromise } from "../../utils/promise";
import { TreeNode } from "../Tree";
import { IRenderer } from "./IRenderer";

export interface IRendererNodeValue {
    renderer: IRenderer;
    config: {};
}

export class RenderingNode extends TreeNode<IRendererNodeValue> {
    constructor(
        renderer: IRenderer,
        config: {},
        children?: RenderingNode[],
    ) {
        super({ renderer, config }, children);
    }
}

export type LayerNode = RenderingNode;

/** 
 * A Layer can have nested rendereres, like a Mask Renderer
 * The layer renderer will pass the config to the renderer
*/
export function layerRenderer(treeNode: LayerNode) {

    return {
        render(targetContext: CanvasRenderingContext2D, isDragging: boolean): void {
            treeNode.walk(
                (item) => { item.renderer.render(targetContext, item.config, isDragging); },
                (item, result) => { item.renderer.renderAfterChild?.(targetContext, result); } // Dispose in reverse order
            );
        },

        loadAsync(): undefined | Promise<unknown> {
            const loadPromises = treeNode
                .flatten()
                .map(item => item.renderer.loadAsync?.(item.config));
            if (!loadPromises.some(isPromise))
                return; // Sync result
            return Promise.all(loadPromises);
        },

        dispose(): void {
            treeNode.walk(
                () => { },
                (item) => { item.renderer.dispose?.(); } // Dispose in reverse order
            );
        }
    };
}
