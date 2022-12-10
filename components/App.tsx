import { useMemo, useRef, useState } from "react";
import { useElementSize } from "../src/hooks/useElementSize";
import { useLoadedRenderers, usePackshotConfig } from "../src/stores/packshot";
import { fitRectTransform } from "../utils/rect";
import { Accordion, AccordionPanel } from "./Accordion";
import { ActionBar } from "./ActionBar";
import { PackshotConfig } from "./config/PackshotConfig";
import { ConfigPanel } from "./ConfigPanel";
import { Layers } from "./Layers";
import { Renderer } from "./Renderer";

export function useZoom(
  imagesSize: { width: number; height: number },
  previewSize: { width: number; height: number },
  margin: number,
) {
  return useMemo(
    () => (
      fitRectTransform({
        top: 0,
        left: 0,
        width: imagesSize.width,
        height: imagesSize.height,
      }, {
        top: margin,
        left: margin,
        width: previewSize.width - margin * 2,
        height: previewSize.height - margin * 2,
      })
    ),
    [imagesSize.height, imagesSize.width, margin, previewSize.height, previewSize.width],
  );
}

export function App() {
  const [isConfigExpanded, setIsConfigExpanded] = useState(true);
  const [isExportExpanded, setIsExportExpanded] = useState(false);
  const [packshotConfig, setPackshotConfig] = usePackshotConfig();

  useLoadedRenderers();

  // Scale and center canvas
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const previewAreaRect = useElementSize(previewAreaRef);

  const centerPreviewToPreviewArea = useZoom(
    packshotConfig,
    previewAreaRect,
    15,
  );

  const centerPreviewToPreviewStyle = useMemo(() => ({
    position: "absolute",
    width: packshotConfig.width * centerPreviewToPreviewArea.scale,
    height: packshotConfig.height * centerPreviewToPreviewArea.scale,
    left: centerPreviewToPreviewArea.x,
    top: centerPreviewToPreviewArea.y,
  } as const), [
    centerPreviewToPreviewArea.scale,
    centerPreviewToPreviewArea.x,
    centerPreviewToPreviewArea.y,
    packshotConfig.height,
    packshotConfig.width,
  ]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        ref={previewAreaRef}
        style={{
          flexGrow: 1,
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <Renderer
          width={packshotConfig.width}
          height={packshotConfig.height}
          style={centerPreviewToPreviewStyle}
        />
      </div>
      <div>
        <ConfigPanel isOpen={isConfigExpanded} setIsOpen={setIsConfigExpanded}>
          <ActionBar />
          <Layers />
          <Accordion
            title="Export"
            isExpanded={isExportExpanded}
            onExpandClick={() => {
              setIsExportExpanded(prev => !prev);
            }}
          >
            <AccordionPanel>
              <PackshotConfig config={packshotConfig} onChange={setPackshotConfig} />
            </AccordionPanel>
          </Accordion>
        </ConfigPanel>
      </div>
    </div>
  );
}
