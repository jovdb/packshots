import create from "zustand";
import type { ControlPoint } from "./IControlPoints";

export interface IControlPointsStore {
  controlPoints: (ControlPoint[] | undefined)[];
  draggingIndex: number;

  actions: {
    setDraggingControlPointsIndex(draggingIndex: number): void;
    addControlPoints(controlPoints: ControlPoint[] | undefined, insertIndex?: number): number;
    deleteControlPoints(index: number): void;
    updateControlPoints(index: number, controlPoints: ControlPoint[] | undefined): void;
    replaceControlPoints(controlPoints: (ControlPoint[] | undefined)[]): void;
  }
}

const useControlPointsStore = create<IControlPointsStore>((set) => ({
  controlPoints: [],
  draggingIndex: -1,

  actions: {
    setDraggingControlPointsIndex(draggingIndex) {
      set({
        draggingIndex,
      });
    },

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
      return insertIndex || -1;
    },

    deleteControlPoints(index) {
      set((state) => ({
        controlPoints: state.controlPoints.filter((_, i) => (i !== index)),
      }));
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
  }
}));

export function useAllControlPoints() {
  return useControlPointsStore(s => s.controlPoints);
}

export function useDraggingControlPointsIndex() {
  return useControlPointsStore(s => s.draggingIndex);
}

export function useControlPoints(index: number) {
  return useControlPointsStore(s => s.controlPoints[index]);
}

export function useControlPointsActions() {
  return useControlPointsStore(state => state.actions);
}
