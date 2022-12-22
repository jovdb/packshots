import { CSSProperties, useCallback, useMemo, useRef } from "react";
import { ControlPoint } from "../src/controlPoints/IControlPoints";
import { useElementSize } from "../src/hooks/useElementSize";
import { ILayerConfig } from "../src/IPackshot";
import { useAllControlPoints, useHistory, useLayersConfig, usePackshotActions, useRenderTrees } from "../src/stores/packshot";
import { flattenTree } from "../src/Tree";
import { DrawPoints, useLayersControlPointsDragging } from "./DrawPoints";

function layerControlPointsFilter(layerConfig: ILayerConfig) {
  return !!(layerConfig.isRenderConfigExpanded && !layerConfig.isDisabled);
}

function useControlPointsInScreenCoordinates(size: { width: number; height: number }) {
  const allControlPoints = useAllControlPoints();
  const layersConfig = useLayersConfig();
  const [renderTrees] = useRenderTrees();
  const { updateLayerRenderNodeConfig } = usePackshotActions();

  // Convert controlPoints to screen coordinates
  const controlPointsInScreenCoordinates = useMemo(
    () => (
      allControlPoints
        // Don't show controlpoints for disabled or collapsed layers
        .map((layerControlPoints, layerIndex) => {
          const layerConfig = layersConfig[layerIndex] || {};
          return layerControlPointsFilter(layerConfig)
            ? layerControlPoints
            : [];
        })
        // Convert controlpoints to screen coordinates
        .map((layerControlPoints) => (
          layerControlPoints
            .map(nodeControlPoints => (
              nodeControlPoints?.map(([x, y]) =>
                [
                  (x + 1) / 2 * size.width,
                  (y + 1) / 2 * size.height,
                ] as [number, number]
              )
            ))
        ))
    ),
    [allControlPoints, layersConfig, size.height, size.width],
  );

  const setControlPointsInScreenCoordinates = useCallback(
    (layerIndex: number, renderNodeIndex: number, newControlPointsInScreenCoordinates: ControlPoint[]) => {
      // Get Layer to update
      const renderTree = renderTrees[layerIndex];
      if (!renderTree) throw new Error(`Layer ${layerIndex} not found`);

      // Get renderNode Affected
      const renderNode = flattenTree(renderTree)[renderNodeIndex];
      if (!renderNode) throw new Error(`RenderNode not found: Layer ${layerIndex}, Render node: ${renderNodeIndex}`);

      // Normalize ControlPoints
      const normalizedControlPoints = newControlPointsInScreenCoordinates
        .map(([x, y]) => [
          x / size.width * 2 - 1,
          y / size.height * 2 - 1,
        ]) as ControlPoint[];

      // Update renderNode Config
      updateLayerRenderNodeConfig(layerIndex, renderNode, {
        ...renderNode.config,
        controlPoints: normalizedControlPoints,
      });
    },
    [renderTrees, size.height, size.width, updateLayerRenderNodeConfig],
  );

  return [
    controlPointsInScreenCoordinates,
    setControlPointsInScreenCoordinates,
  ] as const;
}

export function ControlPoints({
  style,
}: {
  style?: CSSProperties;
}) {
  const divRef = useRef<HTMLDivElement>(null);

  // const { updateControlPoints, setDraggingControlPointsIndex } = useControlPointsActions();
  const elementRect = useElementSize(divRef);

  const [controlPointsInScreenCoordinates, setControlPointsInScreenCoordinates] = useControlPointsInScreenCoordinates(
    elementRect,
  );

  const { pause, resume } = useHistory();

  const controlPointsDraggingHandles = useLayersControlPointsDragging(
    divRef,
    controlPointsInScreenCoordinates,
    (layerIndex, renderNodeIndex, newPointsInScreenCoordinates) => {
      setControlPointsInScreenCoordinates(layerIndex, renderNodeIndex, newPointsInScreenCoordinates);
    },
    (draggingLayer) => {
      // Detect when dragging
      if (draggingLayer >= 0) {
        // pause(); // Pause History tracking during drag
      } else {
        // resume();
      }
    },
  );

  return (
    <div
      ref={divRef}
      style={{
        ...style,
      }}
      {...controlPointsDraggingHandles()}
    >
      {controlPointsInScreenCoordinates.flat().map((controlPoints, i) => (
        controlPoints && (
          <DrawPoints
            key={i}
            points={controlPoints}
            style={{ position: "absolute", width: "100%", height: "100%" }}
          />
        )
      ))}
    </div>
  );
}
