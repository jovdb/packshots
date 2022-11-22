import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageDataAsync, loadImageAsync } from "../utils/image";
import { ConfigPanel } from "./ConfigPanel";
import { useElementSize } from "../src/hooks/useElementSize";
import { fitRectTransform } from "../utils/rect";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { ActionBar } from "./config/ActionBar";
import { useLayersActions } from "../src/layers/layers";
import { getConfigComponent } from "./config/factory";
import { ILayerConfig } from "../src/layers/ILayerConfig";
import { defaultExportConfig, ExportConfig } from "./config/ExportConfig";
import { ControlPoints } from "./ControlPoints";
import { Renderer } from "./Renderer";
import { Layers } from "./Layers";
import MaskIcon from "../icons/mask.svg";
import EyeIcon from "../icons/eye.svg";
import DelLayer from "../icons/del-layer.svg";

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
    const [exportConfig, setExportConfig] = useState(defaultExportConfig);

    const [isExportExpanded, setIsExportExpanded] = useState(false);

    // Scale and center canvas
    const previewAreaRef = useRef<HTMLDivElement>(null);
    const previewAreaRect = useElementSize(previewAreaRef);

    const centerPreviewToPreviewArea = useZoom(
        exportConfig,
        previewAreaRect,
        15,
    )

    const centerPreviewToPreviewStyle = useMemo(() => ({
        position: "absolute",
        width: exportConfig.width * centerPreviewToPreviewArea.scale,
        height: exportConfig.height * centerPreviewToPreviewArea.scale,
        left: centerPreviewToPreviewArea.x,
        top: centerPreviewToPreviewArea.y,
    } as const), [
        centerPreviewToPreviewArea.scale,
        centerPreviewToPreviewArea.x,
        centerPreviewToPreviewArea.y,
        exportConfig.height,
        exportConfig.width,
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
                    <Layers />
                    <Accordion title="Export" isExpanded={isExportExpanded} setIsExpanded={setIsExportExpanded}>
                        <AccordionPanel>
                            <ExportConfig config={exportConfig} onChange={setExportConfig} />
                        </AccordionPanel>
                    </Accordion>
                </ConfigPanel>
            </div>
        </div >
    );
}