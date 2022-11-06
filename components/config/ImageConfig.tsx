import { useState } from "react";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";

export interface IImageConfig {
    imageUrl: string;
}

export const ImageConfig: ConfigComponent<IImageConfig> = ({
    config,
    onChange,
}) => {

    const [type, setType] = useState(() => {
        if (config.imageUrl === "./t-shirt.jpg") return "t-shirt";
        if (config.imageUrl === "./walldeco1.jpg") return "walldeco1";
        if (config.imageUrl === "./walldeco2.png") return "walldeco2";
        if (config.imageUrl === "./housenumber.png") return "plate";
        return "local";
    });

    return (
        <>
            <table style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        <td style={{ minWidth: 60 }}>Type: </td>
                        <td>
                            <select
                                value={type}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setType(value);
                                    switch (value) {
                                        case "walldeco1": {
                                            onChange({ imageUrl: "./walldeco1.jpg" });
                                            break;
                                        }
                                        case "walldeco2": {
                                            onChange({ imageUrl: "./walldeco2.png" });
                                            break;
                                        }
                                        case "plate": {
                                            onChange({ imageUrl: "./housenumber.png" });
                                            break;
                                        }
                                        case "t-shirt": {
                                            onChange({ imageUrl: "./t-shirt.jpg" });
                                            break;
                                        }
                                        case "local": {
                                            onChange({ imageUrl: "" });
                                            break;
                                        }
                                        default: {
                                            console.error("Unknown Background type:", value)
                                            onChange({ imageUrl: "" });
                                            break;
                                        }
                                    }
                                }}
                            >
                                <option value="local">Local file</option>
                                <optgroup label="Background samples">
                                    <option value="t-shirt">T-shirt</option>
                                    <option value="walldeco1">Walldeco 1</option>
                                </optgroup>
                                <optgroup label="Overlay samples">
                                    <option value="plate">Plate</option>
                                    <option value="walldeco2">Walldeco 2</option>
                                </optgroup>
                            </select>
                        </td>
                    </tr>
                    {type === "local" && (
                        <>
                            <tr>
                                <td colSpan={2}>
                                    <input readOnly disabled value={config?.imageUrl || ""} style={{ marginRight: 5 }} />
                                    <ImageSelection
                                        onSelect={(info) => {
                                            onChange({ imageUrl: info.url });
                                        }}
                                    />
                                </td>
                            </tr>
                        </>
                    )}
                </tbody>
            </table>
        </>
    );
}