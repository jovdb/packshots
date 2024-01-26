/* eslint-disable @next/next/no-img-element */
import { FieldSet } from "../FieldSet";
import { ConfigComponent } from "./factory";
import { IImageConfig, ImageConfig } from "./ImageConfig";

export interface IImageRendererConfig {
  image: IImageConfig;
}

export const ImageRendererConfig: ConfigComponent<IImageRendererConfig> = ({ config, onChange }) => (
  <FieldSet label="Image">
    <ImageConfig
      config={config.image}
      onChange={(newConfig) => {
        onChange({
          ...config,
          image: newConfig,
        });
      }}
    />
  </FieldSet>
);
