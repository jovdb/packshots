import { useLayoutEffect, useRef } from "react";

/** Component that shows ImageData */
export function ImageData({
    imageData,
}: {
    imageData: ImageData | null | undefined;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Update Canvas wuth new imageData
    useLayoutEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl || !imageData) return;
        let ctx = ctxRef.current;
        if (!ctx) ctx = ctxRef.current = canvasEl.getContext("2d") || null;
        if (!ctx) return;
        ctx.putImageData(imageData, 0, 0);
    }, [imageData]);

    return (
        <canvas
            ref={canvasRef}
            width={imageData?.width ?? 0}
            height={imageData?.height ?? 0}
            style={{
                width: "100%",
                height: "auto",
                border: "1px solid #ddd",
                boxShadow: "2px 2px 3px rgba(0,0,0,0.1)",
                // scale to available size
                maxHeight: "calc(100vh - 24px)",
                maxWidth: "calc(100vh - 24px)",
            }}
        />
    );
}
