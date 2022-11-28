import { IControlPointsConfig } from "../../src/controlPoints/IControlPoints";
import { ConfigComponent } from "./factory";
import { IImageConfig, ImageConfig, imageDefaultConfig } from "./ImageConfig";

export interface IConeRendererConfig extends IControlPointsConfig {
  image: IImageConfig;
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
      <fieldset>
        <legend>Image</legend>
        <ImageConfig
          config={image}
          onChange={(newConfig) => {
            onChange({
              ...config,
              image: newConfig,
            });
          }}
        />
      </fieldset>
    </>
  );
};
