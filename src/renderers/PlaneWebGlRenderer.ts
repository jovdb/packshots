import { IPlaneConfig2 } from "../../components/config/PlaneConfig2";
import type { IRenderer } from "./IRenderer";
import { ImageCache } from "./ImageCache";
import * as twgl from "twgl.js"

// TWGL: https://twgljs.org/
// https://twgljs.org/docs/module-twgl.html
// https://stackoverflow.com/questions/37927359/how-to-draw-2d-image-with-twgl-webgl-helper-library
export class PlaneWebGlRenderer implements IRenderer {
    private image: HTMLImageElement | undefined;
    private readonly  programInfo: twgl.ProgramInfo | undefined;
    private readonly  gl: WebGLRenderingContext;
      /** a unit quad */
    private readonly bufferInfo: twgl.BufferInfo;
    private readonly uniforms: {
        texture: WebGLTexture | undefined;
        textureMatrix: twgl.m4.Mat4 | undefined;
        matrix: twgl.m4.Mat4 | undefined;
    };

    constructor() {
        // try to create a WebGL canvas (will fail if WebGL isn't supported)
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || undefined;
        if (!gl) throw new Error("WebGL not supported");
        this.gl = gl;

        this.bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);

        const vertexShader = `
            // we will always pass a 0 to 1 unit quad
            // and then use matrices to manipulate it
            attribute vec4 position;   
            
            uniform mat4 matrix;
            uniform mat4 textureMatrix;
            
            varying vec2 texcoord;
            
            void main () {
                gl_Position = matrix * position;
                texcoord = (textureMatrix * position).xy;
            }
        `;

        const fragmentShader = `
            precision mediump float;

            varying vec2 texcoord;
            uniform sampler2D texture;

            void main() {
                if (texcoord.x < 0.0 || texcoord.x > 1.0 ||
                   texcoord.y < 0.0 || texcoord.y > 1.0) {
                   discard;
                }
                gl_FragColor = texture2D(texture, texcoord);
            }
        `;

        this.programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader], (err) => {
            console.error(err); // TODO: Error handling
        });

        this.uniforms = {
            texture: undefined,
            textureMatrix: twgl.m4.identity(),
            matrix: undefined,
        };

        gl.useProgram(this.programInfo.program);
        twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);
    }

    /**
     * Load the image and set the texture and image member variable
     */
    loadAsync(
        config: IPlaneConfig2,
    ) {
        if (this.image) return; // TODO, compare if same image is loaded (add loadedUrl member variable to compare?)

        return new Promise<void>((resolve, reject) => {
            const { gl } = this;
            this.image = undefined;
            this.uniforms.texture = twgl.createTexture(gl, {
                // src: config.image.imageUrl,
                src: "https://farm6.staticflickr.com/5695/21506311038_9557089086_m_d.jpg",
                crossOrigin: '', // not needed if image on same origin
            }, (err, tex, img) => {
                // wait for the image to load because we need to know it's size
                if (err) {
                    this.image = undefined;
                    this.uniforms.texture = undefined;
                    reject(err);
                } else {
                    this.image = img as HTMLImageElement;
                    this.uniforms.texture = tex;
                    resolve();
                }
            });
        });
    }

    render(
        targetContext: CanvasRenderingContext2D,
        config: IPlaneConfig2
    ): void {
        const { gl, uniforms, image, bufferInfo, programInfo } = this;
        if (!uniforms.texture || !image || !programInfo) throw new Error("Only call render after a succesful loadAsync");
        const m4 = twgl.m4;
        const webGlCanvas = gl.canvas as HTMLCanvasElement;
        const { width: targetWidth, height: targetHeight } = targetContext.canvas;

        // Set size
        webGlCanvas.width = targetWidth;
        webGlCanvas.height = targetHeight;
        gl.viewport(0, 0, targetWidth, targetHeight);

        // Set/Clear background
        // gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Calculate matrix
        const matrix = m4.identity();
        m4.ortho(0, targetWidth, targetHeight, 0, -1, 1, matrix); // Convert from pixels to clip space
        m4.translate(matrix, [0, 0, 0], matrix);
        m4.scale(matrix, [targetWidth, targetHeight, 1], matrix);
        this.uniforms.matrix = matrix;

        // Render
        twgl.setUniforms(programInfo, this.uniforms);
        twgl.drawBufferInfo(gl, this.bufferInfo);

        // Draw WebGl canvas on destination canvas
        targetContext.drawImage(
            webGlCanvas,
            0, 0, webGlCanvas.width, webGlCanvas.height,
            0, 0, targetWidth, targetHeight,
        );
    }

    dispose(): void {
        if (this.uniforms.texture) {
            this.gl.deleteTexture(this.uniforms.texture);
        }

        if (this.bufferInfo) {
            this.gl.deleteBuffer(this.bufferInfo);
        }

        if (this.programInfo) {
            this.gl.deleteProgram(this.programInfo);
        }
    }
}
