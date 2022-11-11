import { useMemo } from "react";
import create from "zustand";
import { createControlPoints } from "../controlPoints/factory";
import { IControlPoints } from "../controlPoints/IControlPoints";
import { ILayerConfig } from "./ILayerConfig";


export const useLayersConfig = create<{
    layers: ILayerConfig[];
    controlPoints: (IControlPoints | undefined)[];
    setLayers(layers: ILayerConfig[]): void;
    addLayer(layer: ILayerConfig, insertIndex?: number): number;
    deleteLayer(index: number): void;
    updateLayer(index: number, layer: ILayerConfig): void;
    updateConfig(index: number, config: {}): void;
    updateUi(index: number, ui: ILayerConfig["ui"]): void;
}>((set, get) => ({
    layers: [],
    controlPoints: [],
    setLayers(layers) {
        const controlPoints = layers.map(l => createControlPoints(l.type));
        set({ layers, controlPoints });
    },
    addLayer(layer, insertIndex) {
        set((state) => {

            if (insertIndex === undefined) insertIndex = state.layers.length;
            const newLayers = state.layers.slice().splice(insertIndex, 0, layer);

            // Control points need to update for new config?
            const controlPoints = createControlPoints(layer.type);
            const newControlPoints = state.controlPoints.slice().splice(insertIndex, 0, controlPoints);

            return {
                layers: newLayers,
                controlPoints: newControlPoints,
            };
        });
        return get().layers.length - 1;
    },
    deleteLayer(index: number) {
        set((state) => ({
            layers: state.layers.filter((_, i) => (i !== index)),
            controlPoints: state.controlPoints.filter((_, i) => (i !== index)),
        }));
    },
    updateLayer(index, layer) {
        set((state) => {
            const newLayers = state.layers.slice().splice(index, 1, layer);

            // Control points need to update for new config
            const controlPoints = createControlPoints(layer.type);
            const newControlPoints = state.controlPoints.slice().splice(index, 1, controlPoints);

            return {
                layers: newLayers,
                controlPoints: newControlPoints,
            };
        });
    },
    updateConfig(index, config) {
        set((state) => {
            const oldLayer = state.layers[index];
            const oldConfig = oldLayer?.config || {};
            const newLayer = {
                ...oldLayer,
                config: { ...oldConfig, ...config },
            };
            const newLayers = state.layers.slice().splice(index, 1, newLayer);

            // Control points need to update for new config?
            const controlPoints = createControlPoints(oldLayer.type);
            const newControlPoints = state.controlPoints.slice().splice(index, 1, controlPoints);

            return {
                layers: newLayers,
                controlPoints: newControlPoints,
            };
        });
    },
    updateUi(index, ui) {
        set((state) => {
            const newLayers = state.layers.slice();
            const oldLayer = newLayers[index];
            const oldUi = oldLayer?.ui || {};
            const newLayer = {
                ...oldLayer,
                ui: { ...oldUi, ...ui },
            };
            newLayers.splice(index, 1, newLayer);
            return {
                layers: newLayers,
            };
        });
    },
}));

export function useLayer(index: number) {
    return useLayersConfig(s => s.layers[index]);
}

export function useControlPoints() {
    return useLayersConfig(s => s.controlPoints) || [];
}