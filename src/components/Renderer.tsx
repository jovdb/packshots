import { useQuery } from "@tanstack/react-query";
import { CSSProperties, useRef } from "react";
import { checkBoardStyle } from "../checkboard";
import { ILayerConfig, IPackshotConfig, IRenderTree } from "../IPackshot";
import { usePackshotRoot } from "../stores/app";
import { useLayersConfig, usePackshotConfig, useRenderTrees } from "../stores/packshot";
import { flattenTree, walkTree } from "../Tree";
import { Exception, handleError } from "../utils/error";
import { ControlPoints } from "./ControlPoints";

export class RenderException extends Exception {
  public config?: {}

  constructor(
    message: string,
    config: {},
    /** Optional inner exception */
    innerException?: unknown,
  ) {
    super(message, innerException);
    this.config = {...config};
  }
}

/**
 * Render multiple layers on a canvas to create a packshot
 * @param targetContext The canvas Context where we draw on
 * @param renderTrees An array of layers to render, each layer is a tree (example when masking is performed)
 * @param layersConfig The configuration (like layer composition, hidden layers, etc) of each layer in the same order as the renderTrees passed
 * @param packshotConfig General config of the Packshot (like image size)
 */
function render(
  targetContext: CanvasRenderingContext2D | null | undefined,
  renderTrees: IRenderTree[],
  layersConfig: ILayerConfig[],
  packshotConfig: IPackshotConfig,
) {
  if (!targetContext) return;
  console.log("Rendering...");

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
          try {
            if (!renderer) return;

            // console.log(`${new Array(depth * 2).fill(" ")}- Rendering '${renderTree.name ?? renderTree.renderer?.constructor?.name ?? "?"}'`);

            // Render on current drawing context
            const renderResult = renderer.render(currentDrawContext, config, packshotConfig, false);

            // Set next drawing Context the the context returned by the renderer
            const restoreContext = currentDrawContext;
            if (renderResult?.childContext) currentDrawContext = renderResult?.childContext;

            // TODO: shouldn't we restore the drawContext ourself?
            // The returned function will be called after all children are processed
            // We will call (if available) the renders afterChildren function
            return () => {
              renderResult?.afterChildren?.();
              // Restore context
              currentDrawContext = restoreContext;
            };
          } catch (err) {
            throw new RenderException(`Error rendering layer #${layerIndex}`, config, err);
          }
        },
      );
    } finally {
      currentDrawContext.restore();
    }
  });
  console.log("Rendering ended...");
}

/** A React component the renders the packshot */
export function Renderer({
  width,
  height,
  style,
}: Readonly<{
  width: number;
  height: number;
  style?: CSSProperties;
}>) {
  // Create a render target
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetContextRef = useRef<CanvasRenderingContext2D | null>(null);
  if (!targetContextRef.current) targetContextRef.current = canvasRef.current?.getContext("2d") || null;

  const [renderTrees, renderTreeId] = useRenderTrees();
  const layersConfig = useLayersConfig();
  const [packshotConfig] = usePackshotConfig();
  const [root] = usePackshotRoot();

  useQuery(["renderDeps", renderTreeId, layersConfig, packshotConfig, root], () =>
    Promise
      .all(
        renderTrees
          .flatMap(renderTree =>
            flattenTree(renderTree)
              .map(renderNode => renderNode.renderer?.loadAsync?.(renderNode.config, root, packshotConfig))
          ),
      )
      .catch(err => {
        throw new Exception("Error loading resources for rendering", err);
      })
      .then(() => {
        render(targetContextRef.current, renderTrees, layersConfig, packshotConfig);
        return Math.random(); // Return a unique result that can be used in a dependency array
      })
      .catch((err) => {
        handleError(err);
        return Math.random();
      }));
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
