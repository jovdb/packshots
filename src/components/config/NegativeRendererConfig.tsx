/* eslint-disable @next/next/no-img-element */
import { Select } from "@mantine/core";
import { IRendererConfig } from "../../IPackshot";
import { FieldSet } from "../FieldSet";
import { ConfigComponent } from "./factory";

export interface INegativeRenderingConfig extends IRendererConfig {
  method: "canvas" | "imagedata" | "wasm" | "webgpu";
  isDisabled: boolean;
}

export const NegativeRendererConfig: ConfigComponent<INegativeRenderingConfig> = ({
  config,
  onChange,
}) => {
  const isEnabled = !config.isDisabled;
  return (
    <FieldSet label="Negative" checked={isEnabled} onChecked={(isChecked) => {
      onChange({
        ...config,
        isDisabled: !isChecked,
      });
    }}>
      {isEnabled
        && (
          <>
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td>
                    Method:
                  </td>
                  <td>
                    <Select
                      size="xs"
                      value={(config.method ?? "canvas").toString()}
                      onChange={(e) => {
                        const value = e ?? "canvas";
                        onChange({
                          ...config,
                          method: value as typeof config.method,
                        });
                      }}
                      data={[
                        { value: "canvas", label: "Canvas" },
                        { value: "imagedata", label: "Image data" },
                        { value: "wasm", label: "Web Assembly" },
                        { value: "webgpu", label: "WebGPU" },
                      ]}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
    </FieldSet>
  );
};
