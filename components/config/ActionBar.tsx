import { CSSProperties, useState } from "react";
import { ILayerConfig } from "../../src/layers/ILayerConfig";
import { useLayers, useLayersActions } from "../../src/layers/layers";
import { Accordion, AccordionButton, AccordionPanel } from "../Accordion";
import { flowerPotLayers } from "../samples/flowerpot";
import { photobookLayers } from "../samples/photobook";

export function ActionBar() {
    const [action, setAction] = useState("");
    const layers = useLayers();
    const { addLayer, replaceLayer } = useLayersActions()

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
                    <div>Layer:</div>
                    <ul>
                        <li style={style} onClick={() => {
                            const layer: ILayerConfig = {
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
                            const layer: ILayerConfig = {
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
                            const layer: ILayerConfig = {
                                name: "Spread 1 on a plane2",
                                type: "plane2",
                                config: {},
                                ui: {
                                    isExpanded: true,
                                }
                            }
                            addLayer(layer, index < 0 ? undefined : index);
                            setAction(""); // close panel
                        }}><a href="#">Spread on a rectangle2</a></li>
                        <li style={style} onClick={() => {
                            // Add below overlay
                            const index = layers.findIndex(l => l.name === "Overlay");
                            const layer: ILayerConfig = {
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
                            const layer: ILayerConfig = {
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

                    <div>Sample:</div>
                    <ul>
                        <li style={style} onClick={() => {
                            replaceLayer(photobookLayers); // close panel
                            setAction(""); // close panel
                        }}><a href="#">Photo book</a></li>
                        <li style={style} onClick={() => {
                            replaceLayer(flowerPotLayers); // close panel
                            setAction(""); // close panel
                        }}><a href="#">Flower pot</a></li>
                    </ul>
                </AccordionPanel>
            </>)}
        </Accordion>
    );
}