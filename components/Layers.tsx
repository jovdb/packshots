import { useLayers } from "../src/stores/packshot";
import { Layer } from "./Layer";

export function Layers() {
  // Layers
  const layers = useLayers();

  return (
    <>
      {
        // Like photoshop, top layer is also on top in panel
        layers
          .slice()
          .reverse()
          .map((layer, i) => {
            i = layers.length - 1 - i;
            return <Layer key={i} layer={layer} layerIndex={i} />;
          })
      }
    </>
  );
}
