import create from "zustand";
import { ILayerState } from "./Layer";


export const useLayersConfig = create<{
    layers: ILayerState[],
    addLayer(layer: ILayerState, insertIndex?: number): number;
    deleteLayer(index: number): void;
    updateLayer(index: number, layer: ILayerState): void;
    updateConfig(index: number, config: {}): void;
}>((set, get) => ({
    layers: []  as any,
    addLayer(layer, insertIndex) {
        set((state) => {
            const newLayers = state.layers.slice();
            if (insertIndex === undefined) insertIndex = newLayers.length;
            newLayers.splice(insertIndex, 0, layer);
            return {
                layers: newLayers,
            };
        });
        return get().layers.length - 1;
    },
    deleteLayer(index: number) {
        set((state) => ({
            layers: state.layers.filter((_, i) => (i !== index)),
        }));
    },
    updateLayer(index, layer) {
        set((state) => {
            const newLayers = state.layers.slice();
            newLayers.splice(index, 1, layer);
            return {
                layers: newLayers,
            };
        });
    },
    updateConfig(index, config) {
        set((state) => {
            const newLayers = state.layers.slice();
            const newLayer = {
                ...newLayers[index],
                config,
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