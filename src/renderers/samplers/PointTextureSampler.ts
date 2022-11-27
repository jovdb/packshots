import { Vector2, Vector4 } from "three";
import { ITextureSampler } from "./ITextureSampler";

export class PointTextureSampler implements ITextureSampler {
  public readonly width: number;
  public readonly height: number;

  constructor(private readonly texture: ImageData) {
    this.width = texture.width;
    this.height = texture.height;
  }

  /** Get RGBA as Vector4 on a texture */
  public sample(point: Vector2): Vector4 {
    const { x, y } = point;
    const offset = y * (this.width * 4) + x * 4;
    return new Vector4(
      this.texture.data[offset],
      this.texture.data[offset + 1],
      this.texture.data[offset + 2],
      this.texture.data[offset + 3],
    );
  }
}
