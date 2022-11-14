import { useMemo } from "react";
import create from "zustand";
import { useControlPointsActions } from "../controlPoints/store";
import { useEvent } from "../hooks/useEvent";
import { createRenderer } from "../renderers/factory";
import { IRenderer } from "../renderers/IRenderer";
import { ILayerConfig } from "./ILayerConfig";


/*



╔═════════════╧════════════════╗      ╔═════════════════════════════════════╗
║ Layer                        ║      ║ Spread-slideshow                    ║
║                              ║      ║                                     ║
║ 3) set items                 ║      ║ 2) create items                     ║
║                              ║      ║ ┌─────────────────────────────┐     ║    ┌───────────────────────┐        ┌───────────────────────┐
╚══════════════════════════════╝      ║ │ 5) updatePreviewAsync       │ ┐ ──║───→│ renderers             │ ┐ ────→│ DOM elements          │ ┐
                                      ║ └─────────────────────────────┘ │ ┐ ║    └───────────────────────┘ │ ┐    └───────────────────────┘ │ ┐
                                      ║   └─────────────────────────────┘ │ ║      └───────────────────────┘ │      └───────────────────────┘ │
                                      ║     └─────────────────────────────┘ ║        └───────────────────────┘        └───────────────────────┘
                                      ╚═════════════════════════════════════╝


Layers
 - name
 - isExpanded
 - config
    - Renderer
    - Configurator
    - ControlPointsController

┌───────────────────────┐    
│ renderers             │ ┐ ─
└───────────────────────┘ │ ┐
  └───────────────────────┘ │
    └───────────────────────┘
*/

const useLayersConfig = create<{
    layers: ILayerConfig[];
    renderers: IRenderer[];
    setLayers(layers: ILayerConfig[]): void;
    addLayer(layer: ILayerConfig, insertIndex?: number): number;
    deleteLayer(index: number): void;
    updateLayer(index: number, layer: ILayerConfig): void;
    updateConfig(index: number, config: {}): void;
    updateUi(index: number, ui: ILayerConfig["ui"]): void;
}>((set, get) => ({
    layers: [],
    renderers: [],

    setLayers(layers) {
        // Dispose renderers
        get().renderers.forEach(r => r.dispose?.());
        const renderers = layers.map(l => createRenderer(l.type, l.config));
        set({ layers, renderers });
    },

    addLayer(layer, insertIndex) {
        set((state) => {

            if (insertIndex === undefined) insertIndex = state.layers.length;
            const newLayers = state.layers.slice();
            newLayers.splice(insertIndex, 0, layer);

            const renderer = createRenderer(layer.type, layer.config);
            const newRenderers = state.renderers.slice();
            newRenderers.splice(insertIndex, 0, renderer);

            return {
                layers: newLayers,
                renderers: newRenderers,
            };
        });
        return get().layers.length - 1;
    },

    deleteLayer(index: number) {
        set((state) => {
            state.renderers[index]?.dispose?.();
            return {
                layers: state.layers.filter((_, i) => (i !== index)),
                renderers: state.renderers.filter((_, i) => (i !== index)),
            };
        });
    },

    updateLayer(index, layer) {
        set((state) => {
            const newLayers = state.layers.slice();
            newLayers.splice(index, 1, layer);

            const renderer = createRenderer(layer.type, layer.config);
            const newRenderers = state.renderers.slice();
            newRenderers.splice(index, 0, renderer);

            return {
                layers: newLayers,
                renderer: newRenderers,
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
            const newLayers = state.layers.slice();
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


export function useLayers() {
    return useLayersConfig(s => s.layers);
}

export function useLayer(index: number) {
    return useLayersConfig(s => s.layers[index]);
}

export function useLayersActions() {
    const { addControlPoints, replaceControlPoints, deleteControlPoints } = useControlPointsActions();
    const addLayer = useLayersConfig(s => s.addLayer);
    const setLayers = useLayersConfig(s => s.setLayers);
    const deleteLayer = useLayersConfig(s => s.deleteLayer);
    const updateConfig = useLayersConfig(s => s.updateConfig);
    const updateUi = useLayersConfig(s => s.updateUi);

    const add = useEvent((
        layer: ILayerConfig,
        insertIndex?: number,
    ) => {
        addControlPoints((layer.config as any).controlPoints, insertIndex);
        addLayer(layer, insertIndex);
    });

    const replace = useEvent((
        layers: ILayerConfig[],
    ) => {
        replaceControlPoints(layers.map(layer => (layer.config as any).controlPoints));
        setLayers(layers);
    });

    const delete2 = useEvent((
        index: number,
    ) => {
        deleteControlPoints(index);
        deleteLayer(index);
    });

    return useMemo(() => ({
        addLayer: add,
        replaceLayer: replace,
        deleteLayer: delete2,
        updateConfig,
        updateUi,
    }), [add, replace, delete2, updateConfig, updateUi]);
}


export function useConfigs() {
    return useLayersConfig(
        s => s.layers.map(l => l.config),
        (prevConfigs, newConfigs) => (
            prevConfigs.length === newConfigs.length
            && prevConfigs.every((c, i) => c === newConfigs[i])
        )
    );
}


export function useRenderers() {
    const isVisibles = useLayersConfig(
        s => s.layers.map(l => l.ui?.isVisible ?? true),
        (a, b) => a.join() === b.join(),
    );
    return useLayersConfig((s) => s.renderers.filter((_, i) => isVisibles[i]));
}
