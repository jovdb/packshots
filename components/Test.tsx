import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageDataAsync, loadImageAsync } from "../utils/image";
import { PointTextureSampler } from "../rendering/samplers/PointTextureSampler";
import { PlaneGeometry } from "../rendering/geometries/PlaneGeometry";
import { render } from "../rendering/render";
import { ConfigPanel } from "./ConfigPanel";
import { SpreadImageConfig, useSpreadImageData } from "./SpreadImageConfig";
import { PackshotImagesConfig, usePackshotBackgroundImage, usePackshotImagesConfig, usePackshotOverlayImage } from "./PackshotImagesConfig";
import { CameraConfig, useCamera, useProjectionVector } from "./ProjectionConfig";
import { PlaneConfig, usePlaneConfig } from "../data/shapes/plane/PlaneConfig";
import { DrawPolygon, useDrawPolygon } from "./DrawPolygon";
import { useElementSize } from "../hooks/useElementSize";
import { fitRectTransform } from "../utils/rect";

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
    const { data: spreadImageData } = useSpreadImageData();

    const targetWidth = packshotBackgroundImage?.width ?? packshotOverlayImage?.width ?? 700;
    const targetHeight = packshotBackgroundImage?.height ?? packshotOverlayImage?.height ?? 700;

    // Get Geometry
    // TODO: Make geometry agnostic
    const geometryConfig = usePlaneConfig();
    const geometry = useMemo(() => new PlaneGeometry(geometryConfig.width, geometryConfig.height), [geometryConfig]);

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

    const [pointsInTargetCoordinates, setPointsInTargetCoordinates] = useState([
        [20, 20],
        [20, 50],
        [50, 50],
        [50, 20],
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
            if (!targetContext) return;
            const spreadSampler = spreadImageData ? new PointTextureSampler(spreadImageData) : undefined;
            render({
                targetContext,
                packshotBackgroundImage: showPackshotBackground ? packshotBackgroundImage : undefined,
                packshotOverlayImage: showPackshotOverlay ? packshotOverlayImage : undefined,
                geometry,
                spreadSampler,
                camera,
                cameraToProjectionVector: projectionVector,
            });
        },
        [camera, geometry, packshotBackgroundImage, packshotOverlayImage, projectionVector, showPackshotBackground, showPackshotOverlay, spreadImageData, targetContext, targetHeight, targetWidth]
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
                    <fieldset>
                        <legend>Packshot</legend>
                        <PackshotImagesConfig />
                    </fieldset>
                    <fieldset>
                        <legend>Spread</legend>
                        <SpreadImageConfig />
                    </fieldset>
                    <fieldset>
                        <legend>Shape</legend>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Shape:</td>
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
                </ConfigPanel>
            </div>
        </div>
    );
}

