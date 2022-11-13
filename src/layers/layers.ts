import { useCallback, useMemo } from "react";
import create from "zustand";
import { createControlPoints } from "../controlPoints/factory";
import { ControlPoint, IControlPoints, IControlPointsConfig } from "../controlPoints/IControlPoints";
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

export const useLayersConfig = create<{
    layers: ILayerConfig[];
    controlPoints: (IControlPoints | undefined)[];
    renderers: IRenderer[];
    setLayers(layers: ILayerConfig[]): void;
    addLayer(layer: ILayerConfig, insertIndex?: number): number;
    deleteLayer(index: number): void;
    updateLayer(index: number, layer: ILayerConfig): void;
    updateConfig(index: number, config: {}): void;
    updateUi(index: number, ui: ILayerConfig["ui"]): void;
}>((set, get) => ({
    layers: [],
    controlPoints: [],
    renderers: [],

    setLayers(layers) {
        // Dispose renderers
        get().renderers.forEach(r => r.dispose?.());

        const controlPoints = layers.map(l => createControlPoints(l.type));
        const renderers = layers.map(l => createRenderer(l.type, l.config, {}));
        set({ layers, controlPoints, renderers });
    },

    addLayer(layer, insertIndex) {
        set((state) => {

            if (insertIndex === undefined) insertIndex = state.layers.length;
            const newLayers = state.layers.slice();
            newLayers.splice(insertIndex, 0, layer);

            // Control points need to update for new config?
            const controlPoints = createControlPoints(layer.type);
            const newControlPoints = state.controlPoints.slice();
            newControlPoints.splice(insertIndex, 0, controlPoints);

            const renderer = createRenderer(layer.type, l.config, {});
            const newRenderers = state.renderers.slice();
            newRenderers.splice(insertIndex, 0, renderer);

            return {
                layers: newLayers,
                controlPoints: newControlPoints,
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
                controlPoints: state.controlPoints.filter((_, i) => (i !== index)),
                renderers: state.renderers.filter((_, i) => (i !== index)),
            };
        });
    },

    updateLayer(index, layer) {
        set((state) => {
            const newLayers = state.layers.slice();
            newLayers.splice(index, 1, layer);

            // Control points need to update for new config
            const controlPoints = createControlPoints(layer.type);
            const newControlPoints = state.controlPoints.slice();
            newControlPoints.splice(index, 1, controlPoints);

            const renderer = createRenderer(layer.type, l.config, {});
            const newRenderers = state.renderers.slice();
            newRenderers.splice(index, 0, renderer);

            return {
                layers: newLayers,
                controlPoints: newControlPoints,
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

            // Control points need to update for new config?
            const controlPoints = createControlPoints(oldLayer.type);
            const newControlPoints = state.controlPoints.slice();
            newControlPoints.splice(index, 1, controlPoints);

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

export function useConfigs() {
    return useLayersConfig(
        s => s.layers.map(l => l.config),
        (prevConfigs, newConfigs) => (
            prevConfigs.length === newConfigs.length
            && prevConfigs.every((c, i) => c === newConfigs[i])
        )
    );
}


export function useControlPointsControllers() {
    return useLayersConfig(s => s.controlPoints);
}

export function useControlPoints() {
    const configs = useConfigs();
    const controlPoints = configs.map(config => (config as IControlPointsConfig)?.controlPoints);

    const updateConfig = useLayersConfig(s => s.updateConfig);

    const setControlPoints = useCallback(
        (layerIndex: number, controlPoints: ControlPoint[]) => updateConfig(layerIndex, { controlPoints }),
        [updateConfig],
    );

    return [
        controlPoints,
        setControlPoints,
    ] as const;
}

export function useRenderers() {
    const isVisibles = useLayersConfig(
        s => s.layers.map(l => l.ui?.isVisible ?? true),
        (a, b) => a.join() === b.join(),
    );
    return useLayersConfig((s) => s.renderers.filter((_, i) => isVisibles[i]));
}
