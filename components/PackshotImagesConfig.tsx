import { useEffect, useState } from "react";
import create from "zustand";
import { ImageSelection } from "./FileSelection";
import { useImageDataFromUrl } from "./Test";


export const usePackshotImagesConfig = create<{
    backgroundUrl: string;
    showBackground: boolean;
    overlayUrl: string;
}>(() => ({
    backgroundUrl: "./walldeco1.jpg",
    showBackground: true,
    overlayUrl: "",
}));

export function usePackshotBackgroundImageData() {
    const url = usePackshotImagesConfig(store => store.backgroundUrl);
    return useImageDataFromUrl(url);
}

export function usePackshotOverlayImageData() {
    const url = usePackshotImagesConfig(store => store.overlayUrl);
    return useImageDataFromUrl(url);
}

export function PackshotImagesConfig() {

    const packshotImagesConfig = usePackshotImagesConfig();
    const [type, setType] = useState("walldeco1");
    const [lastBackgroundFile, setLastBackgroundFile] = useState<{ url: string; name: string }>({ name: "", url: "" });
    const [lastOverlayFile, setLastOverlayFile] = useState<{ url: string; name: string }>({ name: "", url: "" });
    const { isFetching: isBackgroundFetching, isFetched: isBackgroundFetched, isBackgroundError, data: backgroundImageData } = usePackshotBackgroundImageData();
    const { isFetching, isOverlayFetching, isFetched: isOverlayFetched, isOverlayError, data: overlayImageData } = usePackshotOverlayImageData();
    const [loadBackgroundError, setLoadBackgroudError] = useState("");
    const [loadOverlayError, setLoadOverlayError] = useState("");

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
                                        usePackshotImagesConfig.setState({ backgroundUrl: "", overlayUrl: "./housenumber.png" });
                                        break;
                                    }
                                    case "walledeco1": {
                                        usePackshotImagesConfig.setState({ backgroundUrl: "./walldeco1.jpg", overlayUrl: "" });
                                        break;
                                    }
                                    case "walledeco2": {
                                        usePackshotImagesConfig.setState({ backgroundUrl: "", overlayUrl: "./walldeco2.png" });
                                        break;
                                    }
                                    case "local": {
                                        usePackshotImagesConfig.setState({ backgroundUrl: lastBackgroundFile.url, overlayUrl: lastOverlayFile.url });
                                        break;
                                    }
                                    default: {
                                        usePackshotImagesConfig.setState({ backgroundUrl: "", overlayUrl: "" });
                                        break;
                                    }
                                }
                            }}
                        >
                            <option value="local">Local file</option>
                            <option value="house-number">House number</option>
                            <option value="walldeco1">Wall deco 1</option>
                            <option value="walldeco2">Wall deco 2</option>
                        </select>
                        {isFetching && "⌛"}
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
                        {isBackgroundError || isOverlayError && (loadBackgroundError || loadOverlayError || "Error loading")}
                        {packshotImagesConfig.backgroundUrl && isBackgroundFetched && `Size: ${backgroundImageData?.width ?? 0} x ${backgroundImageData?.height ?? 0}`}
                    </td>
                </tr>

            </tbody>
        </table>
    );
}