import { IControlPointsConfig } from "../../src/controlPoints/IControlPoints";
import { FieldSet } from "../FieldSet";
import { ConfigComponent } from "./factory";
import { IImageConfig, ImageConfig, imageDefaultConfig } from "./ImageConfig";

export interface IPlaneRendererConfig extends IControlPointsConfig {
  image: IImageConfig;
}

export const PlaneRendererConfig: ConfigComponent<IPlaneRendererConfig> = ({
  config,
  onChange,
}) => {
  const {
    image = imageDefaultConfig,
  } = config || {};

  return (
    <>
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
