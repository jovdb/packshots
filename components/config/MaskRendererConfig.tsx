/* eslint-disable @next/next/no-img-element */
import { useId, useState } from "react";
import { checkBoardStyle } from "../../src/checkboard";
import { IRendererConfig } from "../../src/IPackshot";
import { useImageUrl } from "../../src/stores/app";
import { ImageSelection } from "../FileSelection";
import { ConfigComponent } from "./factory";
import { IImageConfig, ImageConfig } from "./ImageConfig";

export interface IMaskRenderingConfig extends IRendererConfig {
  image: IImageConfig;
  colorChannel?: number;
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
  const { data: url } = useImageUrl(config.image);

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
          <>
            <ImageConfig
              config={config.image}
              onChange={(newImageConfig) => {
                onChange({
                  ...config,
                  image: newImageConfig,
                });
              }}
            />
            <table style={{ width: "100%" }}>
              <tbody>
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
          </>
        )}
    </fieldset>
  );
};
