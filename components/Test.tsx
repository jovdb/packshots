import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageDataAsync } from "../utils/image";
import { ImageSelection } from "./FileSelection";
import { ImageData } from "./ImageData";

export function useImageDataFromUrl(url: string) {
    return useQuery(["imageData", url], () => url ? getImageDataAsync(url) : null, {
        refetchOnWindowFocus: false,
    });
}

export function Test() {

    const [imageInfo, setImageInfo] = useState<{ url: string; name: string } | undefined>(undefined);
    const imageName = imageInfo?.name ?? "";
    const imageUrl = imageInfo?.url ?? "";
    const { isFetching, isFetched, isError, data: imageData, ...rest } = useImageDataFromUrl(imageUrl);

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
            Size: {imageData?.width ?? 0}x{imageData?.height ?? 0}

            <ImageData imageData={imageData}/>

        </>
    );
}