import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageDataAsync, loadImageAsync } from "../utils/image";
import { createRenderers, loadRenders, render } from "../renderers/render";
import { ConfigPanel } from "./ConfigPanel";
import { useElementSize } from "../hooks/useElementSize";
import { fitRectTransform } from "../utils/rect";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { ActionBar } from "./config/ActionBar";
import { useLayersConfig } from "../layers/layers";
import { getConfigComponent } from "./config/factory";
import { ILayerState } from "../layers/ILayer";
import { Vector2 } from "three";
import { DrawPointsSets, usePointsSets } from "./DrawPoints";
import { defaultExportConfig, ExportConfig } from "./config/ExportConfig";

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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawPolygonRef = useRef<HTMLDivElement>(null);

    // Layers 
    const layers = useLayersConfig(s => s.layers);

    const [isConfigExpanded, setIsConfigExpanded] = useState(true);
    const [exportConfig, setExportConfig] = useState(defaultExportConfig);

    // Create a render target 
    const targetContext = canvasRef.current?.getContext("2d");

    const [layersControlPoints, setLayerControlPoints] = useState<([x: number, y: number][] | undefined)[]>([]);
    useQuery(["loaded-renderers", layers, exportConfig], async () => {
        const renderers = createRenderers(targetContext, layers);
        try {
            await loadRenders(renderers);
            render(targetContext, renderers);

            // Update list of control points
            const controlPoints = renderers.map(r => {
                if (isControlPoints(r)) {
                    const b = r.getControlPoints();

                    const a = r.setControlPoints(b);
                    console.log("config from control points", a);

                    return b;

                }
                return undefined;
            });

            setLayerControlPoints(controlPoints);



        } finally {
            renderers.forEach(r => r.dispose?.());
        }
        return null;
    });

    const [isExportExpanded, setIsExportExpanded] = useState(false);

    // Scale and center canvas
    const previewAreaRef = useRef<HTMLDivElement>(null);
    const previewAreaRect = useElementSize(previewAreaRef);
    const margin = 10;
    const centerPreviewToPreviewArea = fitRectTransform({
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

    // Convert controlPoints to screen coordinates
    const controlPointsInScreenCoordinates = layersControlPoints
        .map(layerControlPoints => {
            if (!layerControlPoints) return undefined;
            return layerControlPoints.map(point => {
                if (!point) return undefined;
                return [
                    point.x * centerPreviewToPreviewArea.scale,
                    point.y * centerPreviewToPreviewArea.scale,
                ];
            }) as [number, number][];
        })

    const bind = usePointsSets(
        drawPolygonRef,
        controlPointsInScreenCoordinates,
        (layerIndex, newPointsInScreenCoordinates) => {
            const newPointsInTargetCoordinates = newPointsInScreenCoordinates.map(point => [
                point[0] / centerPreviewToPreviewArea.scale,
                point[1] / centerPreviewToPreviewArea.scale,
            ] as [x: number, y: number]));

    setLayerControlPoints(layerControlPoints => {
        let newLayerControlPoints = [...layerControlPoints];
        newLayerControlPoints[layerIndex] = newPointsInTargetCoordinates;
        return newLayerControlPoints;
    });
});

const checkBoardSize = 25;
const checkBoardDark = "#e8e8e8";
const checkBoardLight = "#f8f8f8";
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
            <canvas
                ref={canvasRef}
                width={exportConfig.width}
                height={exportConfig.height}
                style={{
                    position: "absolute",
                    width: exportConfig.width * centerPreviewToPreviewArea.scale,
                    height: exportConfig.height * centerPreviewToPreviewArea.scale,
                    left: centerPreviewToPreviewArea.x,
                    top: centerPreviewToPreviewArea.y,
                    outline: "1px solid #ddd",
                    boxShadow: "3px 3px 4px rgba(0,0,0,0.1)",
                    // checkboard background
                    backgroundImage: `
                            linear-gradient(45deg, ${checkBoardDark} 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, ${checkBoardDark} 75%),
                            linear-gradient(45deg, transparent 75%, ${checkBoardDark} 75%),
                            linear-gradient(45deg, ${checkBoardDark} 25%, ${checkBoardLight} 25%)`,
                    backgroundSize: `${checkBoardSize}px ${checkBoardSize}px`,
                    backgroundPosition: `
                            0 0,
                            0 0,
                            calc(${checkBoardSize}px * -0.5) calc(${checkBoardSize}px * -0.5),
                            calc(${checkBoardSize}px * 0.5) calc(${checkBoardSize}px * 0.5)`,
                }}
                {...bind()}
            />
            <DrawPointsSets
                ref={drawPolygonRef}
                style={{
                    position: "absolute",
                    width: exportConfig.width * centerPreviewToPreviewArea.scale,
                    height: exportConfig.height * centerPreviewToPreviewArea.scale,
                    left: centerPreviewToPreviewArea.x,
                    top: centerPreviewToPreviewArea.y,
                }}
                layerPoints={controlPointsInScreenCoordinates}
            />
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
    layer: ILayerState,
    layerIndex: number,
}) {
    const deleteLayer = useLayersConfig(s => s.deleteLayer);
    const updateConfig = useLayersConfig(s => s.updateConfig);
    const updateUi = useLayersConfig(s => s.updateUi);
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