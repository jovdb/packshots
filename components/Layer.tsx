import { usePackshotActions } from "../src/packshot";
import { ILayer, IPackshot, IPackshotConfig } from "../src/IPackshot";

import { walkTree } from "../src/Tree";
import { LayerConfig } from "./LayerConfig";
import { LayerRenderTreeConfig } from "./LayerRenderTreeConfig";
import { LayerAccordion } from "./LayerAccordion";

export function Layer({
    layer,
    layerIndex
}: {
    layer: ILayer,
    layerIndex: number,
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
