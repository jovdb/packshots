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
import { IMaskConfig, MaskConfig } from "./config/MaskConfig";

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

export function Test() {
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
                <Renderer
                    width={exportConfig.width}
                    height={exportConfig.height}
                    style={centerPreviewToPreviewStyle}
                />

                <ControlPoints
                    style={centerPreviewToPreviewStyle}
                />
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

export function Layer({
    layer,
    layerIndex
}: {
    layer: ILayerConfig,
    layerIndex: number,
}) {
    const { deleteLayer, updateConfig, updateUi, updateLayer } = useLayersActions();
    const ConfigComponent = getConfigComponent(layer);
    return (
        <Accordion
            title={layer.name}
            isExpanded={!!layer.ui?.isExpanded}
            setIsExpanded={(value) => {
                updateUi(layerIndex, { isExpanded: value });
            }}
            left={<>
                <AccordionButton
                    title="Show/Hide layer"
                    isActive={layer.ui?.isVisible ?? true}
                    onClick={() => {
                        const isVisible = layer.ui?.isVisible ?? true;
                        updateUi(layerIndex, { isVisible: !isVisible });
                    }}>
                    <EyeIcon width={16} />
                </AccordionButton>
                {layer.mask && (
                    <AccordionButton
                        title="Enable/Disable Mask"
                        isActive={!layer.mask.isDisabled}
                        onClick={() => {
                            const mask = layer.mask || {}; 
                            mask.isDisabled = !(mask?.isDisabled ?? true);
                            updateLayer(layerIndex, { ...layer, mask });
                        }}>
                        <MaskIcon width={16} />
                    </AccordionButton>
                )}
            </>}
            right={<>
                <AccordionButton
                    title="Remove layer"
                    style={{ paddingRight: 10 }}
                    onClick={() => {
                        const shouldRemove = confirm("Are you sure you want to remove this layer?");
                        if (shouldRemove) deleteLayer(layerIndex);
                    }}
                >
                    <DelLayer width={20} />
                </AccordionButton>
            </>}
        >
            <AccordionPanel>
                {ConfigComponent && (<>
                    <ConfigComponent
                        config={layer.config}
                        onChange={(config) => {
                            updateConfig(layerIndex, config);
                        }}
                    />
                    {layer.mask && (
                        <fieldset>
                            <legend style={{ userSelect: "none" }}>
                                <input
                                    type="checkbox"
                                    id={`mask_${layerIndex}`}
                                    checked={!layer.mask.isDisabled}
                                    style={{ transform: "translate(0, 2px)" }}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        const mask = layer.mask || {}; 
                                        mask.isDisabled = !isChecked;
                                        updateLayer(layerIndex, { ...layer, mask });
                                    }}
                                />
                                <label htmlFor={`mask_${layerIndex}`} style={{ cursor: "pointer" }}>Mask</label>
                            </legend>
                            <MaskConfig
                                config={layer.mask}
                                onChange={(mask) => {
                                    updateLayer(layerIndex, { ...layer, mask });
                                }}
                            />
                        </fieldset>
                    )}
                </>)}
            </AccordionPanel>
        </Accordion>
    );
}