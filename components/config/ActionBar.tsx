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
            title=""
            isExpandable={false}
            right={
                <AccordionButton onClick={() => setAction(action === "add" ? "" : "add")} title="Add layer">＋ Add</AccordionButton>
            }
        >
            {action === "add" && (<>
                <AccordionPanel style={{ textAlign: "right"}}>
                    <select onChange={(e) => {
                        const type = e.target.value;
                        switch (type) {
                            case "background": {
                                const layer: ILayerState = {
                                    name: "Background",
                                    type: "image",
                                    config: {
                                        imageUrl: "./t-shirt.jpg",
                                    },
                                }
                                addLayer(layer, 0);
                                break;
                            }
                            case "overlay": {
                                const layer: ILayerState = {
                                    name: "Overlay",
                                    type: "image",
                                    config: {},
                                }
                                addLayer(layer);
                                break;
                            }
                        }
                        setAction("");
                    }}>
                        <option value="" disabled selected>Select your option</option>
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