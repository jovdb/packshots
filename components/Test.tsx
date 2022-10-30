import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageDataAsync, loadImageAsync } from "../utils/image";
import { PointTextureSampler } from "../rendering/samplers/PointTextureSampler";
import { PlaneGeometry } from "../rendering/geometries/PlaneGeometry";
import { render } from "../rendering/RayTracer";
import create from "zustand";
import { initialConfig, IPlaneConfig } from "../data/shapes/plane/PlaneData";
import { ConfigPanel } from "./ConfigPanel";
import { SpreadImageConfig, useSpreadImageData } from "./SpreadImageConfig";
import { PackshotImagesConfig, usePackshotBackgroundImage, usePackshotImagesConfig, usePackshotOverlayImage } from "./PackshotImagesConfig";
import { CameraConfig, useCameraVector, useProjectionVector } from "./ProjectionConfig";

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

// function renderPackshot(
//     projectionData: IProjectionData,

//     /** Spread Image */
//     sourceImageData: ImageData,

//     /** Packshot */
//     targetImageData: ImageData,
// ) {
//     /*

//      The cylinder is at the origin of the world. We look at it as follows:

//               ^ +z
//               |
//               |
//      +x <-----o 
//              /
//             /
//            +y

// Z is the height above the table on which products are photographed,

//      */
//     const sampler = new PointTextureSampler(sourceImageData);
//     /*
//     const geometry = new ConeGeometry({
//         topDiameter: projectionData.shape.diameterTop,
//         bottomDiameter: projectionData.shape.diameterBottom,
//         height: projectionData.shape.height,
//     });
//     */
//     const geometry = new PlaneGeometry(10, 10);

//     const eyePosition = new Vector3(0, 0, 0);

//     const rayMatrix = new Matrix3();
//     const rayMatrixValues = rayMatrix.toArray();
// /*
//     var canvasToRay = new Matrix4().fromArray([ // Matrix3 to Matrix4
//         rayMatrixValues[0], rayMatrixValues[1], rayMatrixValues[2], 0,
//         rayMatrixValues[3], rayMatrixValues[4], rayMatrixValues[5], 0,
//         rayMatrixValues[6], rayMatrixValues[7], rayMatrixValues[8], 0,
//         0, 0, 0, 1
//     ]);
// */
//     const canvasToRay = new Matrix4();

//     // We want to zoom around the center of the image
//     /*
//     const sourceImageCenterX = sourceImageData.width * 0.5;
//     const sourceImageCenterY = sourceImageData.height * 0.5;
//     const sourceimageTranslateX = sourceImageData.width * projectionData.image.shift[0] / 100;
//     const sourceImageTranslateY = sourceImageData.height * projectionData.image.shift[1] / 100;
//     const sourceImageZoomFactor = Math.pow(2, projectionData.image.zoom / 100);
//     const shapeHeight = projectionData.shape.height;

//     const uvTransform = new Matrix3()
//         .scale(sourceImageData.height / shapeHeight, sourceImageData.height / shapeHeight)
//         .translate(-sourceImageCenterX, -sourceImageCenterY)
//         .scale(sourceImageZoomFactor, sourceImageZoomFactor)
//         .translate(sourceImageCenterX, sourceImageCenterY)
//         .translate(sourceimageTranslateX, sourceImageTranslateY);
// */
//     const uvTransform = new Matrix3();

//     rayTracerRenderer({
//         geometry, spreadSampler: sampler, imageData: targetImageData, cameraPosition: eyePosition, canvasToRay, uvTransform
//     });

//     return targetImageData;
// }

// function renderPackshot(options: {
//     /** Vector to position camera, starting from origin */
//     cameraVector: Vector3,

//     /** Vector to position projection, relative to camera */
//     cameraToProjectionVector: Vector3,

//     /** Spread Image */
//     sourceImageData: ImageData | undefined,

//     /** Packshot Background */
//     packshotBackgroundImage: HTMLImageElement | undefined,

//     /** Packshot Overlay */
//     packshotOverlayImageData: ImageData | undefined,

//     /** Result */
//     targetImageData: ImageData,
// }) {
//     const { sourceImageData } = options;
//     const sampler = sourceImageData ? new PointTextureSampler(sourceImageData) : undefined;
//     const geometry = new PlaneGeometry(10, 10);

//     render({
//         ...options,
//         geometry,
//         spreadSampler: sampler,
        
//     });

//     return targetImageData;
// }

// TODO: make something shape agnostic
export const useShapeConfig = create<IPlaneConfig>(() => initialConfig);

export function Test() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const showPackshotBackground = usePackshotImagesConfig((s) => s.showBackground); 
    const showPackshotOverlay = usePackshotImagesConfig((s) => s.showOverlay); 

    const { data: packshotBackgroundImage } = usePackshotBackgroundImage();
    const { data: packshotOverlayImage } = usePackshotOverlayImage();
    const { data: spreadImageData } = useSpreadImageData();

    const targetWidth = packshotBackgroundImage?.width ?? packshotOverlayImage?.width ??  700;
    const targetHeight = packshotBackgroundImage?.height ?? packshotOverlayImage?.height ?? 700;

    // Create a render target 
    const targetContext = canvasRef.current?.getContext("2d");
            
    const cameraVector = useCameraVector();
    const projectionVector = useProjectionVector()

    // Redraw if render input changes 
    useEffect(
        () => {
            if (!targetContext) return;
            const spreadSampler = spreadImageData ? new PointTextureSampler(spreadImageData) : undefined;
            const geometry = new PlaneGeometry(10, 10);

            render({
                targetContext,
                packshotBackgroundImage: showPackshotBackground ? packshotBackgroundImage : undefined,
                packshotOverlayImage : showPackshotOverlay ? packshotOverlayImage : undefined,
                geometry,
                spreadSampler,
                cameraVector,
                cameraToProjectionVector: projectionVector,
            });
        },
        [cameraVector, packshotBackgroundImage, packshotOverlayImage, projectionVector, showPackshotBackground, showPackshotOverlay, spreadImageData, targetContext, targetHeight, targetWidth]
    );

    const [isConfigExpanded, setIsConfigExpanded] = useState(true);
    const checkBoardSize = 25;
    const checkBoardDark = "#e8e8e8";
    const checkBoardLight = "#f8f8f8";
    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <div style={{ flexGrow: 1, overflowY: "auto", padding: 10, "alignSelf": "center", "textAlign": "center" }}>
                {/*<ImageData imageData={targetImageData} /> */}
                <canvas
                    ref={canvasRef}
                    width={targetWidth}
                    height={targetHeight}
                    style={{
                        width: "100%",
                        height: "auto",
                        border: "1px solid #ddd",
                        boxShadow: "2px 2px 3px rgba(0,0,0,0.1)",
                        // scale to available size
                        maxHeight: "calc(100vh - 24px)",
                        maxWidth: "calc(100vh - 24px)",
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
                    {/*<fieldset>
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
                        <PlaneConfigurator
                            config={shapeConfig}
                            onChange={(newConfig) => useShapeConfig.setState(newConfig)}
                        />
                    </fieldset>
                    */}
                    <fieldset>
                        <legend>Camera</legend>
                        <CameraConfig />
                    </fieldset>
                </ConfigPanel>
            </div>
        </div>
    );
}

