import { IPlaneConfig2 } from "../../components/config/PlaneConfig2";
import { loadImageAsync } from "../../utils/image";
import type { IRenderer } from "./IRenderer";
import * as fx from "glfx";

// Inspired by:
// https://github.com/evanw/glfx.js/tree/master/src/core

export class PlaneGlFxRenderer implements IRenderer {
    private config: IPlaneConfig2
    private fxCanvas: any;
    private image: HTMLImageElement | undefined;

    constructor(
        config: IPlaneConfig2,
    ) {
        this.config = {
            image: config.image || { url: "", name: "" },
            controlPoints: [
                [-0.8, -0.8],
                [0.8, -0.8],
                [-0.8, 0.8],
                [0.8, 0.8],
            ] 
        };

        // try to create a WebGL canvas (will fail if WebGL isn't supported)
        this.fxCanvas = fx.canvas();
    }

    render(targetContext: CanvasRenderingContext2D): void {
        if (!this.fxCanvas || !this.image) return;

        const { controlPoints } = this.config;

        // Set canvas size
        this.fxCanvas.width = targetContext.canvas.width;
        this.fxCanvas.height = targetContext.canvas.height;
        const halfImageWidth = this.image.width / 2;
        const halfImageHeight = this.image.height / 2;

        // Load Image
        const texture = this.fxCanvas.texture(this.image);
console.log(controlPoints);
        // Draw Perspective
        this.fxCanvas
            .draw(texture)
            .perspective(
                [
                    0, 0,
                    this.image.width, 0,
                    0, this.image.height,
                    this.image.width, this.image.height
                ],
                [
                    halfImageWidth + controlPoints[0][0] * halfImageWidth, halfImageHeight + controlPoints[0][1] * halfImageHeight,
                    halfImageWidth + controlPoints[1][0] * halfImageWidth, halfImageHeight + controlPoints[1][1] * halfImageHeight,
                    halfImageWidth + controlPoints[2][0] * halfImageWidth, halfImageHeight + controlPoints[2][1] * halfImageHeight,
                    halfImageWidth + controlPoints[3][0] * halfImageWidth, halfImageHeight + controlPoints[3][1] * halfImageHeight,
                ]
            )
            .update();

        // Draw on destination canvas
        targetContext.drawImage(
            this.fxCanvas,
            0, 0, this.image.width, this.image.height,
            0, 0, targetContext.canvas.width, targetContext.canvas.height,
        );

        texture.destroy();
    }

    async loadAsync(): Promise<void> {
        this.image = await loadImageAsync(this.config.image.imageUrl);
    }

    dispose(): void {
    }
}