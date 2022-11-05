import { CameraConfig, cameraDefaultConfig, ICameraConfig } from "./CameraConfig";
import { ConfigComponent } from "./factory";
import { ISpreadImageConfig, spreadImageDefaultConfig, SpreadImageConfig } from "./SpreadImageConfig";

export interface IPlaneConfig {
    plane: {
        width: number;
        height: number;
    };
    image: ISpreadImageConfig;
    camera: ICameraConfig;
}

export const PlaneConfig: ConfigComponent<IPlaneConfig> = ({
    config,
    onChange,
}) => {

    const {
        plane = {
            width: 10,
            height: 10,
        },
        image = spreadImageDefaultConfig,
        camera: cameraConfig = cameraDefaultConfig,
    } = config;

    return (
        <>
            <fieldset>
                <legend>Physical dimensions</legend>
                <table style={{ width: "100%" }}>
                    <tbody>
                        <tr>
                            <td>Width:</td>
                            <td>
                                <input
                                    type="number"
                                    value={plane.width}
                                    min={0}
                                    max={200}
                                    step={0.1}
                                    style={{ width: 60 }}
                                    onChange={(e) => {
                                        const newValue = parseFloat(e.target.value) || 0;
                                        onChange({
                                            ...config,
                                            plane: {
                                                ...plane,
                                                width: newValue,
                                            }
                                        });
                                    }}
                                />
                                &nbsp;cm
                            </td>
                        </tr>
                        <tr>
                            <td>Height:</td>
                            <td>
                                <input
                                    type="number"
                                    value={plane.height}
                                    min={0}
                                    max={200}
                                    step={0.1}
                                    style={{ width: 60 }}
                                    onChange={(e) => {
                                        const newValue = parseFloat(e.target.value) || 0;
                                        onChange({
                                            ...config,
                                            plane: {
                                                ...plane,
                                                height: newValue,
                                            }
                                        });
                                    }}
                                />
                                &nbsp;cm
                            </td>
                        </tr>
                    </tbody>
                </table>
            </fieldset>
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
                <legend>Camera</legend>
                <CameraConfig
                    config={cameraConfig}
                    onChange={(newConfig) => {
                        onChange({
                            ...config,
                            camera: newConfig,
                        });
                    }}
                />
            </fieldset>
        </>
    );
}
