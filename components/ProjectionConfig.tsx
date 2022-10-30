import { useMemo } from "react";
import { Matrix4, Vector3 } from "three";
import create from "zustand";
import { Slider } from "./Slider.";

export const useProjectionConfig = create<{
    cameraZ: number;
}>(() => ({
    cameraZ: 10,
}));

export function useCameraVector() {
    const projectionConfig = useProjectionConfig();
    return new Vector3(0, 0, projectionConfig.cameraZ);
}

export function useProjectionVector() {
    return useMemo(() => new Vector3(0, 0, 2), []);
}

export function ProjectionConfig() {

    const projectionConfig = useProjectionConfig();

    return (
        <table>
            <tbody>
                <tr>
                    <td>Camera Z:</td>
                    <td>
                        <Slider
                            value={projectionConfig.cameraZ}
                            defaultValue={0}
                            onChange={(value) => {
                                useProjectionConfig.setState({
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