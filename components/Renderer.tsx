import { useQuery } from "@tanstack/react-query";
import { CSSProperties, useEffect, useRef } from "react";
import { checkBoardStyle } from "../src/checkboard";
import { ILayerConfig, IPackshotConfig, IRenderTree } from "../src/IPackshot";
import { usePackshotRoot } from "../src/stores/app";
import { useLayersConfig, usePackshotConfig, useRenderTrees } from "../src/stores/packshot";
import { flattenTree, walkTree } from "../src/Tree";
import { ControlPoints } from "./ControlPoints";

function render(
  targetContext: CanvasRenderingContext2D | null | undefined,
  renderTrees: IRenderTree[],
  layersConfig: ILayerConfig[],
  packshotConfig: IPackshotConfig,
) {
  if (!targetContext) return;

  // Clear Canvas
  targetContext.clearRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);
  let currentDrawContext = targetContext;
  renderTrees.forEach((renderTree, layerIndex) => {
    const layerConfig = layersConfig[layerIndex] || {};

    if (layerConfig.isDisabled) return;

    currentDrawContext.save();
    try {
      const { composition } = layerConfig;
      if (composition) {
        currentDrawContext.globalCompositeOperation = composition as GlobalCompositeOperation;
      }

      walkTree(
        renderTree,
        (renderNode) => {
          const { config, renderer } = renderNode;
          if (!renderer) return;

          //           console.log(`${new Array(depth * 2).fill(" ")}- Rendering '${renderTree.name ?? renderTree.renderer?.constructor?.name ?? "?"}'`);

          // Render
          const renderResult = renderer.render(currentDrawContext, config, packshotConfig, false);

          // Set next drawing Context
          const restoreContext = currentDrawContext;
          currentDrawContext = renderResult?.nextContext || currentDrawContext;

          // TODO shouldn't we restore the drawContext ouself?
          return () => {
            renderResult?.afterChildren?.();
            // Restore context
            currentDrawContext = restoreContext;
          };
        },
      );
    } finally {
      currentDrawContext.restore();
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebugDeps(deps: any[]) {
  deps.forEach((dep) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      console.log("dep changed", dep);
    }, [dep])
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

  const [renderTrees, renderTreeId] = useRenderTrees();
  const layersConfig = useLayersConfig();
  const [packshotConfig] = usePackshotConfig();
  const [root] = usePackshotRoot();

  useQuery(["renderDeps", renderTreeId, layersConfig, packshotConfig, root], () => {
    console.log("useQuery rerun")
    return Promise
      .all(
        renderTrees
          .flatMap(renderTree =>
            flattenTree(renderTree)
              .map(renderNode => renderNode.renderer?.loadAsync?.(renderNode.config, root, packshotConfig))
          ),
      )
      .catch((err) => {
        console.error("Error Loading renderers", err);
      })
      .then(() => {
        render(targetContextRef.current, renderTrees, layersConfig, packshotConfig);
        return Math.random(); // Return a unique result that can be used in a dependency array
      })
      .catch((err) => {
        console.error("Error rendering", err);
        return Math.random();
      })
    }, {
      retry: false,
      
    });
  /*
    useLayoutEffect(() => {
        if(isLoadingRenderer) render(targetContextRef.current, renderTrees);
    }, [isLoadingRenderer, renderId]);
  */
  return (
    <>
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
      <ControlPoints
        style={style}
      />
    </>
  );
}
