import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageDataAsync, loadImageAsync } from "../utils/image";
import { ConfigPanel } from "./ConfigPanel";
import { useElementSize } from "../src/hooks/useElementSize";
import { fitRectTransform } from "../utils/rect";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { ActionBar } from "./config/ActionBar";
import { useConfigs, useLayers, useLayersActions, useRenderers } from "../src/layers/layers";
import { getConfigComponent } from "./config/factory";
import { ILayerConfig } from "../src/layers/ILayerConfig";
import { defaultExportConfig, ExportConfig } from "./config/ExportConfig";
import { isPromise } from "../src/renderers/PlaneGlFxRenderer";
import { IRenderer } from "../src/renderers/IRenderer";
import { ControlPoints } from "./ControlPoints";
import { useAllControlPoints, useControlPoints } from "../src/controlPoints/store";
import { Renderer } from "./Renderer";

export function useImageDataFromUrl(url: string) {
    return useQuery(["imageData", url], () => url ? getImageDataAsync(url) : null, {
        refetchOnWindowFocus: false,
    });
}

export function useImageFromUrl(url: string) {
    return useQuery(["loadImage", url], () => url ? loadImageAsync(url) : null, {
        refetchOnWindowFocus: false,
    });
}

export function useImageFromUrls(urls: string[]) {
    return useQuery(["loadImage", ...urls], () => Promise.all(urls.map(loadImageAsync)), {
        refetchOnWindowFocus: false,
    });
}


export function Test() {
    // Layers 
    const layers = useLayers();

    const [isConfigExpanded, setIsConfigExpanded] = useState(true);
    const [exportConfig, setExportConfig] = useState(defaultExportConfig);

    const [isExportExpanded, setIsExportExpanded] = useState(false);

    // Scale and center canvas
    const previewAreaRef = useRef<HTMLDivElement>(null);
    const previewAreaRect = useElementSize(previewAreaRef);
    const margin = 15;

    const centerPreviewToPreviewArea = useMemo(() => {
        return fitRectTransform({
            top: 0,
            left: 0,
            width: exportConfig.width,
            height: exportConfig.height,
        }, {
            top: margin,
            left: margin,
            width: previewAreaRect.width - margin * 2,
            height: previewAreaRect.height - margin * 2,
        });
    }, [exportConfig.height, exportConfig.width, previewAreaRect.height, previewAreaRect.width]);

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
                    width={exportConfig.width}
                    height={exportConfig.height}
                    style={{
                        position: "absolute",
                        width: exportConfig.width * centerPreviewToPreviewArea.scale,
                        height: exportConfig.height * centerPreviewToPreviewArea.scale,
                        left: centerPreviewToPreviewArea.x,
                        top: centerPreviewToPreviewArea.y,
                    }}
                />

                <ControlPoints
                    style={{
                        position: "absolute",
                        width: exportConfig.width * centerPreviewToPreviewArea.scale,
                        height: exportConfig.height * centerPreviewToPreviewArea.scale,
                        left: centerPreviewToPreviewArea.x,
                        top: centerPreviewToPreviewArea.y,
                    }}
                ></ControlPoints>
            </div>
            <div>
                <ConfigPanel isOpen={isConfigExpanded} setIsOpen={setIsConfigExpanded}>
                    <ActionBar />
                    {
                        // Like photoshop, top layer is also on top in panel
                        layers.slice().reverse().map((layer, i) => {
                            i = layers.length - 1 - i;
                            return (
                                <Layer key={i} layer={layer} layerIndex={i} />
                            );
                        })
                    }
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

export function Layer({
    layer,
    layerIndex
}: {
    layer: ILayerConfig,
    layerIndex: number,
}) {
    const { deleteLayer, updateConfig, updateUi } = useLayersActions();
    const ConfigComponent = getConfigComponent(layer);
    return (
        <Accordion
            title={layer.name}
            isExpanded={!!layer.ui?.isExpanded}
            setIsExpanded={(value) => {
                updateUi(layerIndex, { isExpanded: value });
            }}
            right={<>
                <AccordionButton
                    title="Show/Hide layer"
                    style={{ opacity: (layer.ui?.isVisible ?? true) ? 1 : 0.5 }}
                    onClick={() => {
                        const isVisible = layer.ui?.isVisible ?? true;
                        updateUi(layerIndex, { isVisible: !isVisible });
                    }}>
                    👁
                </AccordionButton>
                <AccordionButton
                    title="Remove layer"
                    onClick={() => {
                        const shouldRemove = confirm("Are you sure you want to remove this layer?");
                        if (shouldRemove) deleteLayer(layerIndex);
                    }}
                >
                    ✕
                </AccordionButton>
            </>}
        >
            <AccordionPanel>
                {ConfigComponent && (
                    <ConfigComponent
                        config={layer.config}
                        onChange={(config) => {
                            updateConfig(layerIndex, config);
                        }}
                    />
                )}
            </AccordionPanel>
        </Accordion>
    );
}