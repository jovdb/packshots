import { useEffect, useState } from "react";
import create from "zustand";
import { ImageSelection } from "./FileSelection";
import { useImageDataFromUrl } from "./Test";


export const useSpreadImageConfig = create<{
    url: string;
}>(() => ({
    url: "./checkerboard.jpg",
}));

export function useSpreadImageData() {
    const url = useSpreadImageConfig(store => store.url);
    return useImageDataFromUrl(url);
}

export function SpreadImageConfig() {

    const spreadImageConfig = useSpreadImageConfig();
    const [ type, setType] = useState("checkerboard");
    const [ lastFile, setLastFile] = useState<{ url: string; name: string }>({ name: "", url: "" }); 
    const { isFetching, isFetched, isError, data: spreadImageData } = useSpreadImageData();
    const [loadFileError, setLoadFileError] = useState("");

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
                                    case "checkerboard": {
                                        useSpreadImageConfig.setState({ url: "./checkerboard.jpg" });
                                        break;
                                    }
                                    case "test1": {
                                        useSpreadImageConfig.setState({ url: "./card.jpg" });
                                        break;
                                    }
                                    case "local": {
                                        useSpreadImageConfig.setState({ url: lastFile.url });
                                        break;
                                    }
                                    default: {
                                        useSpreadImageConfig.setState({ url: "" });
                                        break;
                                    }
                                } 
                            }}
                        >
                            <option value="local">Local file</option>
                            <option value="checkerboard">Checker board</option>
                            <option value="test1">Test Image 1</option>
                        </select>
                        {isFetching && "⌛"}
                    </td>
                </tr>
                {type === "local" && (
                    <tr>
                        <td colSpan={2}>
                            <input readOnly disabled value={lastFile.name} style={{ marginRight: 5 }} />
                            <ImageSelection 
                                onSelect={(info) => {
                                    setLastFile(info);
                                    useSpreadImageConfig.setState({ url: info.url });
                                }}
                                onSelectError={setLoadFileError}
                            />
                        </td>
                    </tr>
                )}
                <tr>
                    <td colSpan={2}>
                        {isError  && (loadFileError || "Error loading")}
                        {spreadImageConfig.url && isFetched && `Size: ${spreadImageData?.width ?? 0} x ${spreadImageData?.height ?? 0}`}
                    </td>
                </tr>

            </tbody>
        </table>
    );
}