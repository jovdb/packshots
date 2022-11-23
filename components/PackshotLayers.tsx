import { usePackshotLayers } from "../src/packshot";
import { PackshotLayer } from "./PackshotLayer";

export function PackshotLayers() {
    // Layers 
    const layers = usePackshotLayers();

    return (
        <>
            {
                // Like photoshop, top layer is also on top in panel
                layers
                    .slice()
                    .reverse()
                    .map((layer, i) => {
                        i = layers.length - 1 - i;
                        return (
                            <PackshotLayer key={i} layer={layer} layerIndex={i} />
                        );
                    })
            }
        </>
    );
}
