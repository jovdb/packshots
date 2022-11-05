import { useMemo } from "react";
import { Vector2, Vector3 } from "three";
import create from "zustand";
import { Slider } from "../Slider";
import { ConfigComponent } from "./factory";
/*
 camera    viewport           geometry
  eye        |\
             | \
             |  \                /\
  <o------------ |------------- /__\
             |   |               ||
              \  |
               \ |
                \|
*/

export const cameraDefaultConfig: ICameraConfig = {
    position: [0, 0, 50],
    direction: [0, 0, 0],
    fieldOfViewInDeg: 20,
}

export interface ICameraConfig {
    /** Position of the camera in world units, origin is at geometry (cm)*/
    position: [x: number, y: number, z: number];
    /** A direction vector for the camera */
    direction: [x: number, y: number, z: number];
    // Camera angle/tilt needed?
    fieldOfViewInDeg: number;
};

export const useCameraConfig = create<ICameraConfig>(() => cameraDefaultConfig);

export const CameraConfig: ConfigComponent<ICameraConfig> = ({config, onChange }) => {
    return (
        <table>
            <tbody>
                <tr>
                    <td>Position X:</td>
                    <td>
                        <Slider
                            value={config.position[0]}
                            defaultValue={0}
                            min={-100}
                            max={100}
                            step={0.1}
                            onChange={(value) => {
                                onChange({
                                    ...config,
                                    position: [value, config.position[1], config.position[2]],
                                });
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Position Y:</td>
                    <td>
                        <Slider
                            value={config.position[1]}
                            defaultValue={0}
                            min={-100}
                            max={100}
                            step={0.1}
                            onChange={(value) => {
                                onChange({
                                    ...config,
                                    position: [config.position[0], value, config.position[2]],
                                });
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Position Z:</td>
                    <td>
                        <Slider
                            value={config.position[2]}
                            defaultValue={50}
                            min={1}
                            max={100}
                            step={0.1}
                            onChange={(value) => {
                                onChange({
                                    ...config,
                                    position: [config.position[0], config.position[1], value],
                                });
                            }}
                        />
                    </td>
                </tr>
                <tr><td colSpan={2}><hr /></td></tr>
                <tr>
                    <td>Direction X:</td>
                    <td>
                        <Slider
                            value={config.direction[0]}
                            defaultValue={0}
                            min={-100}
                            max={100}
                            step={0.1}
                            onChange={(value) => {
                                onChange({
                                    ...config,
                                    direction: [value, config.direction[1], config.direction[2]],
                                });
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Direction Y:</td>
                    <td>
                        <Slider
                            value={config.direction[1]}
                            defaultValue={0}
                            min={-100}
                            max={100}
                            step={0.1}
                            onChange={(value) => {
                                onChange({
                                    ...config,
                                    direction: [config.direction[0], value, config.direction[2]],
                                });
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Direction Z:</td>
                    <td>
                        <Slider
                            value={config.direction[2]}
                            defaultValue={0}
                            min={-1000}
                            max={1}
                            step={0.1}
                            onChange={(value) => {
                                onChange({
                                    ...config,
                                    direction: [config.direction[0], config.direction[1], value],
                                });
                            }}
                        />
                    </td>
                </tr>
                <tr><td colSpan={2}><hr /></td></tr>
                {/*
                <tr>
                    <td>Viewport width:</td>
                    <td>
                        <Slider
                            value={projectionConfig.viewportSize[0]}
                            defaultValue={15}
                            min={0}
                            max={100}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    viewportSize: [value, state.viewportSize[1]],
                                }));
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Viewport height:</td>
                    <td>
                        <Slider
                            value={projectionConfig.viewportSize[1]}
                            defaultValue={10}
                            min={0}
                            max={100}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    viewportSize: [state.viewportSize[0], value],
                                }));
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Viewport distance:</td>
                    <td>
                        <Slider
                            value={projectionConfig.viewportDistance}
                            defaultValue={10}
                            min={0}
                            max={500}
                            onChange={(value) => {
                                useCameraConfig.setState({ viewportDistance: value });
                            }}
                        />
                    </td>
                </tr>
                */}
                <tr>
                    <td title="Field of View (deg)">FOV (deg):</td>
                    <td>
                        <Slider
                            value={config.fieldOfViewInDeg}
                            defaultValue={75}
                            min={1}
                            max={180}
                            onChange={(value) => {
                                onChange({
                                    ...config,
                                    fieldOfViewInDeg: value,
                                });
                            }}
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    );
};
