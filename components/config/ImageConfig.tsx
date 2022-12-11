/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { checkBoardStyle } from "../../src/checkboard";
import { isFolderHandles, useImageUrl, usePackshotRoot } from "../../src/stores/app";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";

import { getFileNamesAsync, loadFolderAsync } from "../../src/stores/fileSystem";
import { getSampleImageConfigAsync } from "../../utils/image";
import { useQuery } from "@tanstack/react-query";

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
  const [packshotRoot, setPackshotRoot] = usePackshotRoot();
  
  const [type, setType] = useState(() => {
    if (config.url?.startsWith("./samples")) return `sample${/\d+/.exec(config.url ?? config.name)?.[0] || "sample1"}`;
    if (config.url?.startsWith("blob://")) return "local";
    if (config.url?.startsWith("http")) return "url";
    if (packshotRoot && typeof packshotRoot === "string") return "sample";
    return "folder";
  });

  const { data: url } = useImageUrl(config);

  const {data: folderFiles} = useQuery([type, packshotRoot], async () => {
    if (type !== "folder") return [];
    if (isFolderHandles(packshotRoot)) {
      const allFiles = await getFileNamesAsync(packshotRoot);
      const imageFileNames = allFiles.filter(fileName => {
        const lowerCaseFilename = fileName.toLowerCase();
        return ["png", "jpg", "jpeg"].some(ext => lowerCaseFilename.endsWith("." + ext));
      });
      return imageFileNames;  
    }
    return [];
  });

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
                    case "sample": {
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
                <option value="folder">From packshot folder{isFolderHandles(packshotRoot) ? `: ${packshotRoot.name}`: ""}</option>
                <option value="local">Select image</option>
                <option value="url">From URL</option>
                {type === "sample" && (
                  <option value="sample">Sample</option>
                )}
                <optgroup label="Samples:">
                  <option value="sample1">Sample 1</option>
                  <option value="sample2">Sample 2</option>
                  <option value="sample3">Sample 3</option>
                  <option value="sample4">Sample 4</option>
                </optgroup>
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
          {type === "folder" && !isFolderHandles(packshotRoot) && (
            <tr>
              <td>Select folder:</td>
              <td>
                <button
                  onClick={async () => {
                    const folderhandle = await loadFolderAsync();
                    if (!folderhandle) return;
                    setPackshotRoot(folderhandle);
                  }}
                >
                  Select
                </button>
              </td>
            </tr>
          )}
          {type === "folder" && isFolderHandles(packshotRoot) && (
            <tr>
              <td>Select file:</td>
              <td>
                <select
                  value={config.url}
                  onChange={(e) => {
                    const { value: fileName } = e.target;
                    onChange({
                      name: fileName,
                      url: fileName,
                    });
                  }}
                >
                  {folderFiles?.map(fileName => <option key={fileName} value={fileName}>{fileName}</option>)}
                </select>
              </td>
            </tr>
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
