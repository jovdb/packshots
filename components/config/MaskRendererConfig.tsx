/* eslint-disable @next/next/no-img-element */
import { Select } from "@mantine/core";
import { IRendererConfig } from "../../src/IPackshot";
import { FieldSet } from "../FieldSet";
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
  const isEnabled = !config.isDisabled;
  return (
    <FieldSet
      label="Mask"
      checked={isEnabled}
      onChecked={(isChecked) => {
        onChange({
          ...config,
          isDisabled: !isChecked,
        });
      }}
    >
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
                    <Select
                      size="xs"
                      value={(config.colorChannel ?? 0).toString()}
                      onChange={(e) => {
                        const value = e || "0";
                        onChange({
                          ...config,
                          colorChannel: parseInt(value) || 0,
                        });
                      }}
                      data={[
                        { value: "0", label: "Red" },
                        { value: "1", label: "Green" },
                        { value: "2", label: "Blue" },
                        { value: "3", label: "Alpha" },
                      ]}
                    />
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
    </FieldSet>
  );
};
