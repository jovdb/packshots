import { useMemo } from "react";
import { Vector3 } from "three";
import create from "zustand";
import { Slider } from "./Slider";

export const useCameraConfig = create<{
    cameraX: number;
    cameraY: number;
    cameraZ: number;
}>(() => ({
    cameraX: 0,
    cameraY: 0,
    cameraZ: -100,
}));

export function useCameraVector() {
    const projectionConfig = useCameraConfig();
    return new Vector3(projectionConfig.cameraX, projectionConfig.cameraY, projectionConfig.cameraZ);
}

export function useProjectionVector() {
    return useMemo(() => new Vector3(0, 0, 10000), []);
}

export function CameraConfig() {
    const projectionConfig = useCameraConfig();

    return (
        <table>
            <tbody>
                <tr>
                    <td>Camera X:</td>
                    <td>
                        <Slider
                            value={projectionConfig.cameraX}
                            defaultValue={0}
                            min={-100}
                            max={100}
                            onChange={(value) => {
                                useCameraConfig.setState({
                                    cameraX: value,
                                });
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Camera Y:</td>
                    <td>
                        <Slider
                            value={projectionConfig.cameraY}
                            defaultValue={0}
                            min={-100}
                            max={100}
                            onChange={(value) => {
                                useCameraConfig.setState({
                                    cameraY: value,
                                });
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Camera Z:</td>
                    <td>
                        <Slider
                            value={projectionConfig.cameraZ}
                            defaultValue={-100}
                            min={-1000}
                            max={1}
                            onChange={(value) => {
                                useCameraConfig.setState({
                                    cameraZ: value,
                                });
                            }}
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}