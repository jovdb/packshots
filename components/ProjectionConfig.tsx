import { useMemo } from "react";
import { Vector3 } from "three";
import create from "zustand";
import { Slider } from "./Slider";

export const useCameraConfig = create<{
    position: [x: number, y: number, z: number];
    direction: [x: number, y: number, z: number];
}>(() => ({
    position: [0, 0, -100],
    direction: [0, 0, 0],
}));

export function useProjectionVector() {
    return useMemo(() => new Vector3(0, 0, 10000), []);
}

export const useCameraPosition = () => new Vector3(...useCameraConfig(s => s.position));
export const useCameraDirection = () => new Vector3(...useCameraConfig(s => s.direction));

export const useCamera = () => {
    const cameraConfig = useCameraConfig();
    return useMemo(() => ({
        position: new Vector3(...cameraConfig.position),
        direction: new Vector3(...cameraConfig.direction),
    }), [cameraConfig]);
}

export function CameraConfig() {
    const projectionConfig = useCameraConfig();

    return (
        <table>
            <tbody>
                <tr>
                    <td>Position X:</td>
                    <td>
                        <Slider
                            value={projectionConfig.position[0]}
                            defaultValue={0}
                            min={-100}
                            max={100}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    position: [value, state.position[1], state.position[2]],
                                }));
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Position Y:</td>
                    <td>
                        <Slider
                            value={projectionConfig.position[1]}
                            defaultValue={0}
                            min={-100}
                            max={100}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    position: [state.position[0], value, state.position[2]],
                                }));
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Position Z:</td>
                    <td>
                        <Slider
                            value={projectionConfig.position[2]}
                            defaultValue={-100}
                            min={-1000}
                            max={1}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    position: [state.position[0], state.position[1], value],
                                }));
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Direction X:</td>
                    <td>
                        <Slider
                            value={projectionConfig.direction[0]}
                            defaultValue={0}
                            min={-100}
                            max={100}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    direction: [value, state.position[1], state.position[2]],
                                }));
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Direction Y:</td>
                    <td>
                        <Slider
                            value={projectionConfig.direction[1]}
                            defaultValue={0}
                            min={-100}
                            max={100}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    direction: [state.position[0], value, state.position[2]],
                                }));
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Direction Z:</td>
                    <td>
                        <Slider
                            value={projectionConfig.direction[2]}
                            defaultValue={0}
                            min={-1000}
                            max={1}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    direction: [state.position[0], state.position[1], value],
                                }));
                            }}
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}