import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageDataAsync, loadImageAsync } from "../utils/image";
import { ConfigPanel } from "./ConfigPanel";
import { useElementSize } from "../src/hooks/useElementSize";
import { fitRectTransform } from "../utils/rect";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { ActionBar } from "./config/ActionBar";
import { useConfigs, useControlPoints, useLayer, useLayersConfig, useRenderers } from "../src/layers/layers";
import { getConfigComponent } from "./config/factory";
import { ILayerConfig } from "../src/layers/ILayerConfig";
import { DrawPointsSets, usePointsSets } from "./DrawPoints";
import { defaultExportConfig, ExportConfig } from "./config/ExportConfig";
import { ControlPoint, IControlPointsConfig, isControlPoints } from "../src/controlPoints/IControlPoints";
import { isPromise } from "../src/renderers/PlaneGlFxRenderer";
import { IRenderer } from "../src/renderers/IRenderer";

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
    const [controlPointsDragging, setControlPointsDragging] = useState(-1);
    
    // Layers 
    const layers = useLayersConfig(s => s.layers);

    const [isConfigExpanded, setIsConfigExpanded] = useState(true);
    const [exportConfig, setExportConfig] = useState(defaultExportConfig);

    // Create a render target 
    const targetContext = canvasRef.current?.getContext("2d");

    const renderers = useRenderers();

    /** Normalized controlPoints for each layer */
    // const [layersControlPoints, setLayersControlPoints] = useState<([x: number, y: number][] | undefined)[]>([]);

    const configs = useConfigs();

    // Rerender
    useQuery(
        ["loaded-renderers", renderers, configs, controlPointsDragging],
        async () => {
            const render = (loadedRenderers: IRenderer[]) => {
                if (!targetContext) return [];
                targetContext.clearRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);
                loadedRenderers.forEach((renderer, i) => {
                    const config = {
                        ...configs[i],
                        isDragging: i === controlPointsDragging,
                    }
                    renderer.render(targetContext, config);
                });
                return loadedRenderers;
            }
        
            // Load
            const loaders = renderers.map((r, i) => r.loadAsync?.(configs[i]));
            const isAsync = loaders.some(isPromise);

            if (!isAsync) return render(renderers);
            return Promise.all(loaders).then(() => render(renderers));
        },
    );

    const [layersControlPoints, setControlPoints] = useControlPoints();

    const [isExportExpanded, setIsExportExpanded] = useState(false);

    // Scale and center canvas
    const previewAreaRef = useRef<HTMLDivElement>(null);
    const previewAreaRect = useElementSize(previewAreaRef);
    const margin = 10;

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


    // [-1, 1] range to [0, width/height]
    const controlPointToCanvas = useCallback(
        ([x, y]: ControlPoint): ControlPoint => ([
            (x + 1) / 2 * exportConfig.width,
            (y + 1) / 2 * exportConfig.height,
        ]),
        [exportConfig.height, exportConfig.width],
    );

    // [0, width/height] range to [-1, 1] 
    const canvasToControlPoint = useCallback(
        ([x, y]: ControlPoint): ControlPoint => ([
            x / exportConfig.width * 2 - 1,
            y / exportConfig.height * 2 - 1,
        ]),
        [exportConfig.height, exportConfig.width],
    );

    // Convert controlPoints to screen coordinates
    const controlPointsInScreenCoordinates = useMemo(
        () => (
            layersControlPoints
                .map(layerControlPoints => (
                    layerControlPoints
                        ? layerControlPoints
                            .map(controlPointToCanvas)
                            .map(([x, y]) => ([
                                x * centerPreviewToPreviewArea.scale,
                                y * centerPreviewToPreviewArea.scale,
                            ] as ControlPoint))
                        : undefined
                ))
        ),
        [centerPreviewToPreviewArea.scale, controlPointToCanvas, layersControlPoints],
    );

    const controlPointsDraggingHandles = usePointsSets(
        drawPolygonRef,
        controlPointsInScreenCoordinates,
        (layerIndex, newPointsInScreenCoordinates) => {

            const newPointsInTargetCoordinates = newPointsInScreenCoordinates

                // Screen to Canvas (zooming)
                .map(([x, y]) => [
                    x / centerPreviewToPreviewArea.scale,
                    y / centerPreviewToPreviewArea.scale,
                ] as [x: number, y: number])

                // Canvas to ControlPoint
                .map(canvasToControlPoint);

            setControlPoints(layerIndex, newPointsInTargetCoordinates);
        },
        setControlPointsDragging,
    );

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
                    {...controlPointsDraggingHandles()}
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
    layer: ILayerConfig,
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