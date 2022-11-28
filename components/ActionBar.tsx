import { CSSProperties, useState } from "react";
import AddLayer from "../icons/add-layer.svg";
import BookIcon from "../icons/book.svg";
import CylinderIcon from "../icons/cylinder.svg";
import MugIcon from "../icons/mug.svg";
import PlaneIcon from "../icons/plane.svg";
import VaseIcon from "../icons/vase.svg";
import { usePackshotActions } from "../src/packshot";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { photobookLayers } from "./samples/photobook";

export function ActionBar() {
  const [action, setAction] = useState("");
  const { setPackshot, addLayer } = usePackshotActions();

  const style: CSSProperties = { color: "blue", textDecoration: "none", cursor: "pointer" };

  return (
    <Accordion
      isExpanded={!!action}
      title=""
      right={
        <AccordionButton onClick={() => setAction(action === "add" ? "" : "add")} title="Add layer">
          <AddLayer width={20} style={{ marginRight: 5 }} />
        </AccordionButton>
      }
    >
      {action === "add" && (
        <>
          <AccordionPanel>
            <strong>Add Layer:</strong>
            <div
              style={style}
              onClick={() => {
                alert("TODO");
                // addLayer(layer, 0); // Add at bottom
                // setAction(""); // close panel
              }}
            >
              <a href="#">
                <PlaneIcon width="32" style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }} />Plane
              </a>
            </div>
            <div
              style={style}
              onClick={() => {
                alert("TODO");
                // addLayer(layer, 0); // Add at bottom
                // setAction(""); // close panel
              }}
            >
              <a href="#">
                <CylinderIcon
                  width="32"
                  style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }}
                />Cylinder / Cone
              </a>
            </div>

            <br />
            <strong>Load Samples:</strong>
            <div
              style={style}
              onClick={() => {
                setPackshot(photobookLayers); // close panel
                setAction(""); // close panel
              }}
            >
              <a href="#">
                <BookIcon
                  width="32"
                  style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }}
                />Photobook
              </a>
            </div>
            <div
              style={style}
              onClick={() => {
                // setPackshot(photobookLayers); // close panel
                // setAction(""); // close panel
              }}
            >
              <a href="#">
                <MugIcon
                  width="36"
                  style={{ transform: "translateY(10px)", margin: "6px 5px 0px 10px" }}
                />Mug
              </a>
            </div>
            <div
              style={style}
              onClick={() => {
                // setPackshot(photobookLayers); // close panel
                // setAction(""); // close panel
              }}
            >
              <a href="#">
                <VaseIcon
                  width="32"
                  style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }}
                />Vase
              </a>
            </div>
            <br/>
          </AccordionPanel>
        </>
      )}
    </Accordion>
  );
}
