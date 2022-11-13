import { IPlaneConfig2 } from "../../components/config/PlaneConfig2";
import { loadImageAsync } from "../../utils/image";
import type { IRenderer } from "./IRenderer";
import * as fx from "glfx";
import { ImageCache } from "./ImageCache";
import { debug } from "console";

// Inspired by:
// https://github.com/evanw/glfx.js/tree/master/src/core

export function isPromise(promise: null | undefined): false;
export function isPromise<T>(promise: Promise<T>): promise is Promise<T>;
export function isPromise(promise: any): promise is Promise<unknown>;
export function isPromise(promise: any): promise is Promise<unknown> {
    return !!promise && typeof promise.then === "function";
}

function chain<T, U>(
    value: Promise<T>,
    then: (value: Awaited<T>)=> U,
): Promise<U>;

function chain<T, U>(
    value: T,
    then: (value: Awaited<T>) => U,
): U;

function chain<T, U>(
    value: T | Promise<T>,
    then: (value: Awaited<T>) => U,
): U | Promise<U>;

function chain<T, U>(
    value: T | Promise<T>,
    then: (value: Awaited<T>) => U,
): U | Promise<U> {
    if (isPromise(value)) {
        return value.then(then);
    } else {
        return then(value);
    }
}


export class PlaneGlFxRenderer implements IRenderer {
    private fxCanvas: any;
    private imageCache: ImageCache;
    private texture: any;

    constructor() {
        // try to create a WebGL canvas (will fail if WebGL isn't supported)
        console.log("CREATE CANVAS");
        this.fxCanvas = fx.canvas();
        this.imageCache = new ImageCache();
    }

    loadAsync(
        config: IPlaneConfig2,
    ) {
        return chain(
            this.imageCache.loadImage(config.image.imageUrl),
            (image) => {
                if (this.texture) this.texture.destroy();
                this.texture = this.fxCanvas.texture(image);
            }
        )
    }

    render(
        targetContext: CanvasRenderingContext2D,
        config: IPlaneConfig2
    ): void {
        const image = this.imageCache.getImage(config.image.imageUrl, true);
        if (!image) return;

        const {
            controlPoints = [
                [-0.8, -0.8],
                [0.8, -0.8],
                [-0.8, 0.8],
                [0.8, 0.8],
            ]
        } = config;

        // Set canvas size
        this.fxCanvas.width = targetContext.canvas.width;
        this.fxCanvas.height = targetContext.canvas.height;
        const halfImageWidth = image.width / 2;
        const halfImageHeight = image.height / 2;

        // Draw Perspective
        console.log("RENDER");
        this.fxCanvas
            .draw(this.texture)
            .perspective(
                [
                    0, 0,
                    image.width, 0,
                    0, image.height,
                    image.width, image.height
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
            0, 0, image.width, image.height,
            0, 0, targetContext.canvas.width, targetContext.canvas.height,
        );
    }

    dispose(): void {
        this.texture.destroy();
        this.texture = undefined;
    }
}