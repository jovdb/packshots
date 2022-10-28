import { Vector3 } from "three";
import { Vector2Data } from "../types";
import { IShapeData } from "./ShapeData";

export class ConeData implements IShapeData {
    public readonly shaderName: string;
    public readonly diameterTop: number;
    public readonly diameterBottom: number;
    public readonly height: number;
    public readonly projectedPoints: Vector2Data[];

    constructor(options: {
        diameterTop: number;
        diameterBottom?: number;
        height: number;
    }) {
        this.shaderName = "cone";
        this.diameterTop = options.diameterTop;
        this.diameterBottom = options.diameterBottom ?? options.diameterTop;
        this.height = options.height;
        
        this.projectedPoints = [
            [-0.2, -0.4],
            [0, -0.2],
            [0.2, -0.4],
            [-0.3, 0.3],
            [0, 0.4],
            [0.3, 0.3],
        ];
    }

    public getWorldPoints(): Vector3[] {
        const r1 = this.diameterTop / 2;
        const r2 = this.diameterBottom / 2;
        const hh = this.height / 2;

        return [
            new Vector3(-r1, 0, -hh),
            new Vector3(0, r1, -hh),
            new Vector3(r1, 0, -hh),
            new Vector3(-r2, 0, hh),
            new Vector3(0, r2, hh),
            new Vector3(r2, 0, hh),
        ];
    }
}

export interface IConeData extends ConeData { }
