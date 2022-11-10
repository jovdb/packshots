import { CameraConfig, cameraDefaultConfig, ICameraConfig } from "./CameraConfig";
import { ConfigComponent } from "./factory";
import { ISpreadImageConfig, spreadImageDefaultConfig, SpreadImageConfig } from "./SpreadImageConfig";

export interface IPlaneConfig2 {
    image: ISpreadImageConfig;
    projectionMatrix: number[];
}

export const PlaneConfig2: ConfigComponent<IPlaneConfig2> = ({
    config,
    onChange,
}) => {

    const {
        image = spreadImageDefaultConfig,
        projectionMatrix = [0.01, 0, 0, 0, 0.01, 0, 0, 0, 1],
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
            <fieldset>
                <legend>Projection Matrix</legend>
                <input
                    value={projectionMatrix.toString()}
                    onChange={(e) => {
                        const valueString = e.target.value;
                        const projectionMatrix = valueString.split(",").map((i) => parseFloat(i) || 0);
                        onChange({
                            ...config,
                            projectionMatrix,
                        });
                    }}
                />
            </fieldset>
        </>
    );
}
