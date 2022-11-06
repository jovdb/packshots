import { Vector2 } from "three";
import { ICameraConfig } from "./components/config/CameraConfig";

export interface IWithControlPoints {
    /** Get control points on rendered image */
    getControlPoints2d(): Vector2[];
    /** Get camera properties from control points */
    getCameraFromControlPoints(corners2d: Vector2[]): ICameraConfig;
}

export function isWithControlPoints<T extends {}>(obj: T): obj is T & IWithControlPoints {
    return obj && "getControlPoints2d" in obj;
}