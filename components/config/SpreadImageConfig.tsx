import { useState } from "react";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";

export interface ISpreadImageConfig {
    url: string,
};

export const spreadImageDefaultConfig = {
    url: "",
}

export const SpreadImageConfig: ConfigComponent<ISpreadImageConfig> = ({ config, onChange }) => {
    let type = "local";
    if (config.url === "./checkerboard.jpg") type = "checkerboard" ;
    if (config.url === "./card.jpg") type = "test1" ;

    return (
        <table>
            <tbody>
                <tr>
                    <td colSpan={2}>
                        <select
                            value={type}
                            onChange={(e) => {
                                const value = e.target.value;
                                switch (value) {
                                    case "checkerboard": {
                                        onChange({
                                            ...config,
                                            url: "./checkerboard.jpg",
                                        });
                                        break;
                                    }
                                    case "test1": {
                                        onChange({
                                            ...config,
                                            url: "./card.jpg",
                                        });
                                        break;
                                    }
                                    case "local": {
                                        onChange({
                                            ...config,
                                            url: "",
                                        });
                                        break;
                                    }
                                    default: {
                                        onChange({
                                            ...config,
                                            url: "",
                                        });
                                        break;
                                    }
                                } 
                            }}
                        >
                            <option value="local">Local file</option>
                            <option value="checkerboard">Checker board</option>
                            <option value="test1">Test Image 1</option>
                        </select>
                    </td>
                </tr>
                {type === "local" && (
                    <tr>
                        <td colSpan={2}>
                            <input readOnly disabled value={config.url} style={{ marginRight: 5 }} />
                            <ImageSelection 
                                onSelect={(info) => {
                                    onChange({
                                        ...config,
                                        url: info.url,
                                    });
                                }}
                            />
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};