import { CameraConfig, cameraDefaultConfig, ICameraConfig } from "./CameraConfig";
import { ConfigComponent } from "./factory";
import { ISpreadImageConfig, spreadImageDefaultConfig, SpreadImageConfig } from "./SpreadImageConfig";

export interface IConeConfig {
    cone: {
        topDiameter: number;
        bottomDiameter: number;
        height: number;
    };
    image: ISpreadImageConfig;
    camera: ICameraConfig;
}

export const ConeRenderingConfig: ConfigComponent<IConeConfig> = ({
    config,
    onChange,
}) => {

    const {
        cone = {
            topDiameter: 10,
            bottomDiameter: 10,
            height: 15,
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
                            <td>Top diameter:</td>
                            <td>
                                <input
                                    type="number"
                                    value={cone.topDiameter}
                                    min={0}
                                    max={200}
                                    step={0.1}
                                    style={{ width: 60 }}
                                    onChange={(e) => {
                                        const newValue = parseFloat(e.target.value) || 0;
                                        onChange({
                                            ...config,
                                            cone: {
                                                ...cone,
                                                topDiameter: newValue,
                                            }
                                        });
                                    }}
                                />
                                &nbsp;cm
                            </td>
                        </tr>
                        <tr>
                            <td>Top diameter:</td>
                            <td>
                                <input
                                    type="number"
                                    value={cone.bottomDiameter}
                                    min={0}
                                    max={200}
                                    step={0.1}
                                    style={{ width: 60 }}
                                    onChange={(e) => {
                                        const newValue = parseFloat(e.target.value) || 0;
                                        onChange({
                                            ...config,
                                            cone: {
                                                ...cone,
                                                bottomDiameter: newValue,
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
                                    value={cone.height}
                                    min={0}
                                    max={200}
                                    step={0.1}
                                    style={{ width: 60 }}
                                    onChange={(e) => {
                                        const newValue = parseFloat(e.target.value) || 0;
                                        onChange({
                                            ...config,
                                            cone: {
                                                ...cone,
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
