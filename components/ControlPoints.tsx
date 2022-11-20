import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { useAllControlPoints, useControlPointsActions } from "../src/controlPoints/store";
import { useElementSize } from "../src/hooks/useElementSize";
import { DrawPoints, usePointsSets } from "./DrawPoints";

export function ControlPoints({
    style,
}: {
    style?: CSSProperties;
}) {

    const divRef = useRef<HTMLDivElement>(null);
    const allControlPoints = useAllControlPoints();
    const { updateControlPoints, setDraggingControlPointsIndex } = useControlPointsActions();
    const elementRect = useElementSize(divRef);

    // Convert controlPoints to screen coordinates
    const controlPointsInScreenCoordinates = useMemo(
        () => {
                return allControlPoints
                .map(controlPoints => (
                    controlPoints?.map(([x, y]) => ([
                        (x + 1) / 2 * elementRect.width,
                        (y + 1) / 2 * elementRect.height,
                    ]) as [number, number])
                ))
        },
        [allControlPoints, elementRect.height, elementRect.width],
    );

    const controlPointsDraggingHandles = usePointsSets(
        divRef,
        controlPointsInScreenCoordinates,
        (layerIndex, newPointsInScreenCoordinates, isLast) => {
            const newPointsInTargetCoordinates = newPointsInScreenCoordinates
                .map(([x, y]) => [
                    x / elementRect.width * 2 - 1,
                    y / elementRect.height * 2 - 1,
                ] as [x: number, y: number])

            updateControlPoints(layerIndex, newPointsInTargetCoordinates);
        },
        setDraggingControlPointsIndex,
    );

    return (
        <div
            ref={divRef}
            style={{
                ...style
            }}
            {...controlPointsDraggingHandles()}
        >
            {
                controlPointsInScreenCoordinates.map((controlPoints, i) => (
                    controlPoints && <DrawPoints
                        key={i}
                        points={controlPoints}
                        style={{ position: "absolute", width: "100%", height: "100%" }}
                    />
                ))
            }
        </div>
    );
}