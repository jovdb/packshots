import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageDataAsync, loadImageAsync } from "../utils/image";
import { createRenderers, loadRenders, render } from "../rendering/render";
import { ConfigPanel } from "./ConfigPanel";
import { DrawPolygon, DrawPolygons, useDrawPolygon, useDrawPolygons } from "./DrawPolygon";
import { useElementSize } from "../hooks/useElementSize";
import { fitRectTransform } from "../utils/rect";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { ActionBar } from "./config/ActionBar";
import { useLayersConfig } from "../state/layers";
import { getConfigComponent } from "./config/factory";
import { ILayerState } from "../state/Layer";
import { PlaneRenderer } from "../rendering/PlaneRenderer";
import { Vector2 } from "three";

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

export function Test() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawPolygonRef = useRef<HTMLDivElement>(null);

    // Layers 
    const layers = useLayersConfig(s => s.layers);
    const deleteLayer = useLayersConfig(s => s.deleteLayer);
    const updateConfig = useLayersConfig(s => s.updateConfig);
    const updateUi = useLayersConfig(s => s.updateUi);

    // Get size from image
    /*
    const firstImageRenderer = renderers?.find(r => r instanceof ImageRenderer) as ImageRenderer | undefined;
    */
    const firstImageRenderer: any = undefined;
    const targetWidth = firstImageRenderer?.image?.width || 700;
    const targetHeight = firstImageRenderer?.image?.height || 700;

    // Create a render target 
    const targetContext = canvasRef.current?.getContext("2d");

    const [layersControlPoints, setLayerControlPoints] = useState<(Vector2[] | undefined)[]>([]);
    useQuery(["loaded-renderers", layers], async () => {
        const renderers = createRenderers(targetContext, layers);
        await loadRenders(renderers);
        try {
            render(targetContext, renderers);

            //Update list of control points
            const controlPoints = renderers.map(r => {
                if (r instanceof PlaneRenderer) return r.getCorners2d();
                return undefined; 
            });
            setLayerControlPoints(controlPoints);
        } finally {
            renderers.forEach(r => r.dispose?.());
        }
        return null;
    });

    // Scale and center canvas
    const previewAreaRef = useRef<HTMLDivElement>(null);
    const previewAreaRect = useElementSize(previewAreaRef);
    const margin = 10;
    const centerPreviewToPreviewArea = fitRectTransform({
        top: 0,
        left: 0,
        width: targetWidth,
        height: targetHeight,
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
    
    const bind = useDrawPolygons(
        drawPolygonRef,
        controlPointsInScreenCoordinates,
        (layerIndex, newPointsInScreenCoordinates) => {
            const newPointsInTargetCoordinates = newPointsInScreenCoordinates.map(point => new Vector2(
                point[0] / centerPreviewToPreviewArea.scale,
                point[1] / centerPreviewToPreviewArea.scale,
            ));

            setLayerControlPoints(layerControlPoints => {
                let newLayerControlPoints = layerControlPoints.slice();
                newLayerControlPoints[layerIndex] = newPointsInTargetCoordinates;
                return newLayerControlPoints;
             });
        });

    const [isConfigExpanded, setIsConfigExpanded] = useState(true);
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
                    width={targetWidth}
                    height={targetHeight}
                    style={{
                        position: "absolute",
                        width: targetWidth * centerPreviewToPreviewArea.scale,
                        height: targetHeight * centerPreviewToPreviewArea.scale,
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
                <DrawPolygons
                    ref={drawPolygonRef}
                    style={{
                        position: "absolute",
                        width: targetWidth * centerPreviewToPreviewArea.scale,
                        height: targetHeight * centerPreviewToPreviewArea.scale,
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
                </ConfigPanel>
            </div>
        </div>
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