/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { checkBoardStyle } from "../../src/checkboard";
import { useImageUrl } from "../../src/stores/app";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";

import { getSampleImageConfigAsync, loadImageToBase64UrlAsync } from "../../utils/image";

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
    if (config.url?.startsWith("./samples")) return `sample${/\d+/.exec(config.url ?? config.name)?.[0] || "sample1"}`;
    if (config.url?.startsWith("blob://")) return "local";
    return "url";
  });

  const { data: url } = useImageUrl(config);

  return (
    <>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ minWidth: 60 }}>Type:</td>
            <td>
              <select
                value={type}
                onChange={async (e) => {
                  const { value } = e.target;
                  setType(value);
                  switch (value) {
                    case "local": {
                      onChange({ url: "", name: "" });
                      break;
                    }
                    case "sample1": {
                      const imageConfig = await getSampleImageConfigAsync(1);
                      onChange(imageConfig);
                      break;
                    }
                    case "sample2": {
                      const imageConfig = await getSampleImageConfigAsync(2);
                      onChange(imageConfig);
                      break;
                    }
                    case "sample3": {
                      const imageConfig = await getSampleImageConfigAsync(3);
                      onChange(imageConfig);
                      break;
                    }
                    case "sample4": {
                      const imageConfig = await getSampleImageConfigAsync(4);
                      onChange(imageConfig);
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
                <option value="sample1">Sample 1</option>
                <option value="sample2">Sample 2</option>
                <option value="sample3">Sample 3</option>
                <option value="sample4">Sample 4</option>
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
