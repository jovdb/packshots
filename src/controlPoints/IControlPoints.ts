import { Vector2 } from "three";
import { ICameraConfig } from "../../components/config/CameraConfig";

/**
 * Normalized coordinate
 * [0, 0]: Center of target image
 * [-1, -1]: top/left of the target image
 * [1, 1]: bottom/right of the target image
 */
export type ControlPoint = [x: number, y: number];

export interface IControlPoints<
    TConfig = unknown,
    TControlPoints extends ControlPoint[] = ControlPoint[],
> {
    getDefaultControlPoints(config: TConfig): TControlPoints;

    configToControlPoints(config: TConfig): TControlPoints | undefined;

    controlPointsToConfig(config: TConfig, controlPoints: TControlPoints): TConfig;
}

export function isControlPoints<TType extends ControlPoint[], T extends {}>(obj: T): obj is T & IControlPoints<TType> {
    return obj
        && "getDefaultControlPoints" in obj
        && "getControlPoints" in obj
        && "setControlPoints" in obj;
}