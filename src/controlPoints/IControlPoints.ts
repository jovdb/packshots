/**
 * Normalized coordinate
 * [0, 0]: Center of target image
 * [-1, -1]: top/left of the target image
 * [1, 1]: bottom/right of the target image
 */
export type ControlPoint = [x: number, y: number];

export interface IControlPointsController<
    TConfig = {},
    TControlPoints extends ControlPoint[] = ControlPoint[],
> {
    getDefaultControlPoints(config: TConfig): TControlPoints;

    configToControlPoints(config: TConfig): TControlPoints | undefined;

    controlPointsToConfig(config: TConfig, controlPoints: TControlPoints): TConfig;
}

export interface IControlPointsConfig {

    /**
     * ControlPoints in normalized target image size
     * 0,0 = topLeft of target image
     * 1,1 = bottomLeft of target image
     */
    controlPoints: ControlPoint[] | undefined;
}

export function isControlPoints<TType extends ControlPoint[], T extends {}>(obj: T): obj is T & IControlPointsController<TType> {
    return obj
        && "getDefaultControlPoints" in obj
        && "configToControlPoints" in obj
        && "controlPointsToConfig" in obj;
}
