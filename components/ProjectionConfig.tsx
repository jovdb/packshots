import { useMemo } from "react";
import { Vector3 } from "three";
import create from "zustand";
import { Slider } from "./Slider";

export const useCameraConfig = create<{
    cameraZ: number;
}>(() => ({
    cameraZ: 100,
}));

export function useCameraVector() {
    const projectionConfig = useCameraConfig();
    return new Vector3(0, 0, projectionConfig.cameraZ);
}

export function useProjectionVector() {
    return useMemo(() => new Vector3(0, 0, 1), []);
}

export function CameraConfig() {
    const projectionConfig = useCameraConfig();

    return (
        <table>
            <tbody>
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