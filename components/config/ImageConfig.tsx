/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { checkBoardStyle } from "../../src/checkboard";
import { getImageUrl, usePackshotConfig } from "../../src/stores/packshot";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";

export interface IImageConfig {
  /** Name is added because user can upload file blob that has no name */
  name?: string;
  url: string;
}

export const imageDefaultConfig = {
  name: "",
  url: "",
};

export const ImageConfig: ConfigComponent<IImageConfig> = ({
  config,
  onChange,
}) => {
  const [type, setType] = useState(() => {
    if (config.url?.startsWith("blob://")) return "local";
    return "url";
  });

  const [packshotConfig] = usePackshotConfig();

  const url = type === "url"
    ? getImageUrl(packshotConfig, config)
    : config?.url;

  return (
    <>
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
                      onChange({ url: "", name: "" });
                      break;
                    }
                    default: {
                      console.error("Unknown Background type:", value);
                      onChange({ url: "", name: "" });
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
                      value={config?.name || config?.url || ""}
                      style={{ width: "100%", marginRight: 5 }}
                      readOnly
                      disabled
                    />
                    <ImageSelection
                      onSelect={(info) => {
                        onChange({
                          name: info.name,
                          url: info.url,
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
                    value={config?.url || ""}
                    style={{ width: "100%" }}
                    onChange={(e) => {
                      const { value } = e.target;
                      const lastSlashIndex = value.lastIndexOf("/");
                      const name = lastSlashIndex < 0 ? value : value.substring(lastSlashIndex + 1);
                      onChange({
                        name,
                        url: value,
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
        </tbody>
      </table>
    </>
  );
};
