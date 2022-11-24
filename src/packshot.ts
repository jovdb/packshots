import create from "zustand";
import { ILayerConfig, IPackshot, IPackshotConfig, IRenderer, Renderers } from "./IPackshot";

const usePackshotStore = create<IPackshot & {
    actions: {
        setPackshot(packshot: IPackshot): void;
        updatePackshotName(name: string): void;
        updatePackshotConfig(config: IPackshotConfig): void;
        deleteLayer(index: number): void;
        updateLayerConfig(index: number, config: Partial<ILayerConfig>): void;
        updateLayerRenderer(index: number, renderer: IRenderer): void;
    },
}>((set) => ({
    config: {
        width: 1000,
        height: 1000,
    },
    layers: [],
    actions: {
        setPackshot(packshot) {
            set({ ...packshot });
        },
        updatePackshotName(name) {
            set({ name });
        },
        updatePackshotConfig(config) {
            set({ config });
        },
        deleteLayer(index) {
            set((state) => ({
                layers: state.layers.filter((_, i) => (i !== index)),
            }));
        },
        updateLayerConfig(index, config) {
            set((state) => {
                const oldLayer = state.layers[index];
                const oldConfig = oldLayer?.config || {};
                const newLayer = {
                    ...oldLayer,
                    config: { ...oldConfig, ...config },
                };
                const newLayers = state.layers.slice();
                newLayers.splice(index, 1, newLayer);
    
                return {
                    layers: newLayers,
                };
            });
        },
        updateLayerRenderer(index, renderer: Renderers) {
            set((state) => {
                const oldLayer = state.layers[index];
                const newLayer = {
                    ...oldLayer,
                    renderer,
                };
                const newLayers = state.layers.slice();
                newLayers.splice(index, 1, newLayer);
    
                return {
                    layers: newLayers,
                };
            });
        },
    },
}));

export function usePackshotActions() {
    return usePackshotStore(s => s.actions);
}

export function usePackshotName() {
    return [
        usePackshotStore(s => s.name ?? ""),
        usePackshotStore(s => s.actions.updatePackshotName),
    ] as const;
}

export function usePackshotConfig() {
    return [
        usePackshotStore(s => s.config),
        usePackshotStore(s => s.actions.updatePackshotConfig)
    ] as const;
}

export function usePackshotLayers() {
    return usePackshotStore(s => s.layers);
}