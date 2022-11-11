import { IPlaneConfig2 } from "../components/config/PlaneConfig2";
import type { IControlPoints, ControlPoint } from "./IControlPoints";

type ControlPoints = [topLeft: ControlPoint, topRight: ControlPoint, bottomRight: ControlPoint, bottomLeft: ControlPoint];

export class PlaneControlPoints implements IControlPoints<IPlaneConfig2, ControlPoints> {

    /** The default is a rectangle that covers half of the screen */
    getDefaultControlPoints(fromConfig: IPlaneConfig2): ControlPoints {
        // TODO: Get dimentions from config
        const imageWidth = 150;
        const imageHeight = 100;
        const maxSize = Math.max(imageWidth, imageHeight);
        
        const corners = [
            [0, 0],
            [0, imageWidth],
            [imageHeight, imageWidth],
            [0, imageHeight],
        ];

        return corners

            // Normalize to a max side of 1
            .map(([x, y]) => [x / maxSize, y / maxSize])

            // Convert [0, 1] ot [-1, 1] range
            .map(([x, y]) => [x * 2 - 1, y * 2 - 1])

            // Convert to 80% of the target size
            .map(([x, y]) => [x * 0.8, y * 0.8]) as ControlPoints
    }

    configToControlPoints(fromConfig: IPlaneConfig2): ControlPoints | undefined {
        throw new Error("Method not implemented.");
    }

    controlPointsToConfig(fromConfig: IPlaneConfig2, controlPoints: ControlPoints): IPlaneConfig2 {
        throw new Error("Method not implemented.");
    }

}