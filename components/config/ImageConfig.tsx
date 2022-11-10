/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";

export interface IImageConfig {
    name: string;
    imageUrl: string;
}

export const ImageConfig: ConfigComponent<IImageConfig> = ({
    config,
    onChange,
}) => {

    const [type, setType] = useState(() => {
        if (config.imageUrl?.startsWith("blob://")) return "local";
        return "url";
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
                                        case "local": {
                                            onChange({ imageUrl: "", name: "" });
                                            break;
                                        }
                                        default: {
                                            console.error("Unknown Background type:", value)
                                            onChange({ imageUrl: "", name: "" });
                                            break;
                                        }
                                    }
                                }}
                            >
                                <option value="local">Local file</option>
                                <option value="url">URL</option>
                            </select>
                        </td>
                    </tr>
                    {type === "local" && (
                        <>
                            <tr>
                                <td colSpan={2}>
                                    File name:
                                    <div style={{ display: "flex" }}>
                                        <input
                                            value={config?.name || config?.imageUrl || ""}
                                            style={{ width: "100%", marginRight: 5 }}
                                            readOnly
                                            disabled
                                        />
                                        <ImageSelection
                                            onSelect={(info) => {
                                                onChange({
                                                    name: info.name,
                                                    imageUrl: info.url,
                                                });
                                            }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        </>
                    )}
                    {type === "url" && (
                        <>
                            <tr>
                                <td colSpan={2}>
                                    Location:
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2}>
                                    <input
                                        value={config?.imageUrl || ""}
                                        style={{ width: "100%" }}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const lastSlashIndex = value.lastIndexOf("/");
                                            const name = lastSlashIndex < 0 ? value : value.substring(lastSlashIndex + 1);
                                            onChange({
                                                name,
                                                imageUrl: value
                                            });
                                        }}
                                    />
                                </td>
                            </tr>
                        </>
                    )}
                    <tr>
                        <td colSpan={2} style={{ textAlign: "center" }}>
                            {config?.imageUrl && <img alt="preview" src={config.imageUrl} style={{ width: "100%", height: "auto", maxWidth: 200, maxHeight: 200, border: "1px solid #aaa" }} />}
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}