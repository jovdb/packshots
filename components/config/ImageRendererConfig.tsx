/* eslint-disable @next/next/no-img-element */
import { ConfigComponent } from "./factory";
import { IImageConfig, ImageConfig } from "./ImageConfig";


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