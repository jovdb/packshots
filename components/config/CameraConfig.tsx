import { useMemo } from "react";
import { Vector2, Vector3 } from "three";
import create from "zustand";
import { Slider } from "../Slider";
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

export const useCameraConfig = create<{
    /** Position of the camera in world units, origin is at geometry (cm)*/
    position: [x: number, y: number, z: number];
    /** A direction vector for the camera */
    direction: [x: number, y: number, z: number];
    /** Size of the viewport in world units (cm) */
    viewportSize: [w: number, height: number];
    /** Distance from the camera to the viewPort in world units (cm) */
    viewportDistance: number;

    // Camera angle/tilt needed?

    fieldOfViewInDeg: number;
    aspectRatio: number;
}>(() => ({
    /** Position of camera in cm */
    position: [0, 0, 50],
    direction: [0, 0, 0],
    viewportSize: [15, 10],
    viewportDistance: 50,
    
    fieldOfViewInDeg: 20,
    aspectRatio: 1.5,
}));

export function useProjectionVector() {
    return useMemo(() => new Vector3(0, 0, 10000), []);
}

/** Raw configuration of the camera */
export const useCamera = () => {
    const cameraConfig = useCameraConfig();
    return useMemo(() => ({
        position: new Vector3(...cameraConfig.position),
        direction: new Vector3(...cameraConfig.direction),
        viewPortSize: new Vector2(...cameraConfig.viewportSize),
        viewPortDistance: cameraConfig.viewportDistance,
        fieldOfViewInDeg: cameraConfig.fieldOfViewInDeg,
        aspectRatio: cameraConfig.aspectRatio,
    }), [cameraConfig]);
}

export type ICamera = ReturnType<typeof useCamera>;

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
                            step={0.1}
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
                            step={0.1}
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
                            defaultValue={50}
                            min={1000}
                            max={1}
                            step={0.1}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    position: [state.position[0], state.position[1], value],
                                }));
                            }}
                        />
                    </td>
                </tr>
                <tr><td colSpan={2}><hr /></td></tr>
                <tr>
                    <td>Direction X:</td>
                    <td>
                        <Slider
                            value={projectionConfig.direction[0]}
                            defaultValue={0}
                            min={-100}
                            max={100}
                            step={0.1}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    direction: [value, state.direction[1], state.direction[2]],
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
                            step={0.1}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    direction: [state.direction[0], value, state.direction[2]],
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
                            step={0.1}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    direction: [state.direction[0], state.direction[1], value],
                                }));
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
                    <td>Field of View (deg):</td>
                    <td>
                        <Slider
                            value={projectionConfig.fieldOfViewInDeg}
                            defaultValue={75}
                            min={1}
                            max={180}
                            onChange={(value) => {
                                useCameraConfig.setState((state) => ({
                                    fieldOfViewInDeg: value,
                                }));
                            }}
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
