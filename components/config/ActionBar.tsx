import { useState } from "react";
import { ILayerState } from "../../state/Layer";
import { useLayersConfig } from "../../state/layers";
import { Accordion, AccordionButton, AccordionPanel } from "../Accordion";

export function ActionBar() {
    const [action, setAction] = useState("");
    const layers = useLayersConfig(s => s.layers)
    const hasBackground = layers.some(l => l.name === "Background");
    const hasOverlay = layers.some(l => l.name === "Overlay");
    const addLayer = useLayersConfig(s => s.addLayer)

    return (
        <Accordion
            isExpanded={!!action}
            title=""
            right={
                <AccordionButton onClick={() => setAction(action === "add" ? "" : "add")} title="Add layer">＋ Add</AccordionButton>
            }
        >
            {action === "add" && (<>
                <AccordionPanel style={{ textAlign: "right"}}>
                    <select defaultValue="" autoFocus onChange={(e) => {
                        const type = e.target.value;
                        switch (type) {
                            case "background": {
                                const layer: ILayerState = {
                                    name: "Background",
                                    type: "image",
                                    config: {
                                        imageUrl: "./t-shirt.jpg",
                                    },
                                    ui: {
                                        isExpanded: true,
                                    }
                                }
                                addLayer(layer, 0);
                                break;
                            }
                            case "overlay": {
                                const layer: ILayerState = {
                                    name: "Overlay",
                                    type: "image",
                                    config: {},
                                    ui: {
                                        isExpanded: true,
                                    }
                                }
                                addLayer(layer);
                                break;
                            }
                            case "plane": {
                                const layer: ILayerState = {
                                    name: "Spread 1 on a plane",
                                    type: "plane",
                                    config: {},
                                    ui: {
                                        isExpanded: true,
                                    }
                                }
                                addLayer(layer, -1);
                                break;
                            }
                        }
                        setAction("");
                    }}>
                        <option value="" disabled>What do you want to add?</option>
                        <option value="background" disabled={hasBackground}>Background</option>
                        <option value="plane">Plane</option>
                        <option value="cone">Cone</option>
                        <option value="overlay" disabled={hasOverlay}>Overlay</option>
                    </select>
                </AccordionPanel>
            </>)}
        </Accordion>
    );
}