/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { checkBoardStyle } from "../../checkboard";
import { isFolderHandles, useImageUrl, usePackshotRoot } from "../../stores/app";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";

import { Button, Select, TextInput } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { getFileNamesAsync, loadFolderAsync } from "../../fileSystem";
import { getSampleImageConfigAsync } from "../../utils/image";

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

  const { data: folderFiles } = useQuery([type, packshotRoot], async () => {
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

  const imageTypes = [
    { value: "folder", label: `From packshot folder${isFolderHandles(packshotRoot) ? `: ${packshotRoot.name}` : ""}` },
    { value: "local", label: "Select image" },
    { value: "url", label: "From URL" },
  ];

  if (type === "sample") imageTypes.push({ value: "sample", label: "Sample" });
  imageTypes.push(
    { value: "sample1", label: "Sample 1" },
    { value: "sample2", label: "Sample 2" },
    { value: "sample3", label: "Sample 3" },
    { value: "sample4", label: "Sample 4" },
  );

  return (
    <>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ minWidth: 60 }}>Type:</td>
            <td>
              <Select
                value={type}
                size="xs"
                data={imageTypes}
                onChange={async (e) => {
                  const value = e || "";
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
                    case "url":
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
              />
            </td>
          </tr>
          {type === "local" && (
            <>
              <tr>
                <td colSpan={2}>
                  File name:
                  <div style={{ display: "flex" }}>
                    {
                      /*
                      <TextInput
                        value={config?.name || config?.url || ""}
                        size="xs"
                        mr={5}
                        readOnly
                        disabled
                      />
                      */
                    }
                    <br />
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
                  <TextInput
                    value={config?.url || ""}
                    size="xs"
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
                <Button
                  size="xs"
                  onClick={async () => {
                    const folderhandle = await loadFolderAsync();
                    if (!folderhandle) return;
                    setPackshotRoot(folderhandle);
                  }}
                >
                  Select
                </Button>
              </td>
            </tr>
          )}
          {type === "folder" && isFolderHandles(packshotRoot) && (
            <tr>
              <td>Select file:</td>
              <td>
                <Select
                  size="xs"
                  data={[
                    { label: "", value: "" },
                    ...folderFiles?.map(fileName => ({
                      value: fileName,
                      label: fileName,
                    })) ?? [],
                  ]}
                  value={config.url}
                  onChange={(value) => {
                    const fileName = value ?? "";
                    onChange({
                      name: fileName,
                      url: fileName,
                    });
                  }}
                />
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
