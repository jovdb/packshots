import { useMemo } from "react";
import create from "zustand";
import { useControlPointsActions } from "../controlPoints/store";
import { useEvent } from "../hooks/useEvent";
import { createRenderer } from "../renderers/factory";
import { IRenderer } from "../renderers/IRenderer";
import { MaskRenderer } from "../renderers/MaskRendering";
import { TreeList, TreeNode } from "../Tree";
import { ILayer } from "./ILayer";
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

function createRendererNode(layer: ILayerConfig): TreeNode<IRenderer> {
    const renderer = new TreeNode(createRenderer(layer.type));
    if (!layer.mask) return renderer;
    const maskRenderer = createRenderer("mask");
    return new TreeNode(maskRenderer, [renderer]);
}

const useLayersConfig = create<{
    layers: ILayerConfig[];
    renderers: IRenderer[];
    setLayers(layers: ILayerConfig[]): void;
    addLayer(layer: ILayerConfig, insertIndex?: number): number;
    deleteLayer(index: number): void;
    updateLayer(index: number, layer: ILayerConfig): void;
    updateConfig(index: number, config: {}): void;
    updateUi(index: number, ui: ILayerConfig["ui"]): void;
    renderers2: TreeList<IRenderer>;
}>((set, get) => ({
    layers: [],
    renderers: [],
    renderers2: [],

    setLayers(layers) {
        // Dispose renderers
        get().renderers.forEach(r => r.dispose?.());
        const renderers = layers.map(l => createRenderer(l.type));
        const renderers2 = layers.map(createRendererNode);

        set({ layers, renderers, renderers2 });
    },

    addLayer(layer, insertIndex) {
        set((state) => {

            if (insertIndex === undefined) insertIndex = state.layers.length;
            const newLayers = state.layers.slice();
            newLayers.splice(insertIndex, 0, layer);

            const renderer = createRenderer(layer.type);
            const newRenderers = state.renderers.slice();
            newRenderers.splice(insertIndex, 0, renderer);

            const rendererNode = createRendererNode(layer);
            const newRendererNodes = state.renderers2.slice();
            newRendererNodes.splice(insertIndex, 0, rendererNode);

            return {
                layers: newLayers,
                renderers: newRenderers,
                renderers2: newRendererNodes,
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
                renderers2: state.renderers2.filter((_, i) => (i !== index)),
            };
        });
    },

    updateLayer(index, layer) {
        set((state) => {
            const newLayers = state.layers.slice();
            newLayers.splice(index, 1, layer);

            const renderer = createRenderer(layer.type);
            const newRenderers = state.renderers.slice();
            newRenderers.splice(index, 0, renderer);

            const rendererNode = createRendererNode(layer);
            const newRendererNodes = state.renderers2.slice();
            newRendererNodes.splice(index, 0, rendererNode);

            return {
                layers: newLayers,
                renderer: newRenderers,
                renderers2: newRendererNodes,
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
    const updateLayer = useLayersConfig(s => s.updateLayer);
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
        replaceLayers: replace,
        deleteLayer: delete2,
        updateLayer,
        updateConfig,
        updateUi,
    }), [add, replace, delete2, updateLayer, updateConfig, updateUi]);
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