import { ReactNode } from "react";
import DelLayer from "../icons/del-layer.svg";
import EyeIcon from "../icons/eye.svg";
import MaskIcon from "../icons/mask.svg";
import MoreIcon from "../icons/more.svg";
import { ILayer, IMaskRenderer } from "../src/IPackshot";
import { usePackshotActions } from "../src/stores/packshot";
import { findTreeNode, replaceTreeNode } from "../src/Tree";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";

export function LayerAccordion({
  layer,
  layerIndex,
  children,
}: {
  layer: ILayer;
  layerIndex: number;
  children: ReactNode;
}) {
  const { deleteLayer, updateLayerConfig, updateLayerRenderTree, updateLayerName} = usePackshotActions();
  const maskRenderNode = findTreeNode(layer.renderTree, treeNode => treeNode.type === "mask") as
    | IMaskRenderer
    | undefined;
  const isMaskEnabled = !maskRenderNode?.config.isDisabled;

  return (
    <Accordion
      title={layer.name ?? ""}
      isTitleEditable
      onTitleChange={(newTitle) => {
        updateLayerName(layerIndex, newTitle);
      }}
      isExpanded={!!(layer.config?.isRenderConfigExpanded || layer.config?.isLayerOptionExpanded)}
      onExpandClick={() => {
        updateLayerConfig(layerIndex, {
          isRenderConfigExpanded: !(layer.config?.isRenderConfigExpanded || layer.config?.isLayerOptionExpanded),
          isLayerOptionExpanded: false,
        });
      }}
      left={
        <>
          <AccordionButton
            title="Show/Hide layer"
            isActive={!layer.config?.isDisabled}
            onClick={() => {
              const isDisabled = layer.config?.isDisabled;
              updateLayerConfig(layerIndex, { isDisabled: !isDisabled });
            }}
          >
            <EyeIcon width={16} />
          </AccordionButton>
          {maskRenderNode && (
            <AccordionButton
              title="Enable/Disable Mask"
              isActive={isMaskEnabled}
              onClick={() => {
                if (!maskRenderNode) {
                  return;
                }

                const newRenderTree = replaceTreeNode(layer.renderTree, maskRenderNode, {
                  ...maskRenderNode,
                  config: {
                    ...maskRenderNode.config,
                    isDisabled: !maskRenderNode.config.isDisabled,
                  },
                });
                updateLayerRenderTree(layerIndex, newRenderTree);
              }}
            >
              <MaskIcon width={16} />
            </AccordionButton>
          )}
        </>
      }
      right={
        <>
          <AccordionButton
            title="Layer options..."
            style={{ paddingRight: 10 }}
            onClick={() => {
              updateLayerConfig(layerIndex, {
                isLayerOptionExpanded: !layer.config?.isLayerOptionExpanded,
              });
            }}
          >
            <MoreIcon width={16} height={20} />
          </AccordionButton>
          <AccordionButton
            title="Remove layer"
            style={{ paddingRight: 10 }}
            onClick={() => {
              const shouldRemove = confirm("Are you sure you want to remove this layer?");
              if (shouldRemove) {
                deleteLayer(layerIndex);
              }
            }}
          >
            <DelLayer width={20} />
          </AccordionButton>
        </>
      }
    >
      <AccordionPanel>
        {children}
      </AccordionPanel>
    </Accordion>
  );
}
