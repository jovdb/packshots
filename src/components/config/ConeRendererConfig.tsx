import { IControlPointsConfig } from "../../controlPoints/IControlPoints";
import { FieldSet } from "../FieldSet";
import { ConfigComponent } from "./factory";
import { IImageConfig, ImageConfig, imageDefaultConfig } from "./ImageConfig";

export interface IConeRendererConfig extends IControlPointsConfig {
  image: IImageConfig;
  diameterTop: number;
  diameterBottom?: number;
  height: number;
}

export const ConeRendererConfig: ConfigComponent<IConeRendererConfig> = ({
  config,
  onChange,
}) => {
  const {
    image = imageDefaultConfig,
  } = config || {};

  return (
    <>
      <FieldSet label="Cylinder / Cone">
        <table style={{ width: "100%" }}>
          <tbody>
            <tr>
              <td colSpan={2}><b>TODO:<br/>- use WebGL (VERY SLOW NOW)<br/>- Support control points</b></td>
            </tr>

            <tr>
              <td>Diameter Top (cm):</td>
              <td>
                <input
                  type="number"
                  value={config.diameterTop}
                  step="0.1"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    onChange({
                      ...config,
                      diameterTop: value,
                    });
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>Diameter Bottom (cm):</td>
              <td>
                <input
                  type="number"
                  value={config.diameterBottom ?? config.diameterTop}
                  step="0.1"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    onChange({
                      ...config,
                      diameterBottom: value,
                    });
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>Height (cm):</td>
              <td>
                <input
                  type="number"
                  value={config.height}
                  step="0.1"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    onChange({
                      ...config,
                      height: value,
                    });
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </FieldSet>
      <FieldSet label="Image">
        <ImageConfig
          config={image}
          onChange={(newConfig) => {
            onChange({
              ...config,
              image: newConfig,
            });
          }}
        />
      </FieldSet>
    </>
  );
};
