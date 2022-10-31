import { useState } from "react";
import create from "zustand";
import { ImageSelection } from "./FileSelection";
import { useImageDataFromUrl, useImageFromUrl } from "./Test";


export const usePackshotImagesConfig = create<{
    backgroundUrl: string;
    showBackground: boolean;
    overlayUrl: string;
    showOverlay: boolean;
}>(() => ({
    backgroundUrl: "./walldeco1.jpg",
    showBackground: true,
    overlayUrl: "",
    showOverlay: true,
}));

export function usePackshotBackgroundImage() {
    const packshotBackgroundUrl = usePackshotImagesConfig(s => s.backgroundUrl);
    return useImageFromUrl(packshotBackgroundUrl);
}

export function usePackshotOverlayImageData() {
    const url = usePackshotImagesConfig(store => store.overlayUrl);
    return useImageDataFromUrl(url);
}

export function usePackshotOverlayImage() {
    const packshotOverlayUrl = usePackshotImagesConfig(s => s.overlayUrl);
    return useImageFromUrl(packshotOverlayUrl);
}

export function PackshotImagesConfig() {

    const packshotImagesConfig = usePackshotImagesConfig();
    const [type, setType] = useState("walldeco1");
    const [lastBackgroundFile, setLastBackgroundFile] = useState<{ url: string; name: string }>({ name: "", url: "" });
    const [lastOverlayFile, setLastOverlayFile] = useState<{ url: string; name: string }>({ name: "", url: "" });
    const { isFetching: isBackgroundFetching, isFetched: isBackgroundFetched, isError: isBackgroundError, data: packshotBackgroundImage } = usePackshotBackgroundImage();
    const { isFetching: isOverlayFetching, isFetched: isOverlayFetched, isError: isOverlayError, data: packshotOverlayImage } = usePackshotOverlayImage();
    const [loadBackgroundError, setLoadBackgroudError] = useState("");
    const [loadOverlayError, setLoadOverlayError] = useState("");

    const packshotWidth = packshotBackgroundImage?.width || packshotOverlayImage?.width || 0; 
    const packshotHeight = packshotBackgroundImage?.height || packshotOverlayImage?.height || 0;
    const hasOverlayBadSize = packshotBackgroundImage && packshotOverlayImage && (
        packshotBackgroundImage.width !== packshotOverlayImage.width || 
        packshotBackgroundImage.height !== packshotOverlayImage.height
    )
    const errorMessage = loadBackgroundError || loadOverlayError || hasOverlayBadSize ? "Overlay should have the same size." : ""

    return (
        <table>
            <tbody>
                <tr>
                    <td colSpan={2}>
                        <select
                            value={type}
                            onChange={(e) => {
                                const value = e.target.value;
                                setType(value);
                                switch (value) {
                                    case "house-number": {
                                        usePackshotImagesConfig.setState({
                                            backgroundUrl: "",
                                            overlayUrl: "./housenumber.png",
                                        });
                                        break;
                                    }
                                    case "walldeco1": {
                                        usePackshotImagesConfig.setState({
                                            backgroundUrl: "./walldeco1.jpg",
                                            overlayUrl: "",
                                        });
                                        break;
                                    }
                                    case "walldeco2": {
                                        usePackshotImagesConfig.setState({
                                            backgroundUrl: "",
                                            overlayUrl: "./walldeco2.png",
                                        });
                                        break;
                                    }
                                    case "t-shirt": {
                                        usePackshotImagesConfig.setState({
                                            backgroundUrl: "./t-shirt.jpg",
                                            overlayUrl: "",
                                        });
                                        break;
                                    }
                                    case "local": {
                                        usePackshotImagesConfig.setState({
                                            backgroundUrl: lastBackgroundFile.url,
                                            overlayUrl: lastOverlayFile.url,
                                        });
                                        break;
                                    }
                                    default: {
                                        console.error("Unknown Packshot type:", value)
                                        usePackshotImagesConfig.setState({ backgroundUrl: "", overlayUrl: "" });
                                        break;
                                    }
                                }
                            }}
                        >
                            <option value="local">Local file</option>
                            <option value="t-shirt">T-shirt</option>
                            <option value="house-number">House number</option>
                            <option value="walldeco1">Wall deco 1</option>
                            <option value="walldeco2">Wall deco 2</option>
                        </select>
                        {(isBackgroundFetching || isOverlayFetching) && "⌛"}
                    </td>
                </tr>
                {type === "local" && (
                    <>
                        <tr>
                            <td colSpan={2}><small>Background:</small></td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <input readOnly disabled value={lastBackgroundFile.name} style={{ marginRight: 5 }} />
                                <ImageSelection
                                    onSelect={(info) => {
                                        setLastBackgroundFile(info);
                                        usePackshotImagesConfig.setState({ backgroundUrl: info.url });
                                    }}
                                    onSelectError={setLoadBackgroudError}
                                />
                            </td>
                        </tr>
                    </>
                )}
                <tr>
                    <td colSpan={2}>
                        <input
                            id="show-packshot-background"
                            type="checkbox"
                            checked={packshotImagesConfig.showBackground}
                            disabled={!packshotImagesConfig.backgroundUrl}
                            onChange={() => {
                                usePackshotImagesConfig.setState({
                                    showBackground: !packshotImagesConfig.showBackground,
                                });
                            }}
                        />
                        <label htmlFor="show-packshot-background">Show Background</label>
                    </td>
                </tr>
                {type === "local" && (
                    <>
                        <tr>
                            <td colSpan={2}><small>Overlay:</small></td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <input readOnly disabled value={lastOverlayFile.name} style={{ marginRight: 5 }} />
                                <ImageSelection
                                    onSelect={(info) => {
                                        setLastOverlayFile(info);
                                        usePackshotImagesConfig.setState({ overlayUrl: info.url });
                                    }}
                                    onSelectError={setLoadOverlayError}
                                />
                            </td>
                        </tr>
                    </>
                )}
                <tr>
                    <td colSpan={2}>
                        <input
                            id="show-packshot-overlay"
                            type="checkbox"
                            checked={packshotImagesConfig.showOverlay}
                            disabled={!packshotImagesConfig.overlayUrl}
                            onChange={() => {
                                usePackshotImagesConfig.setState({
                                    showOverlay: !packshotImagesConfig.showOverlay,
                                });
                            }}
                        />
                        <label htmlFor="show-packshot-overlay">Show Overlay</label>
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        {errorMessage}
                        {packshotWidth && packshotHeight && `Size: ${packshotWidth} x ${packshotHeight}` || ""}
                    </td>
                </tr>

            </tbody>
        </table>
    );
}