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
                position: "absolute",
                pointerEvents: "none",
                ...style,
            }}
        >{
                points
                    .map(([x, y], i) => (
                        <circle key={i} cx={x} cy={y} r={5} stroke="blue" strokeWidth="1" fill="transparent" />
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