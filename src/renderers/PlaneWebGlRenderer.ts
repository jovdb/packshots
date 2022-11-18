import { IPlaneConfig2 } from "../../components/config/PlaneConfig2";
import type { IRenderer } from "./IRenderer";
import { ImageCache } from "./ImageCache";
import * as twgl from "twgl.js"

// TWGL: https://twgljs.org/
// https://twgljs.org/docs/module-twgl.html
// https://stackoverflow.com/questions/37927359/how-to-draw-2d-image-with-twgl-webgl-helper-library
export class PlaneWebGlRenderer implements IRenderer {
    private imageCache: ImageCache;
    private texture: WebGLTexture | undefined;
    private image: HTMLImageElement | undefined;
    private programInfo: twgl.ProgramInfo | undefined;
    private gl: WebGLRenderingContext;

    /** a unit quad */
    private bufferInfo: twgl.BufferInfo;

    constructor() {
        this.imageCache = new ImageCache();

        // try to create a WebGL canvas (will fail if WebGL isn't supported)
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || undefined;
        if (!gl) throw new Error("WebGL not supported");
        this.gl = gl;

        this.bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);;

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
            this.texture = twgl.createTexture(gl, {
                // src: config.image.imageUrl,
                src: "https://farm6.staticflickr.com/5695/21506311038_9557089086_m_d.jpg",
                crossOrigin: '', // not needed if image on same origin
            }, (err, tex, img) => {
                // wait for the image to load because we need to know it's size
                if (err) {
                    this.image = undefined;
                    this.texture = undefined;
                    reject(err);
                } else {
                    this.image = img as HTMLImageElement;
                    this.texture = tex;
                    resolve();
                }
            });
        });
    }

    render(
        targetContext: CanvasRenderingContext2D,
        config: IPlaneConfig2
    ): void {
        const { gl, texture, image, bufferInfo } = this;
        if (!texture || !image) throw new Error("Only call render after a succesful loadAsync");
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

        const vs = `
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

        const fs = `
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

        const programInfo = twgl.createProgramInfo(gl, [vs, fs], (err) => {
            console.error(err); // TODO: Error handling
        });

        // Convert from pixels to clip space
        const matrix = m4.identity();
        m4.ortho(0, targetWidth, targetHeight, 0, -1, 1, matrix);
        
        m4.translate(matrix, [0, 0, 0], matrix);
        m4.scale(matrix, [targetWidth, targetHeight, 1], matrix);

        const uniforms = {
            texture,
            textureMatrix: m4.identity(),
            matrix,
        };

        // Render
        gl.useProgram(programInfo.program);
        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
        twgl.setUniforms(programInfo, uniforms);
        twgl.drawBufferInfo(gl, bufferInfo);

        // Draw WebGl canvas on destination canvas
        targetContext.drawImage(
            webGlCanvas,
            0, 0, webGlCanvas.width, webGlCanvas.height,
            0, 0, targetWidth, targetHeight,
        );
    }

    dispose(): void {
        if (this.texture) {
            this.gl.deleteTexture(this.texture);
            this.texture = undefined;
        }

        if (this.bufferInfo) {
            this.gl.deleteBuffer(this.bufferInfo);
            this.bufferInfo = undefined!;
        }

        if (this.programInfo) {
            this.gl.deleteProgram(this.programInfo);
            this.programInfo = undefined;
        }
    }
}