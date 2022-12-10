import { CSSProperties, useState } from "react";
import AddLayer from "../icons/add-layer.svg";
import BookIcon from "../icons/book.svg";
import CylinderIcon from "../icons/cylinder.svg";
import MugIcon from "../icons/mug.svg";
import OpenIcon from "../icons/open.svg";
import PlaneIcon from "../icons/plane.svg";
import SaveIcon from "../icons/save.svg";
import VaseIcon from "../icons/vase.svg";
import { IConeRenderer, ILayer, IMaskRenderer, IPlaneRenderer } from "../src/IPackshot";
import { useLayers, usePackshotActions, usePackshotStore } from "../src/stores/packshot";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { flowerPotPackshot } from "./samples/flowerpot";
import { mugPackshot } from "./samples/mug";
import { photobookPackshot } from "./samples/photobook";
import { loadPackShotFromFolderAsync, savePackShotToFolderAsync, useAppRoot } from "../src/stores/app";

function getSampleImageConfig(layerCount: number) {
  return {
    name: `Sample${layerCount % 4 + 1}.jpg`,
    url: `./samples/Sample${layerCount % 4 + 1}.jpg`,
  };
}
export function ActionBar() {
  const [action, setAction] = useState("");
  const { setPackshot, addLayer } = usePackshotActions();
  const layers = useLayers();
  const style: CSSProperties = { color: "blue", textDecoration: "none", cursor: "pointer" };

  const [root, setRoot] = useAppRoot();

  return (
    <Accordion
      isExpanded={!!action}
      title=""
      left={
        <>
          <AccordionButton
            title="Open Packshot folder"
            onClick={async () => {
              const result = await loadPackShotFromFolderAsync();
              if (!result) return;
              const { packShot, directoryHandle } = result;
              setRoot(directoryHandle);
              setPackshot(packShot);
            }}
          >
            <OpenIcon width="22" style={{ transform: "translateY(-2px)" }} />
          </AccordionButton>
          <AccordionButton
            title="Save Packshot folder"
            onClick={async () => {

              // TODO: Ask to use current folder or new
              if (!root || typeof root === "string") {
                console.error("Not folder opened");
                return;
              }

              const packshot = usePackshotStore.getState();
              const result = await savePackShotToFolderAsync(packshot, root);
              if (result) {
                alert("Saved");
              } else {
                alert("Error Saving");
              }
            }}
          >
            <SaveIcon width="18" />
          </AccordionButton>
        </>
      }
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
                const planeRenderNode: IPlaneRenderer = {
                  type: "plane",
                  name: "Plane",
                  config: {
                    image: getSampleImageConfig(layers.length),
                    controlPoints: [
                      [-0.8, -0.8],
                      [0.8, -0.8],
                      [0.8, 0.8],
                      [-0.8, 0.8],
                    ],
                  },
                };

                const maskRenderNode: IMaskRenderer = {
                  type: "mask",
                  name: "Mask",
                  config: {
                    isDisabled: true,
                    image: {
                      name: "",
                      url: "",
                    },
                  },
                  children: [planeRenderNode],
                };
                const newLayer: ILayer = {
                  name: "Plane",
                  renderTree: maskRenderNode,
                  config: {
                    isRenderConfigExpanded: true,
                  },
                };
                addLayer(newLayer);
                setAction(""); // close panel
              }}
            >
              <a href="#">
                <PlaneIcon width="32" style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }} />Plane
              </a>
            </div>
            <div
              style={style}
              onClick={() => {
                const coneRenderNode: IConeRenderer = {
                  type: "cone",
                  config: {
                    image: getSampleImageConfig(layers.length),
                    controlPoints: [
                      [-0.6, -0.6],
                      [0, -0.55],
                      [0.6, -0.6],
                      [0.6, 0.6],
                      [0, 0.65],
                      [-0.6, 0.6],
                    ],
                    diameterTop: 9.2,
                    diameterBottom: 6.3,
                    height: 10,
                  },
                };
                const newLayer: ILayer = {
                  name: "Cylinder",
                  renderTree: coneRenderNode,
                  config: {
                    isRenderConfigExpanded: true,
                  },
                };
                addLayer(newLayer);
                setAction(""); // close panel
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
                setPackshot(photobookPackshot);
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
                setPackshot(mugPackshot);
                setAction(""); // close panel
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
                setPackshot(flowerPotPackshot);
                setAction(""); // close panel
              }}
            >
              <a href="#">
                <VaseIcon
                  width="32"
                  style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }}
                />Vase
              </a>
            </div>
            <br />
          </AccordionPanel>
        </>
      )}
    </Accordion>
  );
}
