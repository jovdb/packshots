import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import create from "zustand";
import shallow from "zustand/shallow";
import { IControlPointsConfig } from "./controlPoints/IControlPoints";
import { ILayer, ILayerConfig, IPackshot, IPackshotConfig, IRenderTree } from "./IPackshot";
import { createRenderer } from "./renderers/factory";
import { flattenTree, replaceTreeNode, walkTree } from "./Tree";

export const usePackshotStore = create<
  IPackshot & {
    actions: {
      setPackshot(packshot: IPackshot): void;
      updatePackshotName(name: string): void;
      updatePackshotConfig(config: IPackshotConfig): void;
      addLayer(layer: ILayer, layerIndex?: number): void;
      deleteLayer(layerIndex: number): void;
      updateLayerConfig(layerIndex: number, config: Partial<ILayerConfig>): void;
      updateLayerRenderTree(layerIndex: number, renderTree: IRenderTree): void;
      updateLayerRenderNodeConfig(layerIndex: number, renderNode: IRenderTree, config: {}): void;
    };
  }
>((set) => ({
  config: {
    width: 1000,
    height: 1000,
  },
  layers: [],
  actions: {
    setPackshot(packshot) {
      set((state) => {
        // Dispose previous renderers
        state.layers.forEach(layer => {
          walkTree(layer.renderTree, renderNode => renderNode.renderer?.dispose?.());
        });
        // Create new renderers
        packshot?.layers?.forEach(layer => {
          walkTree(layer.renderTree, renderNode => {
            renderNode.renderer = createRenderer(renderNode.type);
          });
        });

        return { ...packshot };
      });
    },

    updatePackshotName(name) {
      set({ name });
    },

    updatePackshotConfig(config) {
      set({ config });
    },

    addLayer(layer, insertIndex?: number) {
      set((state) => {
        const newLayers = state.layers.slice();
        if (insertIndex === undefined) insertIndex = state.layers.length;
        newLayers.splice(insertIndex, 1, layer);
        return {
          layers: newLayers,
        };
      });
    },

    deleteLayer(layerIndex) {
      set((state) => ({
        layers: state.layers.filter((layer, i) => {
          if (i !== layerIndex) {
            return true;
          } else {
            // Dispose renderers before removing layer
            walkTree(layer.renderTree, renderNode => renderNode.renderer?.dispose?.());
            return false;
          }
        }),
      }));
    },

    updateLayerConfig(layerIndex, config) {
      set((state) => {
        const oldLayer = state.layers[layerIndex];
        const oldConfig = oldLayer?.config || {};
        const newLayer = {
          ...oldLayer,
          config: { ...oldConfig, ...config },
        };
        const newLayers = state.layers.slice();
        newLayers.splice(layerIndex, 1, newLayer);

        return {
          layers: newLayers,
        };
      });
    },

    updateLayerRenderTree(layerIndex, renderTree) {
      set((state) => {
        const oldLayer = state.layers[layerIndex];
        const newLayer: ILayer = {
          ...oldLayer,
          renderTree,
        };
        const newLayers = state.layers.slice();
        newLayers.splice(layerIndex, 1, newLayer);

        // Update renderers
        walkTree(oldLayer.renderTree, renderNode => renderNode.renderer?.dispose?.());
        walkTree(newLayer.renderTree, renderNode => {
          renderNode.renderer = createRenderer(renderNode.type);
        });

        return {
          layers: newLayers,
        };
      });
    },

    updateLayerRenderNodeConfig(layerIndex, renderNode, config): void {
      set((state) => {
        const oldLayer = state.layers[layerIndex];

        const newRenderNode: IRenderTree = {
          ...renderNode,
          config,
        };
        const newRenderTree = replaceTreeNode(oldLayer.renderTree, renderNode, newRenderNode);
        const newLayer: ILayer = {
          ...oldLayer,
          renderTree: newRenderTree,
        };
        const newLayers = state.layers.slice();
        newLayers.splice(layerIndex, 1, newLayer);

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
    usePackshotStore(s => s.actions.updatePackshotConfig),
  ] as const;
}

export function useLayers() {
  return usePackshotStore(s => s.layers);
}

/**
 * Create renderers that follow the packshot configuration
 * Returns a flatt array
 */
export function useRenderers() {
  /** A string that updates a rerender when a renderer type changes */
  const renderTypes = usePackshotStore(
    s => JSON.stringify(s.layers.map(l => flattenTree(l.renderTree).map(r => r.type))),
    shallow,
  );

  // 'var' used because it is hoisted (so available inside memo)
  // otherwise we need a useEffect with a useRef
  // eslint-disable-next-line no-var
  var layersRenderers = useMemo(
    () => {
      // Dispose previous renderers
      layersRenderers?.forEach(layerRenderers => {
        layerRenderers.forEach(renderer => renderer.dispose?.());
      });

      // Create new renderers
      return usePackshotStore.getState().layers.map((layer) => (
        flattenTree(layer.renderTree).map(rendererInfo => createRenderer(rendererInfo.type))
      ));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [renderTypes],
  );

  return layersRenderers;
}

export function useLoadedRenderers() {
  const layersRenderers = useRenderers();

  // Detect some config changes
  // TODO: can we quickly detect which config is changed and only load that renderer?
  const configs = usePackshotStore(
    s => s.layers.map(l => JSON.stringify(flattenTree(l.renderTree).map(r => r.config))),
    shallow,
  );

  function loadRenderers() {
    return Promise.all(
      layersRenderers.flatMap((layerRenderers, layerIndex) => (
        layerRenderers.map((renderer, rendererIndex) => {
          // TODO: find a better way, I think because react async behavior, this can become incorrect
          const { config } = flattenTree(usePackshotStore.getState().layers[layerIndex].renderTree)[rendererIndex];
          renderer.loadAsync?.(config);
        })
      )),
    );
  }

  const { isFetching } = useQuery([configs], loadRenderers);

  return {
    layersRenderers,
    isFetching,
  };
}

/**
 * Returns the renderTree
 * Updates if something in the tree changes, (a renderer config, name, ...)
 */
export function useRenderTrees(onlyDisabled = false) {
  // Layers, but only triggers rerender if renderTree changes
  const layers = usePackshotStore(
    s => s.layers,
    (layerA, layerB) => {
      const renderTreeA = layerA.map(a => a.renderTree);
      const renderTreeB = layerB.map(b => b.renderTree);

      const disabledA = layerA.map(a => a.config?.isDisabled);
      const disabledB = layerB.map(a => a.config?.isDisabled);
      return (
        shallow(renderTreeA, renderTreeB) // we can do a shallow compare because renderTree is replaced on update (immutable)
        && shallow(disabledA, disabledB)
      );
    },
  );

  // Return the same array when no renderTree changes
  return useMemo(
    () =>
      layers
        .filter(l => !onlyDisabled || !l.config?.isDisabled)
        .map(l => l.renderTree),
    [layers, onlyDisabled],
  );
}

export function useLayersConfig() {
  return usePackshotStore(
    s => s.layers.map(l => l.config || {}),
    shallow,
  );
}

export function useAllControlPoints() {
  const renderTrees = useRenderTrees();

  // TODO: Optimize for less rerenders
  return renderTrees.map((layerRenderTree) => (
    flattenTree(layerRenderTree)
      .map(renderNode => (renderNode.config as IControlPointsConfig).controlPoints)
  ));
}
