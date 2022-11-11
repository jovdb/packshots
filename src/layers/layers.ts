import create from "zustand";
import { ILayerConfig } from "./ILayerConfig";


export const useLayersConfig = create<{
    layers: ILayerConfig[],
    setLayers(layers: ILayerConfig[]): void;
    addLayer(layer: ILayerConfig, insertIndex?: number): number;
    deleteLayer(index: number): void;
    updateLayer(index: number, layer: ILayerConfig): void;
    updateConfig(index: number, config: {}): void;
    updateUi(index: number, ui: ILayerConfig["ui"]): void;
}>((set, get) => ({
    layers: [],/*
        {
            name: "Background",
            type: "image",
            config: {
                imageUrl: "./t-shirt.jpg",
            }
        },
        {
            name: "Spread 1 on a plane",
            type: "plane",
            config: {
                image: {
                    url: "./card.jpg"
                },
            }
        }
    ]  as any,*/
    setLayers(layers) {
        set({ layers });
    },
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
            const oldLayer = newLayers[index];
            const oldConfig = oldLayer?.config || {};
            const newLayer = {
                ...oldLayer,
                config: { ...oldConfig, ...config },
            };
            newLayers.splice(index, 1, newLayer);
            return {
                layers: newLayers,
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