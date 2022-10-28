import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createContext2d, getImageDataAsync } from "../utils/image";
import { ImageSelection } from "./FileSelection";
import { ImageData } from "./ImageData";
import { PointTextureSampler } from "../rendering/samplers/PointTextureSampler";
import { ConeGeometry } from "../rendering/geometries/ConeGeometry";
import { Matrix3, Matrix4, Vector3 } from "three";
import { rayTracerRenderer } from "../rendering/RayTracer";
import { IProjectionData } from "../data/ProjectionData";
import { ConeData } from "../data/shapes/ConeData";
import { TestGeometry } from "../rendering/geometries/TestGeometry";

export function useImageDataFromUrl(url: string) {
    return useQuery(["imageData", url], () => url ? getImageDataAsync(url) : null, {
        refetchOnWindowFocus: false,
    });
}

function renderSpread(
    projectionData: IProjectionData,
    sourceImageData: ImageData,
    targetImageData: ImageData,
) {
    /*
     
     The cylinder is at the origin of the world. We look at it as follows:
     
              ^ +z
              |
              |
     +x <-----o 
             /
            /
           +y
           
Z is the height above the table on which products are photographed,
      
     */
    const sampler = new PointTextureSampler(sourceImageData);
    /*
    const geometry = new ConeGeometry({
        topDiameter: projectionData.shape.diameterTop,
        bottomDiameter: projectionData.shape.diameterBottom,
        height: projectionData.shape.height,
    });
    */
    const geometry = new TestGeometry();

    const eyePosition = new Vector3(0, 0, 0);
    const rayMatrix = new Matrix3();
    const rayMatrixValues = rayMatrix.toArray();

    var canvasToRay = new Matrix4().fromArray([ // Matrix3 to Matrix4
        rayMatrixValues[0], rayMatrixValues[1], rayMatrixValues[2], 0,
        rayMatrixValues[3], rayMatrixValues[4], rayMatrixValues[5], 0,
        rayMatrixValues[6], rayMatrixValues[7], rayMatrixValues[8], 0,
        0, 0, 0, 1
    ]);

    // We want to zoom around the center of the image
    const icx = 0.5 * sourceImageData.width;
    const icy = 0.5 * sourceImageData.height;
    const itx = sourceImageData.width * projectionData.image.shift.x / 100;
    const ity = sourceImageData.height * projectionData.image.shift.y / 100;
    const izf = Math.pow(2, projectionData.image.zoom / 100);
    const shapeHeight = projectionData.shape.height;

    const uvTransform = new Matrix3()
        .scale(sourceImageData.height / shapeHeight, sourceImageData.height / shapeHeight)
        .translate(-icx, -icy)
        .scale(izf, izf)
        .translate(icx, icy)
        .translate(itx, ity);

    rayTracerRenderer({
        geometry, sampler, imageData: targetImageData, eyePosition, canvasToRay, uvTransform
    });

    return targetImageData;
}

export function Test() {

    const [imageInfo, setImageInfo] = useState<{ url: string; name: string } | undefined>(undefined);
    const { name: imageName = "", url: imageUrl = ""} = imageInfo || {};

    const { isFetching, isFetched, isError, data: spreadImageData } = useImageDataFromUrl(imageUrl);

    // Currently used a fixed store
    const projectionData = useMemo<IProjectionData>(() => ({
        shape: new ConeData({
            diameterTop: 10,
            height: 20,
        }),
        image: {
            shift: [0, 0],
            zoom: 1
        },
        isProductMaskEnabled: false,
    }), []);

    // Create a render target 
    const targetCtx = useMemo(
        () => {
            if (!spreadImageData) return undefined;
            return createContext2d(spreadImageData.width, spreadImageData.height);
        },
        [spreadImageData],
    );

    // Redraw if render input changes 
    const targetImageData = useMemo(
        () => {
            if (!spreadImageData || !targetCtx) return;
            const targetImageData = targetCtx.getImageData(0, 0, spreadImageData.width, spreadImageData.height);
            renderSpread(projectionData, spreadImageData, targetImageData);
            return targetImageData;
        },
        [projectionData, spreadImageData, targetCtx],
    );

    return (
        <>
            <div>
                <input readOnly disabled value={imageName} style={{ marginRight: 5 }} />
                <ImageSelection onSelect={setImageInfo} />
                <span style={{ display: "inline-block", width: 10, marginLeft: 5 }}>
                    {isFetching && "⌛"}
                    {imageUrl && isFetched && "✔"}
                    {isError && "❗"}
                </span>
            </div>
            Size: {spreadImageData?.width ?? 0}x{spreadImageData?.height ?? 0}

            <ImageData imageData={spreadImageData} />
        </>
    );
}