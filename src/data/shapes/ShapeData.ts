import { Vector3 } from "three";
import { Vector2Data } from "../types";

export interface IShapeData {
  readonly shaderName: string;

  /**
   * Projected points in "normalized" screen coordinates:
   * (0,0) is at center,
   * (1,1) is at (PackshotSize/2, PackshotSize/2)
   * (-1,-1) is at (-PackshotSize/2, -PackshotSize/2)
   */
  projectedPoints: readonly Vector2Data[];

  /* Get the world points corresponding to the projected points */
  getWorldPoints(): Vector3[];
}
