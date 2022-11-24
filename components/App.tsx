import { useMemo, useRef, useState } from "react";
import { ConfigPanel } from "./ConfigPanel";
import { useElementSize } from "../src/hooks/useElementSize";
import { fitRectTransform } from "../utils/rect";
import { Accordion, AccordionPanel } from "./Accordion";
import { ActionBar } from "./ActionBar";
import { PackshotConfig } from "./config/PackshotConfig";
import { usePackshotConfig } from "../src/packshot";
import { PackshotLayers } from "./PackshotLayers";

export function useZoom(
    imagesSize: { width: number; height: number },
    previewSize: { width: number; height: number },
    margin: number,
) {
    return useMemo(() => {
        return fitRectTransform({
            top: 0,
            left: 0,
            width: imagesSize.width,
            height: imagesSize.height,
        }, {
            top: margin,
            left: margin,
            width: previewSize.width - margin * 2,
            height: previewSize.height - margin * 2,
        });
    }, [imagesSize.height, imagesSize.width, margin, previewSize.height, previewSize.width]);
}

export function App() {
    const [isConfigExpanded, setIsConfigExpanded] = useState(true);
    const [isExportExpanded, setIsExportExpanded] = useState(false);
    const [packshotConfig, setPackshotConfig] = usePackshotConfig();

    // Scale and center canvas
    const previewAreaRef = useRef<HTMLDivElement>(null);
    const previewAreaRect = useElementSize(previewAreaRef);


    const centerPreviewToPreviewArea = useZoom(
        packshotConfig,
        previewAreaRect,
        15,
    )

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
                TODO
            </div>
            <div>
                <ConfigPanel isOpen={isConfigExpanded} setIsOpen={setIsConfigExpanded}>
                    <ActionBar />
                    <PackshotLayers/>
                    <Accordion title="Export" isExpanded={isExportExpanded} setIsExpanded={setIsExportExpanded}>
                        <AccordionPanel>
                            <PackshotConfig config={packshotConfig} onChange={setPackshotConfig} />
                        </AccordionPanel>
                    </Accordion>
                </ConfigPanel>
            </div>
        </div >
    );
}