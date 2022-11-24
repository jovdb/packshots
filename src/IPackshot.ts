
/*
╔═════════════════╗    ╔═════════════════╗       ╔═══════════════════╗
║ Packshot        ║    ║ Layer           ║   ┌──→║ ImageRenderer     ║
╟─────────────────╢    ╟─────────────────╢   │   ╟───────────────────╢
║ -name?          ║    ║ -name?          ║   │   ║ -type: "image"    ║
║ -config         ║    ║ -config         ║   │   ║ -config           ║
║   -width        ║    ║   -isDisabled?  ║   │   ║   -image          ║
║   -height       ║    ║   -isExpanded?  ║   │   ╚═══════════════════╝
║ -layers:        ║    ║ -renderer   ────║───┤   ╔═══════════════════╗
║  ┌───────┐      ║    ╚═════════════════╝   ├──→║ PlaneRenderer     ║
║  │ Layer │ ┐    ║                          │   ╟───────────────────╢
║  └───────┘ │ ┐  ║                          │   ║ -type: "plane"    ║
║    └───────┘ │  ║                          │   ║ -config           ║
║      └───────┘  ║                          │   ║   -image          ║
╚═════════════════╝                          │   ║   -controlPoints  ║
                                             │   ╚═══════════════════╝
                                             │   ╔═══════════════════╗
                                             ├──→║ ConeRenderer      ║
                                             │   ╟───────────────────╢
                                             │   ║ -type: "cone"     ║
                                             │   ║ -config           ║
                                             │   ║   -image          ║
                                             │   ║   -controlPoints  ║
                                             │   ╚═══════════════════╝
                                             │   ╔═══════════════════╗
                                             └──→║ MaskRenderer      ║
                                                 ╟───────────────────╢
                                                 ║ -type: "mask"     ║
                                                 ║ -config           ║
                                                 ║   -image          ║
                                                 ║ -children         ║
                                                 ╚═══════════════════╝
*/

import { IImageConfig } from "../components/config/ImageConfig";
import { IImageRendererConfig } from "../components/config/ImageRendererConfig";
import { IMaskRenderingConfig } from "../components/config/MaskRendererConfig";
import { IPlaneRendererConfig } from "../components/config/PlaneRendererConfig";

export interface IRendererConfig {
    isDisabled?: boolean;
}

export interface IRenderer {
    name?: string;
    type: string;
    children?: Renderers[];
}

export interface IImageRenderer extends IRenderer {
    type: "image";
    config: IImageRendererConfig;
}

export interface IPlaneRenderer extends IRenderer {
    type: "plane";
    config: IPlaneRendererConfig;
}

export interface IMaskRenderer extends IRenderer {
    type: "mask";
    config: IMaskRenderingConfig;
    children: Renderers[];
}

export type Renderers = IImageRenderer | IMaskRenderer | IPlaneRenderer;

export interface ILayer {
    name?: string;
    config?: {
        isDisabled?: boolean;
        isExpanded?: boolean;
    }
    renderer: Renderers;
}

export interface IPackshotConfig {
    width: number;
    height: number;
}

export interface IPackshot{
    name?: string;
    config: IPackshotConfig,
    layers: ILayer[];
}

