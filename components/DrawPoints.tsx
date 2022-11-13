import { useDrag } from '@use-gesture/react'
import { CSSProperties, forwardRef, Ref, useRef } from 'react';

/** Handle multiple Polygons whith 1 drag handler */
export function usePointsSets(
    ref: React.RefObject<HTMLDivElement>,
    layersPoints: ([number, number][] | undefined)[] | undefined,
    setPoints: (index: number, value: [x: number, y: number][]) => unknown,
    setDraggingLayer: (value: number) => void,
) {
    const dragingPointIndexRef = useRef<{
        layerIndex: number;
        pointIndex: number;
    }>({
        layerIndex: -1,
        pointIndex: -1,
    });
    return useDrag((state) => {
        if (!layersPoints || !ref.current) return;
        const [x, y] = state.xy;
        const rect = ref.current?.getBoundingClientRect();
        const polygonX = (x - rect.left);
        const polygonY = (y - rect.top);

        // Find point in region
        if (state.first) {
            let minDistance = Infinity;
            let minLayerIndex = -1;
            let minPointIndex = -1;
            const snapDistance = 16;
            if (!rect) return;
            layersPoints
                .forEach((layerPoints, layerIndex) => {
                    if (!layerPoints) return;
                    layerPoints.forEach(([px, py], pointIndex) => {
                        const dx = px - polygonX;
                        const dy = py - polygonY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= snapDistance && distance < minDistance) {
                            minLayerIndex = layerIndex;
                            minPointIndex = pointIndex;
                            minDistance = distance;
                        }
                    });
                });
            dragingPointIndexRef.current = {
                layerIndex: minLayerIndex,
                pointIndex: minPointIndex,
            };

            setDraggingLayer(minLayerIndex);
        } else if (state.last) {
            setDraggingLayer(-1);
        }

        const { layerIndex, pointIndex } = dragingPointIndexRef.current;
        if (layerIndex < 0 || pointIndex < 0) return;
        const points = layersPoints[layerIndex];
        if (!points) return;
        const newPoints = [...points]; // Copy
        newPoints[pointIndex] = [polygonX, polygonY]; // Update copy
        setPoints(layerIndex, newPoints);
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


export const DrawPointsSets = forwardRef<HTMLDivElement, {
    layerPoints: ([x: number, y: number][] | undefined)[];
    style?: CSSProperties;
}>(({
    layerPoints,
    style,
}, ref) => {
    return (
        <div
            ref={ref}
            style={{
                position: "absolute",
                pointerEvents: "none",
                ...style,
            }}
        >
            {
                layerPoints.map((points, i) => (
                    points && <DrawPoints key={i} points={points} style={{ position: "absolute", width: "100%", height: "100%" }} />
                ))
            }
        </div>
    );
});
DrawPointsSets.displayName = "DrawPointsSets";