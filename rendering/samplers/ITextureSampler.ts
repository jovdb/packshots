import { Vector2, Vector4 } from "three";

export interface ITextureSampler {
    width: number;
    height: number;
    /**
     * Given a x, y position as Vector2 on the texture,
     * return the RGBA values as Vector4
     */
    sample(uv: Vector2): Vector4;
}