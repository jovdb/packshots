import { CSSProperties, useState } from "react";
import { ILayerState } from "../../state/Layer";
import { useLayersConfig } from "../../state/layers";
import { Accordion, AccordionButton, AccordionPanel } from "../Accordion";

export function ActionBar() {
    const [action, setAction] = useState("");
    const layers = useLayersConfig(s => s.layers)
    const addLayer = useLayersConfig(s => s.addLayer)

    const style: CSSProperties = { color: "blue", textDecoration: "none", cursor: "pointer" };

    return (
        <Accordion
            isExpanded={!!action}
            title=""
            right={
                <AccordionButton onClick={() => setAction(action === "add" ? "" : "add")} title="Add layer">＋ Add</AccordionButton>
            }
        >
            {action === "add" && (<>
                <AccordionPanel>
                    <ul>
                        <li style={style} onClick={() => {
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
                            addLayer(layer, 0); // Add at bottom
                            setAction(""); // close panel
                        }}><a href="#">Background</a></li>

                        <li style={style} onClick={() => {
                            // Add below overlay
                            const index = layers.findIndex(l => l.name === "Overlay");
                            const layer: ILayerState = {
                                name: "Spread 1 on a plane",
                                type: "plane",
                                config: {},
                                ui: {
                                    isExpanded: true,
                                }
                            }
                            addLayer(layer, index < 0 ? undefined : index);
                            setAction(""); // close panel
                        }}><a href="#">Spread on a rectangle</a></li>
                        <li style={style} onClick={() => {
                            // Add below overlay
                            const index = layers.findIndex(l => l.name === "Overlay");
                            const layer: ILayerState = {
                                name: "Spread 1 on a cone",
                                type: "cone",
                                config: {},
                                ui: {
                                    isExpanded: true,
                                }
                            }
                            addLayer(layer, index < 0 ? undefined : index);
                            setAction(""); // close panel
                        }}><a href="#">Spread on a cylinder or cone</a></li>
                        <li style={style} onClick={() => {
                            const layer: ILayerState = {
                                name: "Overlay",
                                type: "image",
                                config: {},
                                ui: {
                                    isExpanded: true,
                                }
                            }
                            addLayer(layer);
                            setAction(""); // close panel
                        }}><a href="#">Overlay</a></li>
                    </ul>
                </AccordionPanel>
            </>)}
        </Accordion>
    );
}