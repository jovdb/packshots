import { useQuery } from "@tanstack/react-query";
import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { checkBoardStyle } from "../src/checkboard";
import { useAllControlPoints, useDraggingControlPointsIndex } from "../src/controlPoints/store";
import { useConfigs, useRenderers } from "../src/layers/layers";
import { IRenderer } from "../src/renderers/IRenderer";
import { isPromise } from "../utils/promise";

export function Renderer({
    width,
    height,
    style,
}: {
    width: number;
    height: number;
    style?: CSSProperties;
}) {
    // Create a render target 
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const targetContextRef = useRef<CanvasRenderingContext2D | null>(null);
    if (!targetContextRef.current) targetContextRef.current = canvasRef.current?.getContext("2d") || null;

    const renderers = useRenderers();
    const configs = useConfigs();
    const allControlPoints = useAllControlPoints();
    const draggingIndex = useDraggingControlPointsIndex();

    // Rerender
    useQuery(
        ["loaded-renderers", renderers, configs, allControlPoints, draggingIndex],
        async () => {
            const render = (loadedRenderers: IRenderer[]) => {
                const targetContext = targetContextRef.current;
                if (!targetContext) return [];
                targetContext.clearRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);
                loadedRenderers.forEach((renderer, i) => {
                    const config = configs[i];
                    const controlPoints = allControlPoints[i];
                    const isDragging = draggingIndex === i;

                    targetContext.globalAlpha = isDragging ? 0.5 : 1;

                    renderer.render(targetContext, {
                        ...config,
                        controlPoints,
                    }, isDragging);

                    targetContext.globalAlpha = 1;
                });
                return loadedRenderers;
            }

            // Load
            const loaders = renderers.map((r, i) => r.loadAsync?.(configs[i]));
            const isAsync = loaders.some(isPromise);

            if (!isAsync) return render(renderers);
            return Promise.all(loaders).then(() => render(renderers));
        },
    );

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                ...style,
                outline: "1px solid #ddd",
                boxShadow: "3px 3px 4px rgba(0,0,0,0.1)",
                // checkboard background
                ...checkBoardStyle,
            }}
        />
    )
}
