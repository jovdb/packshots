import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createContext2d, getImageDataAsync } from "../utils/image";
import { ImageSelection } from "./FileSelection";
import { ImageData } from "./ImageData";
import { PointTextureSampler } from "../rendering/samplers/PointTextureSampler";
import { ConeGeometry } from "../rendering/geometries/ConeGeometry";
import { PlaneGeometry } from "../rendering/geometries/PlaneGeometry";
import { Matrix3, Matrix4, Vector2, Vector3 } from "three";
import { rayTracerRenderer } from "../rendering/RayTracer";
import { IProjectionData } from "../data/ProjectionData";
import { ConeData } from "../data/shapes/ConeData";
import { useProjectionStore } from "../store/useProjectionStore";
import { Slider } from "./Slider";
import { PlaneConfigurator } from "../data/shapes/plane/PlaneConfigurator";
import create from "zustand";
import { initialConfig, IPlaneConfig } from "../data/shapes/plane/PlaneData";
import { ConfigPanel } from "./ConfigPanel";
import { SpreadImageConfig, useSpreadImageData } from "./SpreadImageConfig";
import { PackshotImagesConfig, usePackshotBackgroundImageData, usePackshotImagesConfig, usePackshotOverlayImageData } from "./PackshotImagesConfig";
import { CameraConfig, useCameraVector, useProjectionVector } from "./ProjectionConfig";

export function useImageDataFromUrl(url: string) {
    return useQuery(["imageData", url], () => url ? getImageDataAsync(url) : null, {
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

function renderPackshot(
    /** Vector to position camera, starting from origin */
    cameraVector: Vector3,

    /** Vector to position projection, relative to camera */
    cameraToProjectionVector: Vector3,

    /** Spread Image */
    sourceImageData: ImageData | undefined,

    /** Packshot Background */
    packshotBackgroundImageData: ImageData | undefined,

    /** Packshot Overlay */
    packshotOverlayImageData: ImageData | undefined,

    /** Result */
    targetImageData: ImageData,
) {
    const sampler = sourceImageData ? new PointTextureSampler(sourceImageData) : undefined;
    const geometry = new PlaneGeometry(10, 10);

    rayTracerRenderer({
        geometry,
        spreadSampler: sampler,
        targetImageData,
        packshotBackgroundImageData,
        packshotOverlayImageData,
        cameraVector,
        cameraToProjectionVector,
    });

    return targetImageData;
}

// TODO: make something shape agnostic
export const useShapeConfig = create<IPlaneConfig>(() => initialConfig);

export function Test() {

    const { data: spreadImageData } = useSpreadImageData();
    const { data: packshotBackgroundImageData } = usePackshotBackgroundImageData();
    const { data: packshotOverlayImageData } = usePackshotOverlayImageData();
    const showPackshotBackground = usePackshotImagesConfig((s) => s.showBackground); 
console.log(!!packshotBackgroundImageData, !!packshotOverlayImageData)

    const targetWidth = packshotBackgroundImageData?.width ?? packshotOverlayImageData?.width ??  700;
    const targetHeight = packshotBackgroundImageData?.height ?? packshotOverlayImageData?.height ?? 700;

    // const shapeConfig = useShapeConfig();

    // Create a render target 
    const targetCtx = useMemo(
        () => {
            return createContext2d(targetWidth, targetHeight);
        },
        [targetHeight, targetWidth],
    );

    const cameraVector = useCameraVector();
    const projectionVector = useProjectionVector()

    // Redraw if render input changes 
    const targetImageData = useMemo(
        () => {
            if (!packshotBackgroundImageData  || !targetCtx) return;
            const targetImageData = targetCtx.getImageData(0, 0, targetWidth, targetHeight);
            renderPackshot(
                cameraVector,
                projectionVector,
                spreadImageData || undefined,
                showPackshotBackground ? packshotBackgroundImageData : undefined,
                packshotOverlayImageData || undefined,
                targetImageData,
            );
            return targetImageData;
        },
        [packshotBackgroundImageData, targetCtx, targetWidth, targetHeight, cameraVector, projectionVector, spreadImageData, showPackshotBackground, packshotOverlayImageData],
    );

    const [isConfigExpanded, setIsConfigExpanded] = useState(true);

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <div style={{ flexGrow: 1, overflowY: "auto", padding: 10, "alignSelf": "center", "textAlign": "center" }}>
                <ImageData imageData={targetImageData} />
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

