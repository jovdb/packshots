import { useCallback, useMemo } from "react";
import create from "zustand";
import { createControlPoints } from "../controlPoints/factory";
import { ControlPoint, IControlPoints, IControlPointsConfig } from "../controlPoints/IControlPoints";
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
            const newLayers = state.layers.slice();
            newLayers.splice(insertIndex, 0, layer);

            // Control points need to update for new config?
            const controlPoints = createControlPoints(layer.type);
            const newControlPoints = state.controlPoints.slice();
            newControlPoints.splice(insertIndex, 0, controlPoints);

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
            const newLayers = state.layers.slice();
            newLayers.splice(index, 1, layer);

            // Control points need to update for new config
            const controlPoints = createControlPoints(layer.type);
            const newControlPoints = state.controlPoints.slice();
            newControlPoints.splice(index, 1, controlPoints);

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
