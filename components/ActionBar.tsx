import { CSSProperties, useState } from "react";
import AddLayer from "../icons/add-layer.svg";
import BookIcon from "../icons/book.svg";
import CylinderIcon from "../icons/cylinder.svg";
import FileIcon from "../icons/file.svg";
import FolderIcon from "../icons/folder.svg";
import ImageIcon from "../icons/image.svg";
import JsonIcon from "../icons/json.svg";
import MugIcon from "../icons/mug.svg";
import OpenIcon from "../icons/open.svg";
import PlaneIcon from "../icons/plane.svg";
import SaveIcon from "../icons/save.svg";
import VaseIcon from "../icons/vase.svg";
import WebIcon from "../icons/web.svg";
import ZipIcon from "../icons/zip.svg";

import { IConeRenderer, IImageRenderer, ILayer, IMaskRenderer, IPlaneRenderer } from "../src/IPackshot";
import {
  isFolderHandles,
  loadPackShotFromFolderAsync,
  savePackShotToFolderAsync,
  usePackshotRoot,
} from "../src/stores/app";
import { useLayers, usePackshotActions, usePackshotName, usePackshotStore } from "../src/stores/packshot";
import { handleError } from "../utils/error";
import { getSampleImageConfigAsync } from "../utils/image";
import { Accordion, AccordionButton, AccordionPanel } from "./Accordion";
import { flowerPotPackshot } from "./samples/flowerpot";
import { mugPackshot } from "./samples/mug";
import { photobookPackshot } from "./samples/photobook";

export function ActionBar() {
  const [action, setAction] = useState("");
  const { setPackshot, addLayer } = usePackshotActions();
  const layers = useLayers();
  const style: CSSProperties = { color: "blue", textDecoration: "none", cursor: "pointer" };

  const [packshotName, setPackshotName] = usePackshotName();
  const [root, setRoot] = usePackshotRoot();

  const title = packshotName.trim() || "<Untitled>";
  return (
    <Accordion
      isExpanded={!!action}
      title={title}
      isTitleEditable
      onTitleChange={(title) => {
        setPackshotName(title);
      }}
      left={
        <>
          <AccordionButton
            title="Open Packshot"
            onClick={async () => {
              setAction(action === "open" ? "" : "open");
            }}
          >
            <OpenIcon width="22" style={{ transform: "translateY(-2px)" }} />
          </AccordionButton>
          <AccordionButton
            title="Save Packshot"
            onClick={async () => {
              setAction(action === "save" ? "" : "save");
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
              onClick={async () => {
                const imageConfig = await getSampleImageConfigAsync(layers.length);

                const imageRenderNode: IImageRenderer = {
                  type: "image",
                  name: "Image",
                  config: {
                    image: imageConfig,
                  },
                };
                const newLayer: ILayer = {
                  name: "Image",
                  renderTree: imageRenderNode,
                  config: {
                    isRenderConfigExpanded: true,
                  },
                };
                addLayer(newLayer);
                setAction(""); // close panel
              }}
            >
              <a href="#">
                <ImageIcon width="32" style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }} />Image
              </a>
            </div>
            <div
              style={style}
              onClick={async () => {
                const imageConfig = await getSampleImageConfigAsync(layers.length);
                const planeRenderNode: IPlaneRenderer = {
                  type: "plane",
                  name: "Plane",
                  config: {
                    image: imageConfig,
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
              onClick={async () => {
                const imageConfig = await getSampleImageConfigAsync(layers.length);
                const coneRenderNode: IConeRenderer = {
                  type: "cone",
                  config: {
                    image: imageConfig,
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
          </AccordionPanel>
        </>
      )}
      {action === "open" && (
        <>
          <AccordionPanel>
            <strong>Open:</strong>
            <div
              style={style}
              onClick={async () => {
                try {
                  const result = await loadPackShotFromFolderAsync();
                  if (!result) return;
                  const { packShot, directoryHandle } = result;
                  setRoot(directoryHandle);
                  setPackshot(packShot);
                  setAction(""); // close panel
                } catch (err) {
                  handleError(err);
                }
              }}
            >
              <a href="#">
                <FolderIcon width="32" style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }} />Open
                from folder
              </a>
            </div>
            <div
              style={style}
              onClick={async () => {
                alert("TODO");
                // setAction(""); // close panel
              }}
            >
              <a href="#">
                <WebIcon width="32" style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }} />Open from
                URL (TODO)
              </a>
            </div>
            <div
              style={style}
              onClick={async () => {
                setAction(""); // close panel
                setPackshot({
                  config: {
                    width: 900,
                    height: 900,
                  },
                  layers: [],
                });
              }}
            >
              <a href="#">
                <FileIcon width="32" style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }} />Open
                blank
              </a>
            </div>
            <br />
            <strong>Open Sample:</strong>
            <div
              style={style}
              onClick={() => {
                setPackshot(photobookPackshot);
                setRoot("./products/Book");
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
                setRoot("./products/Mug");
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
                setRoot("./products/Pot");
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
      {action === "save" && (
        <>
          <AccordionPanel>
            <strong>Save:</strong>
            {isFolderHandles(root) && (
              <div
                style={style}
                onClick={async () => {
                  try {
                    const packshot = usePackshotStore.getState();
                    const result = await savePackShotToFolderAsync(packshot, root);
                    if (result) {
                      alert("Saved");
                    } else {
                      alert("Error Saving");
                    }
                  } catch (err) {
                    handleError(err);
                  }
                }}
              >
                <a href="#">
                  <FolderIcon width="32" style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }} />Save
                  to current folder: {root.name}
                </a>
              </div>
            )}
            <div
              style={style}
              onClick={async () => {
                try {
                  const packshot = usePackshotStore.getState();
                  const folderHandle = await savePackShotToFolderAsync(packshot, undefined);
                  if (folderHandle) {
                    setRoot(folderHandle);
                    alert("Saved");
                  } else {
                    alert("Error Saving");
                  }
                  setAction(""); // close panel
                } catch (err) {
                  handleError(err);
                }
              }}
            >
              <a href="#">
                <FolderIcon width="32" style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }} />Save to
                {root ? " new" : ""} Folder
              </a>
            </div>
            <div
              style={style}
              onClick={async () => {
                alert("TODO");
                // setAction(""); // close panel
              }}
            >
              <a href="#">
                <ZipIcon width="32" style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }} />Save to
                ZIP (TODO?)
              </a>
            </div>
            <div
              style={style}
              onClick={async () => {
                alert("TODO");
                // setAction(""); // close panel
              }}
            >
              <a href="#">
                <JsonIcon width="32" style={{ transform: "translateY(10px)", margin: "10px 10px 0px 10px" }} />Save to
                JSON (TODO?)
              </a>
            </div>
            <br />
            <div>
              <input type="checkbox"></input>
              <label>
                TODO: Optimize masks<br />(Combine masks into a single image)
              </label>
            </div>
            <br />
          </AccordionPanel>
        </>
      )}
    </Accordion>
  );
}
