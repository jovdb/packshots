import { useDrag } from '@use-gesture/react'
import { CSSProperties, forwardRef, Ref, useRef } from 'react';

export function useDrawPolygon(
    ref: React.RefObject<typeof DrawPolygon>,
    points: [x: number, y: number][],
    setPoints: (value: [x: number, y: number][]) => unknown,
) {
    const dragingPointIndexRef = useRef(-1);
    return useDrag((state) => {
        const [x, y] = state.xy;
        const rect = ref.current?.getBoundingClientRect();
        const polygonX = (x - rect.left);
        const polygonY = (y - rect.top);

        // Find point in region
        if (state.first) {
            let min = Infinity;
            let indexMin = -1;
            const snapDistance = 16;
            if (!rect) return;
            points
                .forEach(([px, py], i) => {
                    const dx = px - polygonX;
                    const dy = py - polygonY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= snapDistance && distance < min) {
                        min = distance;
                        indexMin = i;
                    }
                });
            dragingPointIndexRef.current = indexMin;
        }

        const indexMin = dragingPointIndexRef.current;
        const newPoints = [...points];
        newPoints[indexMin] = [polygonX, polygonY];
        setPoints(newPoints);
    });
}

/** Handle multiple Polygons whith 1 drag handler */
export function useDrawPolygons(
    ref: React.RefObject<typeof DrawPolygon>,
    layersPoints: ([number, number][] | undefined)[] | undefined,
    setLayersPoints: (index: number, value: [x: number, y: number][]) => unknown,
) {
    const dragingPointIndexRef = useRef<{
        layerIndex: number;
        pointIndex: number;
    }>({
        layerIndex: -1,
        pointIndex: -1,
    });
    return useDrag((state) => {
        if (!layersPoints) return;
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
        }

        const { layerIndex, pointIndex } = dragingPointIndexRef.current;
        if (layerIndex < 0 || pointIndex < 0) return;
        const points = layersPoints[layerIndex];
        if (!points) return;
        const newPoints = [...points]; // Copy
        newPoints[pointIndex] = [polygonX, polygonY]; // Update copy
        setLayersPoints(layerIndex, newPoints);
    });
}

export const DrawPolygon = forwardRef(({
    points,
    style,
}: {
    points: [x: number, y: number][]
    style?: CSSProperties;
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
                            <circle cx={x} cy={y} r={5} stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="transparent" />
                            <circle cx={x} cy={y} r={5} stroke="blue" strokeWidth="1" fill="transparent" />
                        </g>
                    ))
            }{
                points
                    .map(([x2, y2], i) => {
                        const [x1, y1] = (i !== 0)
                            ? points[i - 1]
                            : points[points.length - 1];
                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,255, 0.5)" strokeWidth={1} />
                    })
            }</svg>
    );
});
DrawPolygon.displayName = "DrawPolygon";


export const DrawPolygons = forwardRef(({
    layerPoints,
    style,
}: {
    layerPoints: ([x: number, y: number][] | undefined)[];
    style?: CSSProperties;
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
                    points && <DrawPolygon key={i} points={points} style={{ position: "absolute", width: "100%", height: "100%" }} />
                ))
            }
        </div>
    );
});
DrawPolygons.displayName = "DrawPolygons";