/* eslint-disable @next/next/no-img-element */
import { useId, useState } from "react";
import { checkBoardStyle } from "../../src/checkboard";
import { ImageSelection } from "../FileSelection";
import { IRendererConfig } from "../../src/IPackshot";
import { ConfigComponent } from "./factory";
import { IImageConfig } from "./ImageConfig";

export interface IMaskRenderingConfig extends IRendererConfig {
    image: IImageConfig;
    isDisabled?: boolean;
};

export const MaskRendererConfig: ConfigComponent<IMaskRenderingConfig> = ({
    config,
    onChange,
}) => {

    const [type, setType] = useState(() => {
        if (config.image.url?.startsWith("blob://")) return "local";
        return "url";
    });

    const isEnabled = !config.isDisabled;
    const id = useId();
    return (
        <fieldset>
            <legend style={{ userSelect: "none" }}>
                <input
                    type="checkbox"
                    id={`mask_${id}`}
                    checked={isEnabled}
                    style={{ transform: "translate(0, 2px)" }}
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        const newConfig: IMaskRenderingConfig = {
                            ...config,
                            isDisabled: !isChecked,
                        };
                        onChange(newConfig);
                    }}
                />
                <label htmlFor={`mask_${id}`} style={{ cursor: "pointer" }}>Mask</label>
            </legend>
            {isEnabled &&
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
                                                onChange({ image: { url: "", name: "" } });
                                                break;
                                            }
                                            default: {
                                                console.error("Unknown Background type:", value)
                                                onChange({ image: { url: "", name: "" } });
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
                                                value={config?.image?.name || config?.image?.url || ""}
                                                style={{ width: "100%", marginRight: 5 }}
                                                readOnly
                                                disabled
                                            />
                                            <ImageSelection
                                                onSelect={(info) => {
                                                    onChange({ image: { url: info.url, name: info.name } });
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
                                            value={config?.image?.url || ""}
                                            style={{ width: "100%" }}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const lastSlashIndex = value.lastIndexOf("/");
                                                const name = lastSlashIndex < 0 ? value : value.substring(lastSlashIndex + 1);
                                                onChange({ image: { url: value, name } });
                                            }}
                                        />
                                    </td>
                                </tr>
                            </>
                        )}
                        <tr>
                            <td colSpan={2} style={{ textAlign: "center" }}>
                                {config?.image?.url && <img alt="preview" src={config.image.url} style={{ width: "100%", height: "auto", maxWidth: 200, maxHeight: 200, border: "1px solid #aaa", ...checkBoardStyle }} />}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                The mask image will be stretched over the entire output image.
                            </td>
                        </tr>
                    </tbody>
                </table>
            }
        </fieldset>
    );
}