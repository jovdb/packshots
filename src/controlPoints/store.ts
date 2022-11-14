import create from "zustand";
import type { ControlPoint } from "./IControlPoints";

export interface IControlPointsStore {
    controlPoints: (ControlPoint[] | undefined)[];

    addControlPoints(controlPoints: ControlPoint[] | undefined, insertIndex?: number): number;
    deleteControlPoints(index: number): void;
    updateControlPoints(index: number, controlPoints: ControlPoint[] | undefined): void;
    replaceControlPoints(controlPoints: (ControlPoint[] | undefined)[]): void;
}

const useControlPointsStore = create<IControlPointsStore>((set) => ({
    controlPoints: [],

    addControlPoints(controlPoints, insertIndex) {
        set((state) => {
            if (insertIndex === undefined) insertIndex = state.controlPoints.length;

            // Values
            const newControlPoints = state.controlPoints.slice();
            newControlPoints.splice(insertIndex, 0, controlPoints);

            return {
                controlPoints: newControlPoints,
            };
        });
        return insertIndex!;
    },

    deleteControlPoints(index) {
        set((state) => {
            return {
                controlPoints: state.controlPoints.filter((_, i) => (i !== index)),
            };
        });
    },

    updateControlPoints(index, controlPoints) {
        set((state) => {

            // Control points need to update for new config
            const newControlPoints = state.controlPoints.slice();
            newControlPoints.splice(index, 1, controlPoints);

            return {
                controlPoints: newControlPoints,
            };
        });
    },

    replaceControlPoints(controlPoints) {
        set({
            controlPoints: controlPoints,
        });
    },
}));

export function useAllControlPoints() {
    return useControlPointsStore(s => s.controlPoints);
}

export function useControlPoints(index: number) {
    return useControlPointsStore(s => s.controlPoints[index]);
}

// TODO, only return functions
export type Functions<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never }

export function useControlPointsActions(): Functions<IControlPointsStore> {
    return useControlPointsStore((s: any) => s, () => true) as any;
}
