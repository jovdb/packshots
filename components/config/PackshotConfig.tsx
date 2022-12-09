import { useEffect, useState } from "react";
import { useIsFileSystemSupported, useFileSystemActions } from "../../src/fileSystem";
import { IPackshotConfig } from "../../src/IPackshot";
import { ConfigComponent } from "./factory";

export const PackshotConfig: ConfigComponent<IPackshotConfig> = ({
  config,
  onChange,
}) => {
  const {
    width = 700,
    height = 700,
    root = "",
  } = config || {};

  const [rootType, setRootType] = useState("url");
  const isFileSystemSupported = useIsFileSystemSupported();
  const { loadRootFolderAsync, getFilesAsync } = useFileSystemActions();

  useEffect(() => {
    console.warn("FileSystem access not supported");
  }, [isFileSystemSupported]);

  return (
    <fieldset>
      <legend>Export dimentions</legend>
      <table style={{ width: "100%" }}>
        <tbody>
          {isFileSystemSupported && (
            <tr>
              <td style={{ minWidth: 60 }}>Type:</td>
              <td>
                <select
                  value={rootType}
                  onChange={(e) => {
                    const { value } = e.target;
                    setRootType(value);
                  }}
                >
                  <option value="url">URL</option>
                  <option value="folder">Folder</option>
                </select>
              </td>
            </tr>
          )}
          <tr>
            <td>{rootType === "folder" ? "Base folder:" : "Base url"}</td>
            <td>
              <input
                value={root}
                onChange={(e) => {
                  const newValue = e.target.value || "";
                  onChange({
                    ...config,
                    root: newValue,
                  });
                }}
              />
              {rootType === "folder" && (
                <button
                  style={{ marginLeft: 5 }}
                  onClick={async () => {
                    const name = await loadRootFolderAsync();
                    onChange({
                      ...config,
                      root: name,
                    })
                    const files = await getFilesAsync();
                    console.log(files.map(f => f.name))
                  }}
                >
                  Select
                </button>
              )}
            </td>
          </tr>
          <tr>
            <td>Width:</td>
            <td>
              <input
                type="number"
                value={width}
                min={1}
                step={1}
                style={{ width: 60 }}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  onChange({
                    ...config,
                    width: newValue,
                  });
                }}
              />
              &nbsp;px
            </td>
          </tr>
          <tr>
            <td>Height:</td>
            <td>
              <input
                type="number"
                value={height}
                min={1}
                step={1}
                style={{ width: 60 }}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  onChange({
                    ...config,
                    height: newValue,
                  });
                }}
              />
              &nbsp;px
            </td>
          </tr>
          {
            /*
                        <tr>
                            <td>Transaprent:</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={isTransparent}
                                    onChange={(e) => {
                                        onChange({
                                            ...config,
                                            isTransparent: e.target.checked,
                                        });
                                    }}
                                />
                            </td>
                        </tr>
                    */
          }
          <tr>
            <td colSpan={2} style={{ textAlign: "right" }}>
              <button onClick={() => alert("todo")}>Export as PNG</button>
            </td>
          </tr>
        </tbody>
      </table>
    </fieldset>
  );
};
