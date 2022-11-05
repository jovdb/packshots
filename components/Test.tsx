import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageDataAsync, loadImageAsync } from "../utils/image";
import { loadRenders, render } from "../rendering/render";
import { ConfigPanel } from "./ConfigPanel";
import { DrawPolygon, useDrawPolygon } from "./DrawPolygon";
import { useElementSize } from "../hooks/useElementSize";
import { fitRectTransform } from "../utils/rect";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { ActionBar } from "./config/ActionBar";
import { IRenderer } from "../rendering/IRenderer";
import { ImageRenderer } from "../rendering/ImageRenderer";
import { useLayersConfig } from "../state/layers";
import { getConfigComponent } from "./config/factory";

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
    const drawPolygonRef = useRef<typeof DrawPolygon>(null);

    // Layers 
    const layers = useLayersConfig(s => s.layers);
    const deleteLayer = useLayersConfig(s => s.deleteLayer);
    const updateConfig = useLayersConfig(s => s.updateConfig);
    const updateUi = useLayersConfig(s => s.updateUi);

    // Load renderers
    const { data: renderers } = useQuery<IRenderer[]>(["renderers", layers], () => loadRenders(targetContext, layers));

    // Get size from image
    const firstImageRenderer = renderers?.find(r => r instanceof ImageRenderer) as ImageRenderer | undefined;
    const targetWidth = firstImageRenderer?.image?.width || 700;
    const targetHeight = firstImageRenderer?.image?.height || 700;

    // Create a render target 
    const targetContext = canvasRef.current?.getContext("2d");

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

    const [pointsInTargetCoordinates, setPointsInTargetCoordinates] = useState<>([
        [20, 20],
        [50, 20],
        [50, 50],
        [20, 50],
    ]);

    const pointsInScreenCoordinates = pointsInTargetCoordinates.map(point => [point[0] * centerPreviewToPreviewArea.scale, point[1] * centerPreviewToPreviewArea.scale] as [number, number])
    const bind = useDrawPolygon(
        drawPolygonRef,
        pointsInScreenCoordinates,
        (newPointsInScreenCoordinates) => {
            const newPointsInTargetCoordinates = newPointsInScreenCoordinates.map(point => [point[0] / centerPreviewToPreviewArea.scale, point[1] / centerPreviewToPreviewArea.scale] as [number, number])
            setPointsInTargetCoordinates(newPointsInTargetCoordinates)
        });

    // Redraw if render input changes 
    useEffect(
        () => {
            if (!targetContext || !renderers) return;
            render(targetContext, renderers);
        },
        [renderers, targetContext]
    );

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
                <DrawPolygon
                    ref={drawPolygonRef}
                    style={{
                        width: targetWidth * centerPreviewToPreviewArea.scale,
                        height: targetHeight * centerPreviewToPreviewArea.scale,
                        left: centerPreviewToPreviewArea.x,
                        top: centerPreviewToPreviewArea.y,
                    }}
                    points={pointsInScreenCoordinates}
                />
            </div>
            <div>
                <ConfigPanel isOpen={isConfigExpanded} setIsOpen={setIsConfigExpanded}>
                    <ActionBar />
                    {
                        // Like photoshop, top layer is also on top in panel
                        layers.slice().reverse().map((layer, i) => {
                            i = layers.length - 1 - i;
                            const ConfigComponent = getConfigComponent(layer);
                            return (
                                <Accordion
                                    key={i}
                                    title={layer.name}
                                    isExpanded={!!layer.ui?.isExpanded}
                                    setIsExpanded={(value) => {
                                        updateUi(i, { isExpanded: value });
                                    }}
                                    right={<>
                                        <AccordionButton
                                            title="Show/Hide layer"
                                            style={{ opacity: (layer.ui?.isVisible ?? true) ? 1 : 0.5 }}
                                            onClick={() => {
                                                const isVisible = layer.ui?.isVisible ?? true;
                                                updateUi(i, { isVisible: !isVisible });
                                            }}>
                                            👁
                                        </AccordionButton>
                                        <AccordionButton
                                            title="Remove layer"
                                            onClick={() => {
                                                const shouldRemove = confirm("Are you sure you want to remove this layer?");
                                                if (shouldRemove) deleteLayer(i);
                                            }}
                                        >
                                            ✕
                                        </AccordionButton>
                                    </>}
                                >
                                    <AccordionPanel>
                                        {ConfigComponent && <ConfigComponent config={layer.config} onChange={(config) => {
                                            updateConfig(i, config);
                                        }} />}
                                    </AccordionPanel>
                                </Accordion>
                            );
                        })
                    }
                </ConfigPanel>
            </div>
        </div>
    );
}
