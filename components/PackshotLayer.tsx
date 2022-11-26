import { usePackshotActions } from "../src/packshot";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { ConfigComponent, getConfigComponent } from "./config/factory";
import { ILayer, IMaskRenderer, IPackshot } from "../src/IPackshot";
import EyeIcon from "../icons/eye.svg";
import DelLayer from "../icons/del-layer.svg";
import MaskIcon from "../icons/mask.svg";

import { findTreeNode, flattenTree, replaceTreeNode, walkTree } from "../src/Tree";
import { createElement } from "react";
import { IMaskRenderingConfig } from "./config/MaskRendererConfig";

export function PackshotLayerAccordion({
    layer,
    layerIndex,
    children,
}: {
    layer: ILayer;
    layerIndex: number;
    children: any;
}) {
    const { deleteLayer, updateLayerConfig, updateLayerRenderTree } = usePackshotActions();
    const maskRenderNode = findTreeNode(layer.renderTree, treeNode => treeNode.type === "mask") as IMaskRenderer | undefined;
    const isMaskEnabled = !maskRenderNode?.config.isDisabled;

    return (
        <Accordion
            title={layer.name ?? ""}
            isExpanded={!!layer.config?.isExpanded}
            setIsExpanded={(value) => {
                updateLayerConfig(layerIndex, { isExpanded: value });
            }}
            left={<>
                <AccordionButton
                    title="Show/Hide layer"
                    isActive={!layer.config?.isDisabled}
                    onClick={() => {
                        const isDisabled = layer.config?.isDisabled;
                        updateLayerConfig(layerIndex, { isDisabled: !isDisabled });
                    }}>
                    <EyeIcon width={16} />
                </AccordionButton>
                {maskRenderNode && (
                    <AccordionButton
                        title="Enable/Disable Mask"
                        isActive={isMaskEnabled}
                        onClick={() => {
                            if (!maskRenderNode) return;

                            const newRenderTree = replaceTreeNode(layer.renderTree, maskRenderNode, {
                                ...maskRenderNode,
                                config: {
                                    ...maskRenderNode.config,
                                    isDisabled: !maskRenderNode.config.isDisabled,
                                },
                            })
                            updateLayerRenderTree(layerIndex, newRenderTree);
                        }}>
                        <MaskIcon width={16} />
                    </AccordionButton>
                )}
            </>}
            right={<>
                <AccordionButton
                    title="Remove layer"
                    style={{ paddingRight: 10 }}
                    onClick={() => {
                        const shouldRemove = confirm("Are you sure you want to remove this layer?");
                        if (shouldRemove) deleteLayer(layerIndex);
                    }}
                >
                    <DelLayer width={20} />
                </AccordionButton>
            </>}
        >
            <AccordionPanel>
                {children}
            </AccordionPanel>
        </Accordion>
    );
}


export function PackshotLayerConfig({
    layer,
    layerIndex,
}: {
    layer: ILayer;
    layerIndex: number;
}) {
    const { updateLayerRenderTree } = usePackshotActions();

    const renderers = flattenTree(layer.renderTree);

    const RendererConfigComponents = renderers
        .map(r => getConfigComponent(r.type))
        .filter(c => !!c) as ConfigComponent<any>[]; // Remove empty onces

    return (
        <>
            {RendererConfigComponents.map((ConfigComponent, rendererIndex) => (
                <ConfigComponent
                    key={rendererIndex}
                    config={renderers[rendererIndex].config}
                    onChange={(newConfig) => {
                        const prevRendererNode = renderers[rendererIndex]; // Item to replace
                        const newRendererNode = {
                            ...prevRendererNode,
                            config: newConfig,
                        };

                        const newRenderTree = replaceTreeNode(layer.renderTree, prevRendererNode, newRendererNode);
                        updateLayerRenderTree(layerIndex, newRenderTree);
                    }}
                />
            ))}
        </>
    );
}

export function PackshotLayer({
    layer,
    layerIndex
}: {
    layer: ILayer,
    layerIndex: number,
}) {
    return (
        <PackshotLayerAccordion layer={layer} layerIndex={layerIndex}>
            <PackshotLayerConfig layer={layer} layerIndex={layerIndex} />
        </PackshotLayerAccordion>
    );
}