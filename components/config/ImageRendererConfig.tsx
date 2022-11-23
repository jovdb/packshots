/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { checkBoardStyle } from "../../src/checkboard";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";
import { IImageConfig, ImageConfig } from "./ImageConfig2";


export interface IImageRendererConfig {
    image: IImageConfig;
}

export const ImageRendererConfig: ConfigComponent<IImageRendererConfig> = ({ config, onChange }) => {
    return (
        <fieldset>
            <legend>Image</legend>
            <ImageConfig
                config={config.image}
                onChange={(newConfig) => {
                    onChange({
                        ...config,
                        image: newConfig,
                    });
                }}
            />
        </fieldset>
    );
};