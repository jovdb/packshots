import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageDataAsync, loadImageAsync } from "../utils/image";
import { PointTextureSampler } from "../rendering/samplers/PointTextureSampler";
import { PlaneGeometry } from "../rendering/geometries/PlaneGeometry";
import { loadRenders, render } from "../rendering/render";
import { ConfigPanel } from "./ConfigPanel";
import { SpreadImageConfig, useSpreadImage, useSpreadImageData } from "./config/SpreadImageConfig";
import { PackshotImagesConfig, usePackshotBackgroundImage, usePackshotImagesConfig, usePackshotOverlayImage } from "./config/PackshotImagesConfig";
import { CameraConfig, useCamera, useProjectionVector } from "./config/CameraConfig";
import { PlaneConfig, usePlaneConfig } from "../data/shapes/plane/PlaneConfig";
import { DrawPolygon, useDrawPolygon } from "./DrawPolygon";
import { useElementSize } from "../hooks/useElementSize";
import { fitRectTransform } from "../utils/rect";
import { createRenderer } from "../rendering/factory";
import { ConeRenderer } from "../rendering/ConeRenderer";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { BackgroundConfig } from "./config/BackgroundConfig";
import { ActionBar } from "./config/ActionBar";
import { IRenderer } from "../rendering/IRenderer";
import { ImageRenderer } from "../rendering/ImageRenderer";
import { PlaneRenderer } from "../rendering/PlaneRenderer";
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

    const showPackshotBackground = usePackshotImagesConfig((s) => s.showBackground);
    const showPackshotOverlay = usePackshotImagesConfig((s) => s.showOverlay);

    const { data: packshotBackgroundImage } = usePackshotBackgroundImage();
    const { data: packshotOverlayImage } = usePackshotOverlayImage();
    const { data: spreadImage } = useSpreadImage();
    const { data: spreadImageData } = useSpreadImageData();

    const targetWidth = packshotBackgroundImage?.width ?? packshotOverlayImage?.width ?? 700;
    const targetHeight = packshotBackgroundImage?.height ?? packshotOverlayImage?.height ?? 700;

    // Get Geometry
    // TODO: Make geometry agnostic
    const planeGeometryConfig = usePlaneConfig();
    const geometry = useMemo(() => new PlaneGeometry(planeGeometryConfig.width, planeGeometryConfig.height), [planeGeometryConfig]);

    // Create a render target 
    const targetContext = canvasRef.current?.getContext("2d");
    const projectionVector = useProjectionVector()
    const camera = useCamera();

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

    const layers = useLayersConfig(s => s.layers);
    const deleteLayer = useLayersConfig(s => s.deleteLayer);
    const updateConfig = useLayersConfig(s => s.updateConfig);

    const { data: renderers } = useQuery<IRenderer[]>(["renderers", layers], () => loadRenders(targetContext, layers));

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
                        // checkboard
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
                            const ConfigComponent = getConfigComponent(layer);
                            return (
                                <Accordion key={i} title={layer.name} right={
                                    <AccordionButton onClick={() => deleteLayer(i)} title="Remove overlay">✕</AccordionButton>
                                }>
                                    <AccordionPanel>
                                        {ConfigComponent && <ConfigComponent config={layer.config} onChange={(config) => {
                                            updateConfig(i, config);
                                        }} />}
                                    </AccordionPanel>
                                </Accordion>
                            );
                        })
                    }
                    <hr />
                    <Accordion title={"Overlay"} right={
                        <AccordionButton onClick={() => alert('delete')} title="Remove overlay">✕</AccordionButton>
                    }>
                        <AccordionPanel>
                            TODO
                        </AccordionPanel>
                    </Accordion>
                    <Accordion title={"Spread on Plane"} right={
                        <AccordionButton onClick={() => alert('delete')} title="Remove spread">✕</AccordionButton>
                    }>
                        <AccordionPanel>
                            <PlaneConfig />
                        </AccordionPanel>
                    </Accordion>
                    {usePackshotImagesConfig.getState().backgroundUrl &&
                        <Accordion title={"Background"} right={
                            <>
                                <AccordionButton
                                    onClick={() => { usePackshotImagesConfig.setState((prev) => ({ showBackground: !prev.showBackground })) }}
                                    style={{ opacity: usePackshotImagesConfig.getState().showBackground ? 1 : 0.5 }}
                                >👁</AccordionButton>
                                <AccordionButton
                                    onClick={() => { usePackshotImagesConfig.setState({ backgroundUrl: "" }) }}
                                    title="Remove background"
                                >✕</AccordionButton>
                            </>
                        }>
                            <AccordionPanel>
                                <BackgroundConfig />
                            </AccordionPanel>
                        </Accordion>
                    }
                    <hr />
                    <div style={{ padding: 5 }}>
                        <fieldset>
                            <legend>Packshot</legend>
                            <PackshotImagesConfig />
                        </fieldset>
                        <fieldset>
                            <legend>Spread</legend>
                            <SpreadImageConfig />
                        </fieldset>
                        <fieldset>
                            <legend>Geometry</legend>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Geometry:</td>
                                        <td>
                                            <select>
                                                <option value="plane">Plane</option>
                                                <option value="cone">Cylinder / Cone</option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <PlaneConfig />
                        </fieldset>
                        <fieldset>
                            <legend>Camera</legend>
                            <CameraConfig />
                        </fieldset>
                    </div>
                </ConfigPanel>
            </div>
        </div>
    );
}
