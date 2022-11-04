import { useState } from "react";
import { Accordion, AccordionBar, AccordionButton, AccordionPanel } from "../Accordion";
import { usePackshotImagesConfig } from "./PackshotImagesConfig";

export function ActionBar() {
    const [action, setAction] = useState("");
    const hasBackground = !!usePackshotImagesConfig(a => a.backgroundUrl)
    const hasOverlay = !!usePackshotImagesConfig(a => a.overlayUrl)
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
                    <select onChange={() => {
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