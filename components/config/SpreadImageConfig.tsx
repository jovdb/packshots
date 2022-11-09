/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";

export interface ISpreadImageConfig {
    name: string;
    imageUrl: string;
};

export const spreadImageDefaultConfig = {
    name: "",
    imageUrl: "",
}

export const SpreadImageConfig: ConfigComponent<ISpreadImageConfig> = ({ config, onChange }) => {

    const [type, setType] = useState((config?.imageUrl ?? "").startsWith("blob://") ? "local" : "url");

    return (
        <table style={{ width: "100%" }}>
            <tbody>
                <tr>
                    <td style={{ minWidth: 60 }}>
                        Type:
                    </td>
                    <td>
                        <select
                            value={type}
                            onChange={(e) => {
                                const value = e.target.value;
                                switch (value) {
                                    case "local": {
                                        setType("local");
                                        onChange({
                                            ...config,
                                            name: "",
                                            imageUrl: "",
                                        });
                                        break;
                                    }
                                    case "product": {
                                        setType("product");
                                        onChange({
                                            ...config,
                                            name: "",
                                            imageUrl: "",
                                        });
                                        break;
                                    }
                                    default: {
                                        setType("url");
                                        onChange({
                                            ...config,
                                            name: "",
                                            imageUrl: "",
                                        });
                                        break;
                                    }
                                }
                            }}
                        >
                            <option value="local">Local file</option>
                            <option value="url">URL</option>
                            <option value="product">From product</option>
                        </select>
                    </td>
                </tr>
                {type === "local" && (
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
                {type === "product" && (
                    <>
                        <tr>
                            <td colSpan={2}>TODO</td>
                        </tr>
                        <tr>
                            <td>Product code:</td>
                            <td><input /></td>
                        </tr>
                        <tr>
                            <td>Predefined Product Name:</td>
                            <td><input /></td>
                        </tr>
                        <tr>
                            <td>Spread Number:</td>
                            <td><input type="number" min={1} /></td>
                        </tr>
                    </>
                )}

                <tr>
                    <td colSpan={2} style={{ textAlign: "center" }}>
                        {config?.imageUrl && <img alt="preview" src={config.imageUrl} style={{ width: "100%", height: "auto", maxWidth: 200, maxHeight: 200 }} />}
                    </td>
                </tr>

            </tbody>
        </table>
    );
};