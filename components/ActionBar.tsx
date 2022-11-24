import { CSSProperties, useState } from "react";
import { ILayerConfig } from "../src/layers/ILayerConfig";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import AddLayer from "../icons/add-layer.svg";
import { usePackshotActions } from "../src/packshot";
import { photobookLayers } from "./samples/photobook";

export function ActionBar() {
    const [action, setAction] = useState("");
    const { setPackshot } = usePackshotActions()

    const style: CSSProperties = { color: "blue", textDecoration: "none", cursor: "pointer" };

    return (
        <Accordion
            isExpanded={!!action}
            title=""
            right={
                <AccordionButton onClick={() => setAction(action === "add" ? "" : "add")} title="Add layer"><AddLayer width={20} style={{ marginRight: 5}} /></AccordionButton>
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
                            // addLayer(layer, 0); // Add at bottom
                            // setAction(""); // close panel
                        }}><a href="#">Background</a></li>
                    </ul>

                    <div>Sample:</div>
                    <ul>
                        <li style={style} onClick={() => {
                            setPackshot(photobookLayers); // close panel
                            setAction(""); // close panel
                        }}><a href="#">Photo book</a></li>
                    </ul>
                </AccordionPanel>
            </>)}
        </Accordion>
    );
}