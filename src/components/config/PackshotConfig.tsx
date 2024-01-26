import { IPackshotConfig } from "../../IPackshot";
import { ConfigComponent } from "./factory";
import { NumberInput } from '@mantine/core';
import { FieldSet } from "../FieldSet";

export const PackshotConfig: ConfigComponent<IPackshotConfig> = ({
  config,
  onChange,
}) => {
  const {
    width = 700,
    height = 700,
  } = config || {};

  return (
    <FieldSet
      label="Export dimentions"
    >
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td>Width (px):</td>
            <td>
              <NumberInput 
                size="xs"
                min={100}
                value={width}
                onChange={(e) => {
                  const newValue = e || 900;
                  onChange({
                    ...config,
                    width: newValue,
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>Height (px):</td>
            <td>
              <NumberInput 
                size="xs"
                min={100}
                value={height}
                onChange={(e) => {
                  const newValue = e || 900;
                  onChange({
                    ...config,
                    height: newValue,
                  });
                }}
              />
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
        </tbody>
      </table>
    </FieldSet>
  );
};
