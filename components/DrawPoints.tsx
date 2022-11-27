import { useDrag } from '@use-gesture/react'
import { CSSProperties, forwardRef, Ref, useRef } from 'react';

/** Allow dragging multiple control points with 1 drag handler */
export function useLayersControlPointsDragging(
    ref: React.RefObject<HTMLDivElement>,
    /** [layerIndex][renderNodeIndex][ControlPoint1, ControlPoint2] */
    layersControlPoints: [x: number, y: number][][][],
    onChangeControlPoints: (layerIndex: number, renderNodeIndex: number, value: [x: number, y: number][], isLast: boolean) => unknown,
    setDraggingIndex: (index: number) => void,
) {
    const dragingPointIndexRef = useRef<{
        closestLayerIndex: number;
        closestRenderNodeIndex: number;
        closestControlPointIndex: number;
    }>({
        closestLayerIndex: -1,
        closestRenderNodeIndex: -1,
        closestControlPointIndex: -1,
    });

    return useDrag((state) => {
        if (!layersControlPoints || !ref.current) return;
        const [x, y] = state.xy;
        const rect = ref.current?.getBoundingClientRect();
        const polygonX = (x - rect.left);
        const polygonY = (y - rect.top);

        // Find point in region
        if (state.first) {
            let minDistance = Infinity;
            let closestLayerIndex = -1;
            let closestRenderNodeIndex = -1;
            let closestControlPointIndex = -1;
            const snapDistance = 16;
            if (!rect) return;
            layersControlPoints
                .forEach((layerControlPoints, layerIndex) => {
                    layerControlPoints.forEach((points, renderNodeIndex) => {
                        if (!points) return;
                        points.forEach(([px, py], controlPointIndex) => {
                            const dx = px - polygonX;
                            const dy = py - polygonY;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance <= snapDistance && distance < minDistance) {
                                closestLayerIndex = layerIndex;
                                closestRenderNodeIndex = renderNodeIndex;
                                closestControlPointIndex = controlPointIndex;
                                minDistance = distance;
                            }
                        });
                    });
                });
            dragingPointIndexRef.current = {
                closestLayerIndex,
                closestRenderNodeIndex,
                closestControlPointIndex,
            };
            setDraggingIndex(state.last ? -1 : closestRenderNodeIndex);
        } else if (state.last) {
            setDraggingIndex(-1);
        }

        const { closestLayerIndex, closestRenderNodeIndex, closestControlPointIndex } = dragingPointIndexRef.current;
        if (closestLayerIndex < 0 || closestRenderNodeIndex < 0 || closestControlPointIndex < 0) return;

        const layerControlPoints = layersControlPoints[closestLayerIndex];
        if (!layerControlPoints) return;

        const renderNodeControlPoints = layerControlPoints[closestRenderNodeIndex];
        if (!renderNodeControlPoints) return;
        
        const newPoints = [...renderNodeControlPoints]; // Copy
        newPoints[closestControlPointIndex] = [polygonX, polygonY]; // Update copy
        onChangeControlPoints(closestLayerIndex, closestRenderNodeIndex, newPoints, state.last);
    });
}

export const DrawPoints = forwardRef<SVGSVGElement, {
    points: [x: number, y: number][]
    style?: CSSProperties;
}>(({
    points,
    style,
}, ref) => {
    return (
        <svg
            ref={ref}
            style={{
                pointerEvents: "none",
                ...style,
            }}
        >{
                points
                    .map(([x, y], i) => (
                        <g key={`${i}`}>
                            <circle cx={x} cy={y} r={7} stroke="rgba(255,255,255, 1)" strokeWidth="4" fill="transparent" />
                            <circle cx={x} cy={y} r={7} stroke="blue" strokeWidth="1" fill="transparent" />
                        </g>
                    ))
            }</svg>
    );
});
DrawPoints.displayName = "DrawPoints";