import type { IControlPoints } from "../controlPoints/IControlPoints";
import type { IRenderer } from "../renderers/IRenderer";
import type { ILayerConfig } from "./ILayerConfig";

export interface ILayer {
    layerConfig: ILayerConfig;
    renderer: IRenderer;
    controlPoints?: IControlPoints
}