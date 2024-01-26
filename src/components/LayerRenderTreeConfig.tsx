import { ILayer } from "../IPackshot";
import { usePackshotActions } from "../stores/packshot";
import { flattenTree, replaceTreeNode } from "../Tree";
import { ConfigComponent, getConfigComponent } from "./config/factory";

export function LayerRenderTreeConfig({
  layer,
  layerIndex,
}: {
  layer: ILayer;
  layerIndex: number;
}) {
  const { updateLayerRenderTree } = usePackshotActions();

  const renderers = flattenTree(layer.renderTree);

  const RendererConfigComponents = renderers
    .map(r => getConfigComponent(r.type))
    .filter(c => !!c) as ConfigComponent<{}>[]; // Remove empty onces

  return (
    <>
      {RendererConfigComponents.map((ConfigComponent, rendererIndex) => (
        <ConfigComponent
          key={rendererIndex}
          config={renderers[rendererIndex].config}
          onChange={(newConfig) => {
            const prevRendererNode = renderers[rendererIndex]; // Item to replace
            const newRendererNode = {
              ...prevRendererNode,
              config: newConfig,
            };

            const newRenderTree = replaceTreeNode(layer.renderTree, prevRendererNode, newRendererNode);
            updateLayerRenderTree(layerIndex, newRenderTree);
          }}
        />
      ))}
    </>
  );
}
