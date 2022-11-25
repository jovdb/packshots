import { useQuery } from "@tanstack/react-query";
import { CSSProperties, useEffect, useLayoutEffect, useRef } from "react";
import { checkBoardStyle } from "../src/checkboard";
import { Renderers } from "../src/IPackshot";
import { usePackshotStore, useRenderTrees } from "../src/packshot";
import { flattenTree, walkTree } from "../src/Tree";


function render(
    targetContext: CanvasRenderingContext2D | null | undefined,
    renderTrees: Renderers[], 
) {
    if (!targetContext) return;

    // Clear Canvas
    targetContext.clearRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);

    renderTrees.forEach((renderTree) => {
        walkTree(
            renderTree,
            (renderNode) => {
                const config = renderNode.config;
                const renderer = renderNode.renderer;
                return renderer?.render(targetContext, config, false);
            }
        )
    });
}

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

    const renderTrees = useRenderTrees();

    const {isFetching: isLoadingRenderer, data: renderId } = useQuery([renderTrees], () => {
        return Promise
            .all(
                renderTrees.flatMap(renderTree => flattenTree(renderTree)
                    .map(renderNode => {
                        return renderNode.renderer?.loadAsync?.(renderNode.config)
                    })
                )
            )
            .catch((err) => {
                console.error("Error Loading renderers", err);
                return Math.random();
            })
            .then(() => {
                render(targetContextRef.current, renderTrees);
                return Math.random(); // Return a unique result that can be used in a dependency array
            })
            .catch((err) => {
                console.error("Error rendering", err);
                return Math.random();
            });
    });
/*
    useLayoutEffect(() => {
        if(isLoadingRenderer) render(targetContextRef.current, renderTrees);
    }, [isLoadingRenderer, renderId]);
  */  
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
