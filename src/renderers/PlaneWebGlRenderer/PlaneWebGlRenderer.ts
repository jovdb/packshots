/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as twgl from "twgl.js/dist/5.x/twgl-full";
import { IPlaneRendererConfig } from "../../components/config/PlaneRendererConfig";
import { ControlPoint } from "../../controlPoints/IControlPoints";
import type { IRenderer, IRenderResult } from "../IRenderer";

// @ts-expect-error
import vertexShader from "./vertex.glsl?raw";
// @ts-expect-error
import fragmentShader from "./fragment.glsl?raw";
import { getImageUrl, PackshotRoot } from "../../stores/app";

// TWGL: https://twgljs.org/
// https://twgljs.org/docs/module-twgl.html
// https://stackoverflow.com/questions/37927359/how-to-draw-2d-image-with-twgl-webgl-helper-library
export class PlaneWebGlRenderer implements IRenderer {
  private image: HTMLImageElement | undefined;
  private readonly programInfo: twgl.ProgramInfo | undefined;
  private readonly gl: WebGLRenderingContext;
  /** a unit quad */
  private readonly bufferInfo: twgl.BufferInfo;
  private readonly uniforms: {
    texture: WebGLTexture | undefined;
    textureMatrix: twgl.m4.Mat4 | undefined;
    projectionMatrix: twgl.m4.Mat4 | undefined;
    /** 0: Texture (default), 1: Checkerboard, 2: None */
    textureStyle: 0 | 1 | 2;
  };

  constructor() {
    // try to create a WebGL canvas (will fail if WebGL isn't supported)
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || undefined;
    if (!gl) throw new Error("WebGL not supported");
    this.gl = gl;

    // return a 2x2 quad with values from -1 to +1.
    this.bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);

    this.programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader], (err) => {
      throw new Error(`Error loading WebGL program. ${err}`); // TODO: Error handling
    });

    this.uniforms = {
      texture: undefined,
      textureMatrix: twgl.m4.identity(),
      projectionMatrix: undefined,
      textureStyle: 1,
    };

    gl.useProgram(this.programInfo.program);
    twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);
  }

  /**
   * Load the image and set the texture and image member variable
   */
  async loadAsync(
    config: IPlaneRendererConfig,
    root: PackshotRoot,
  ) {
    if (this.image) return; // TODO, compare if same image is loaded (add loadedUrl member variable to compare?)

    // If No image if configured, show a checkerboard as image
    if (!config.image.url) {
      this.uniforms.textureStyle = 1;
      return;
    }

    const url = await getImageUrl(root, config.image);

    // load url in texture
    return new Promise<void>((resolve, reject) => {
      const { gl } = this;
      this.image = undefined;
      if (this.uniforms.texture) this.gl.deleteTexture(this.uniforms.texture);
      this.uniforms.texture = twgl.createTexture(gl, {
        src: url,
        // src: "https://farm6.staticflickr.com/5695/21506311038_9557089086_m_d.jpg",
        crossOrigin: "", // not needed if image is on same origin
      }, (err, tex, img) => {
        // wait for the image to load because we need to know it's size
        if (err) {
          this.image = undefined;
          if (this.uniforms.texture) this.gl.deleteTexture(this.uniforms.texture);
          this.uniforms.texture = undefined;
          this.uniforms.textureStyle = 1; // Show checkerboard
          reject(err);
        } else {
          this.image = img as HTMLImageElement;
          this.uniforms.texture = tex;
          this.uniforms.textureStyle = 0;
          resolve();
        }
      });
    });
  }

  render(
    drawOnContext: CanvasRenderingContext2D,
    config: IPlaneRendererConfig,
  ): IRenderResult | undefined | void {
    const { gl, uniforms, bufferInfo, programInfo } = this;
    if (!programInfo) {
      throw new Error("Only call render when programInfo is available");
    }
    const { m4 } = twgl;
    const webGlCanvas = gl.canvas as HTMLCanvasElement;
    const { width: targetWidth, height: targetHeight } = drawOnContext.canvas;

    // Set size
    webGlCanvas.width = targetWidth;
    webGlCanvas.height = targetHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Set/Clear background
    // gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Calculate matrix
    // Get the 4x4 orthographic projection matrix
    const matrix = m4.ortho(0, targetWidth, targetHeight, 0, -1, 1); // Convert from pixels to clip space
    m4.scale(matrix, [targetWidth, targetHeight, 1], matrix); // stretch to canvas size

    // Get perspective matrix 
    const projectionMatrix = this.getProjectionMatrixFromControlPoints(config.controlPoints);
    if (projectionMatrix) {
      m4.multiply(matrix, projectionMatrix, matrix);
    }
    uniforms.projectionMatrix = matrix;

    // Render
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);

    // Draw WebGl canvas on destination canvas
    drawOnContext.drawImage(
      webGlCanvas,
      0,
      0,
      webGlCanvas.width,
      webGlCanvas.height,
      0,
      0,
      targetWidth,
      targetHeight,
    );
  }

  /**
   * Get matrix to convert a normalized image (from range: 0 to 1) to the control points (range:  -1 to 1) 
   */
  public getProjectionMatrixFromControlPoints(
    controlPoints: ControlPoint[] | undefined,
  ) {
    if (!controlPoints) return twgl.m4.identity();

    /** Convert control point (range [-1,1]) to image range (0-1) */
    function getNormalizedControlPoint(x: number, y: number) {
      return [
        0.5 + x * 0.5,
        0.5 + y * 0.5,
      ] as ControlPoint;
    }

    /** Returns the 3x3 matrix that maps an image to the projected points */
    function getMapping(
      p0: ControlPoint,
      p1: ControlPoint,
      p2: ControlPoint,
      p3: ControlPoint,
    ): number[] | undefined {
      /*
            p0       p1
            +-------+
            |       |
            |       |
            +-------+
            p3       p2

            https://math.stackexchange.com/questions/296794/finding-the-transform-matrix-from-4-projected-points-with-javascript/339033#339033

            See also
            https://math.stackexchange.com/questions/62936/transforming-2d-outline-into-3d-plane/63100#63100
            https://math.stackexchange.com/questions/185708/problem-in-deducing-perspective-projection-matrix/186254#186254
            https://en.wikipedia.org/wiki/Homography#Mathematical_definition

            q3       q1
            +-------+
            |       |
            |       |
            +-------+
            q2       q4
           */

      // q: reordered points
      const q1 = p1;
      const q2 = p3;
      const q3 = p0;
      const q4 = p2;

      // Remark: WebGL matrices are row-major! (have horizontal columns)
      // dprint-ignore
      const mat = [
        q1[0], q2[0], q3[0], 0,
        q1[1], q2[1], q3[1], 0,
        1, 1, 1, 0,
        0, 0, 0, 1,
      ];

      const inv = twgl.m4.inverse(mat);
      const normalVector = twgl.v3.create(q4[0], q4[1], 1);

      const [s1, s2, s3] = transformNormal(inv, normalVector); // Remark: TWGL does invert for use

      // dprint-ignore
      return [
        q1[0] * s1, q1[1] * s1, 0, s1,
        q2[0] * s2, q2[1] * s2, 0, s2,
        0, 0, 1, 0,
        q3[0] * s3, q3[1] * s3, 0, s3,
      ];
    }

    const src0 = [0, 0] as ControlPoint;
    const src1 = [1, 0] as ControlPoint;
    const src2 = [1, 1] as ControlPoint;
    const src3 = [0, 1] as ControlPoint;

    const dst0 = getNormalizedControlPoint(...controlPoints[0]);
    const dst1 = getNormalizedControlPoint(...controlPoints[1]);
    const dst2 = getNormalizedControlPoint(...controlPoints[2]);
    const dst3 = getNormalizedControlPoint(...controlPoints[3]);

    const matrixA = getMapping(src0, src1, src2, src3);
    const matrixB = getMapping(dst0, dst1, dst2, dst3);
    if (!matrixA || !matrixB) return null;

    // const invA = twgl.m4.inverse(matrixA);
    // const matrixC = twgl.m4.multiply(invA, matrixB);

    const matrixC = twgl.m4.multiply(matrixB, matrixA);

    return matrixC;
  }

  dispose(): void {
    if (this.uniforms.texture) {
      this.gl.deleteTexture(this.uniforms.texture);
      this.uniforms.texture = undefined;
      this.image = undefined;
    }

    if (this.bufferInfo) {
      const buffer = this.bufferInfo.indices;
      if (buffer) this.gl.deleteBuffer(buffer);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).bufferInfo = undefined;
    }

    if (this.programInfo) {
      const program = this.programInfo.program;
      if (program) this.gl.deleteProgram(program);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).programInfo = undefined;
    }
  }
}

/**
 * Takes a 4-by-4 matrix m and a vector v with 3 entries, interprets the vector
 * as a normal to a surface, and computes a vector which is normal upon
 * transforming that surface by the matrix. The effect of this function is the
 * same as transforming v (as a direction) by the inverse-transpose of m.  This
 * function assumes the transformation of 3-dimensional space represented by the
 * matrix is parallel-preserving, i.e. any combination of rotation, scaling and
 * translation, but not a perspective distortion.  Returns a vector with 3
 * entries.
 * @param {module:twgl/m4.Mat4} m The matrix.
 * @param {module:twgl/v3.Vec3} v The normal.
 * @return {module:twgl/v3.Vec3} The transformed normal.
 */
function transformNormal(m: twgl.m4.Mat4, v: twgl.v3.Vec3) {
  // Remark: TWGL.transformNormal implementation didn't work, I seems to do an invert for us?
  // Used implementation from Skia and transposed matrix
  // TWGL version: https://github.com/greggman/twgl.js/blob/master/src/m4.js#L1260
  // CS version: https://referencesource.microsoft.com/#System.Numerics/System/Numerics/Vector3.cs,b1c5f8d8b60c6ccc
  return [
    v[0] * m[0] + v[1] * m[1] + v[2] * m[2],
    v[0] * m[4] + v[1] * m[5] + v[2] * m[6],
    v[0] * m[8] + v[1] * m[9] + v[2] * m[10],
  ];
}

/**
 * The matrix as string in Math form instead of WebGL form (transposed)
 * Sample output:
 * ┌─                         ─┐
 * │  0.00, -0.00, -0.00, 0.00 │
 * │  0.00,  0.00, -0.00, 0.00 │
 * │ -0.57, -0.47,  2.04, 0.00 │
 * │  0.00,  0.00,  0.00, 1.00 │
 * └─                         ─┘
 */

export function matrixToString(m: twgl.m4.Mat4 | null | undefined, name = "") {
  if (!m) return `${name ? `${name}: ` : ""}${m}`;
  const widths = [0, 1, 2, 3]
    .map(row => (
      Math.max(...[0, 1, 2, 3]
        .map(col =>
          m[row * 4 + col]
            .toFixed(2)
            .toString()
            .length
        ))
    ));
  const totalWidth = widths.reduce((p, c) => p + c + 2, 0);
  const line = new Array(totalWidth - 1).join(" ");
  const logRow = (row: number) =>
    [0, 1, 2, 3]
      .map(col => (
        m[row + col * 4]
          .toFixed(2)
          .toString()
          .padStart(widths[col])
      ))
      .join(", ");
  const prefix = name
    ? new Array(name.length + 2)
      .fill(" ")
      .join("")
    : "";
  return `${prefix}┌─${line}─┐
${name ? `${name}: ` : ""}│ ${logRow(0)} │
${prefix}│ ${logRow(1)} │
${prefix}│ ${logRow(2)} │
${prefix}│ ${logRow(3)} │
${prefix}└─${line}─┘`;
}
