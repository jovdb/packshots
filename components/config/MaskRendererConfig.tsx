/* eslint-disable @next/next/no-img-element */
import { useId, useState } from "react";
import { checkBoardStyle } from "../../src/checkboard";
import { IRendererConfig } from "../../src/IPackshot";
import { getImageUrl, usePackshotConfig } from "../../src/packshot";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";
import { IImageConfig } from "./ImageConfig";

export interface IMaskRenderingConfig extends IRendererConfig {
  image: IImageConfig;
  colorChannel?: number,
  isDisabled?: boolean;
}

export const MaskRendererConfig: ConfigComponent<IMaskRenderingConfig> = ({
  config,
  onChange,
}) => {
  const [type, setType] = useState(() => {
    if (config.image.url?.startsWith("blob://")) return "local";
    return "url";
  });

  const [packshotConfig] = usePackshotConfig();

  const url = type === "url"
    ? getImageUrl(packshotConfig, config.image)
    : config.image.url;

  const isEnabled = !config.isDisabled;
  const id = useId();
  return (
    <fieldset>
      <legend style={{ userSelect: "none" }}>
        <input
          type="checkbox"
          id={`mask_${id}`}
          checked={isEnabled}
          style={{ transform: "translate(0, 2px)" }}
          onChange={(e) => {
            const isChecked = e.target.checked;
            onChange({
              ...config,
              isDisabled: !isChecked,
            });
          }}
        />
        <label htmlFor={`mask_${id}`} style={{ cursor: "pointer" }}>Mask</label>
      </legend>
      {isEnabled
        && (
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ minWidth: 60 }}>Type:</td>
                <td>
                  <select
                    value={type}
                    onChange={(e) => {
                      const { value } = e.target;
                      setType(value);
                      switch (value) {
                        case "local": {
                          onChange({
                            ...config,
                            image: { url: "", name: "" },
                          });
                          break;
                        }
                        default: {
                          console.error("Unknown Background type:", value);
                          onChange({
                            ...config,
                            image: { url: "", name: "" },
                          });
                          break;
                        }
                      }
                    }}
                  >
                    <option value="local">Local file</option>
                    <option value="url">URL</option>
                  </select>
                </td>
              </tr>
              {type === "local" && (
                <>
                  <tr>
                    <td colSpan={2}>
                      File name:
                      <div style={{ display: "flex" }}>
                        <input
                          value={config?.image?.name || config?.image?.url || ""}
                          style={{ width: "100%", marginRight: 5 }}
                          readOnly
                          disabled
                        />
                        <ImageSelection
                          onSelect={(info) => {
                            onChange({
                              ...config,
                              image: { url: info.url, name: info.name },
                            });
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                </>
              )}
              {type === "url" && (
                <>
                  <tr>
                    <td colSpan={2}>
                      Location:
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <input
                        value={config?.image?.url || ""}
                        style={{ width: "100%" }}
                        onChange={(e) => {
                          const { value } = e.target;
                          const lastSlashIndex = value.lastIndexOf("/");
                          const name = lastSlashIndex < 0 ? value : value.substring(lastSlashIndex + 1);
                          onChange({
                            ...config,
                            image: { url: value, name },
                          });
                        }}
                      />
                    </td>
                  </tr>
                </>
              )}
              <tr>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  {url && (
                    <img
                      alt="preview"
                      src={url}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxWidth: 200,
                        maxHeight: 200,
                        border: "1px solid #aaa",
                        ...checkBoardStyle,
                      }}
                    />
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  Mask Color:
                </td>
                <td>
                  <select
                    value={(config.colorChannel ?? 0).toString()}
                    onChange={(e) => {
                      const { value } = e.target;
                      onChange({
                        ...config,
                        colorChannel: parseInt(value) || 0,
                      });
                    }}
                  >
                    <option value="0">Red</option>
                    <option value="1">Green</option>
                    <option value="2">Blue</option>
                    <option value="3">Alpha</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  The mask image will be stretched over the entire output image.
                </td>
              </tr>
            </tbody>
          </table>
        )}
    </fieldset>
  );
};
