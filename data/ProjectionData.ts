import { ConeData } from "./shapes/ConeData";
import { Vector2Data } from "./types";

export interface IImageProjectionData {
    /* Zoom power base-2, e.g. the zoom factor is 2^ZoomPower */
    zoom: number;

    shift: Vector2Data;
}

export interface IProjectionData {

    /** TODO: Expose only Shape class, and pick up right shader and UI */
    shape: ConeData;

    image: IImageProjectionData;

    isProductMaskEnabled: boolean;
}