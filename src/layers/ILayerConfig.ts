import { IMaskConfig } from "../../components/config/MaskConfig";
import { IRenderer } from "../renderers/IRenderer";

export interface ILayerConfig<TConfig = {}> {
    name: string,
    type: "image" | "plane" | "cone",
    config: TConfig,
    ui?: {
        isExpanded?: boolean;
        isVisible?: boolean;
    };
    mask?: IMaskConfig;
}