import { IControlPointsConfig } from "../../src/controlPoints/IControlPoints";
import { ConfigComponent } from "./factory";
import { IImageConfig, ImageConfig, imageDefaultConfig } from "./ImageConfig";

export interface IPlaneRendererConfig extends IControlPointsConfig {
    image: IImageConfig;
}

export const PlaneRendererConfig: ConfigComponent<IPlaneRendererConfig> = ({
    config,
    onChange,
}) => {
    const {
        image = imageDefaultConfig,
    } = config || {};

return (
    <>
        <fieldset>
            <legend>Spread</legend>
            <ImageConfig
                config={image}
                onChange={(newConfig) => {
                    onChange({
                        ...config,
                        image: newConfig,
                    });
                }}
            />
        </fieldset>
    </>
);
}
