import { ILayer } from "../IPackshot";
import { usePackshotActions } from "../stores/packshot";

import { LayerAccordion } from "./LayerAccordion";
import { LayerConfig } from "./LayerConfig";
import { LayerRenderTreeConfig } from "./LayerRenderTreeConfig";

export function Layer({
  layer,
  layerIndex,
}: {
  layer: ILayer;
  layerIndex: number;
}) {
  const { updateLayerConfig } = usePackshotActions();

  return (
    <LayerAccordion
      layer={layer}
      layerIndex={layerIndex}
    >
      {layer.config?.isLayerOptionExpanded && (
        <LayerConfig
          config={layer.config || {}}
          onChange={(newConfig) => updateLayerConfig(layerIndex, newConfig)}
        />
      )}
      {layer.config?.isRenderConfigExpanded && (
        <LayerRenderTreeConfig
          layer={layer}
          layerIndex={layerIndex}
        />
      )}
    </LayerAccordion>
  );
}
