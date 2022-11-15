import { useQuery } from "@tanstack/react-query";
import React, { CSSProperties, useMemo, useRef, useState } from "react";
import { useAllControlPoints } from "../src/controlPoints/store";
import { useConfigs, useRenderers } from "../src/layers/layers";
import { IRenderer } from "../src/renderers/IRenderer";
import { isPromise } from "../src/renderers/PlaneGlFxRenderer";

export function Renderer({
    width,
    height,
    style,
}: {
    width: number;
    height: number;
    style?: CSSProperties;
}) {
    const checkBoardSize = 25;
    const checkBoardDark = "#e8e8e8";
    const checkBoardLight = "#f8f8f8";

    // Create a render target 
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const targetContextRef = useRef<CanvasRenderingContext2D | null>(null);
    if (!targetContextRef.current) targetContextRef.current = canvasRef.current?.getContext("2d") || null;

    const renderers = useRenderers();
    const configs = useConfigs();
    const allControlPoints = useAllControlPoints();

    // Rerender
    useQuery(
        ["loaded-renderers", renderers, configs, allControlPoints],
        async () => {
            const render = (loadedRenderers: IRenderer[]) => {
                const targetContext = targetContextRef.current;
                if (!targetContext) return [];
                targetContext.clearRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);
                loadedRenderers.forEach((renderer, i) => {
                    const config = configs[i];
                    const controlPoints = allControlPoints[i];
                    renderer.render(targetContext, {
                        ...config,
                        controlPoints,
                    });
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
                backgroundImage: `
                            linear-gradient(45deg, ${checkBoardDark} 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, ${checkBoardDark} 75%),
                            linear-gradient(45deg, transparent 75%, ${checkBoardDark} 75%),
                            linear-gradient(45deg, ${checkBoardDark} 25%, ${checkBoardLight} 25%)`,
                backgroundSize: `${checkBoardSize}px ${checkBoardSize}px`,
                backgroundPosition: `
                            0 0,
                            0 0,
                            calc(${checkBoardSize}px * -0.5) calc(${checkBoardSize}px * -0.5),
                            calc(${checkBoardSize}px * 0.5) calc(${checkBoardSize}px * 0.5)`,
            }}
        />
    )
}
