import { IControlPointsConfig } from "../../src/controlPoints/IControlPoints";
import { ConfigComponent } from "./factory";
import { ISpreadImageConfig, spreadImageDefaultConfig, SpreadImageConfig } from "./SpreadImageConfig";

export interface IPlaneConfig2 extends IControlPointsConfig {
    image: ISpreadImageConfig;
}

export const PlaneConfig2: ConfigComponent<IPlaneConfig2> = ({
    config,
    onChange,
}) => {
    const {
        image = spreadImageDefaultConfig,
    } = config || {};

return (
    <>
        <fieldset>
            <legend>Spread</legend>
            <SpreadImageConfig
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
