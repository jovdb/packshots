import { useState } from "react";
import { ImageSelection } from "./FileSelection";
import { usePackshotBackgroundImage, usePackshotImagesConfig } from "./PackshotImagesConfig";

export function BackgroundConfig() {

    const packshotImagesConfig = usePackshotImagesConfig();
    const [type, setType] = useState("walldeco1");
    const [lastBackgroundFile, setLastBackgroundFile] = useState<{ url: string; name: string }>({ name: "", url: "" });
    const { isFetching: isBackgroundFetching, isFetched: isBackgroundFetched, isError: isBackgroundError, data: backgroundImage } = usePackshotBackgroundImage();
    const [loadBackgroundError, setLoadBackgroudError] = useState("");

    const packshotWidth = backgroundImage?.width || 0; 
    const packshotHeight = backgroundImage?.height || 0;
    const errorMessage = loadBackgroundError;

    return (
        <table style={{ width: "100%" }}>
            <tbody>
                <tr>
                <td style={{minWidth: 60}}>Type: </td>
                    <td>
                        <select
                            value={type}
                            onChange={(e) => {
                                const value = e.target.value;
                                setType(value);
                                switch (value) { 
                                    case "walldeco1": {
                                        usePackshotImagesConfig.setState({
                                            backgroundUrl: "./walldeco1.jpg",
                                            overlayUrl: "",
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
                                        });
                                        break;
                                    }
                                    default: {
                                        console.error("Unknown Background type:", value)
                                        usePackshotImagesConfig.setState({ backgroundUrl: "" });
                                        break;
                                    }
                                }
                            }}
                        >
                            <option value="local">Local file</option>
                            <option value="t-shirt">T-shirt</option>
                            <option value="walldeco1">Wall deco 1</option>
                        </select>
                        {isBackgroundFetching && "⌛"}
                    </td>
                </tr>
                {type === "local" && (
                    <>
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
                        {errorMessage}
                        {packshotWidth && packshotHeight && `Size: ${packshotWidth} x ${packshotHeight}` || ""}
                    </td>
                </tr>

            </tbody>
        </table>
    );
}