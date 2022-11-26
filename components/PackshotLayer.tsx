import { usePackshotActions } from "../src/packshot";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { ConfigComponent, getConfigComponent } from "./config/factory";
import { ILayer, ILayerConfig, IMaskRenderer, IPackshot, IPackshotConfig } from "../src/IPackshot";
import EyeIcon from "../icons/eye.svg";
import DelLayer from "../icons/del-layer.svg";
import MaskIcon from "../icons/mask.svg";
import MoreIcon from "../icons/more.svg";

import { findTreeNode, flattenTree, replaceTreeNode, walkTree } from "../src/Tree";

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
            isExpanded={!!(layer.config?.isRenderConfigExpanded || layer.config?.isLayerOptionExpanded)}
            onTitleClick={() => {
                updateLayerConfig(layerIndex, { isRenderConfigExpanded: !layer.config?.isRenderConfigExpanded });
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

export function PackshotLayerRenderTreeConfig({
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


export function PackshotLayerConfig({
    config,
    onChange
}: {
    config: ILayerConfig,
    onChange: (newConfig: ILayerConfig) => void,
}) {
    let composition: GlobalCompositeOperation | "disabled" | "normal";
    if (config.isDisabled) composition = "disabled";
    else if (!config.composition) composition = "normal";
    else composition = config.composition;

    return (
        <table style={{
            backgroundColor: "#ccc",
            boxShadow: "0 5px 8px rgba(0, 0, 0, 0.2) inset",
            borderBottom: "1px solid #666",
            marginBottom: 5,
            padding: 5,

            /** HACK */
            width: "calc(100% + 10px)",
            margin: -5,
        }}>
            <tbody>
                <tr>
                    <td>Composition:</td>
                    <td>
                        <select
                            value={composition}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "disable") {
                                    onChange({
                                        ...config,
                                        isDisabled: true,
                                    });
                                } else if (value === "normal") {
                                    onChange({
                                        ...config,
                                        isDisabled: false,
                                        composition: undefined,
                                    });
                                } else {
                                    onChange({
                                        ...config,
                                        isDisabled: false,
                                        composition: value as GlobalCompositeOperation,
                                    });
                                }
                            }}
                            style={{ minWidth: 150 }}
                        >
                            <option value="disable">Disable</option>
                            <option value="normal">Normal</option>
                            <option value="multiply">Multiply</option>
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

export function PackshotLayer({
    layer,
    layerIndex
}: {
    layer: ILayer,
    layerIndex: number,
}) {

    const { updateLayerConfig } = usePackshotActions();

    return (
        <PackshotLayerAccordion
            layer={layer}
            layerIndex={layerIndex}
        >
            {layer.config?.isLayerOptionExpanded && (
                <PackshotLayerConfig
                    config={layer.config || {}}
                    onChange={(newConfig) => updateLayerConfig(layerIndex, newConfig)}
                />
            )}
            {layer.config?.isRenderConfigExpanded && (
                <PackshotLayerRenderTreeConfig
                    layer={layer}
                    layerIndex={layerIndex}
                />
            )}
        </PackshotLayerAccordion>
    );
}
