/*
╔═════════════════╗    ╔═════════════════╗       ╔═══════════════════╗
║ Packshot        ║    ║ Layer           ║   ┌──→║ ImageRenderer     ║
╟─────────────────╢    ╟─────────────────╢   │   ╟───────────────────╢
║ -name?          ║    ║ -name?          ║   │   ║ -type: "image"    ║
║ -config         ║    ║ -config         ║   │   ║ -config           ║
║   -width        ║    ║   -isDisabled?  ║   │   ║   -image          ║
║   -height       ║    ║   -isExpanded?  ║   │   ╚═══════════════════╝
║ -layers:        ║    ║ -renderTree   ──║───┤   ╔═══════════════════╗
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

import { IImageRendererConfig } from "../components/config/ImageRendererConfig";
import { IMaskRenderingConfig } from "../components/config/MaskRendererConfig";
import { IPlaneRendererConfig } from "../components/config/PlaneRendererConfig";
import { IRenderer } from "./renderers/IRenderer";

export interface IRendererConfig {
  isDisabled?: boolean;
}

/** Render information from packshot configuration */
export interface IRenderTree {
  name?: string;
  type: string;
  /** That code that will do the rendering, added by store */
  renderer?: IRenderer;
  /** A tree of render information (example a mask with as child an image) */
  children?: Renderers[];
}

export interface IImageRenderer extends IRenderTree {
  type: "image";
  config: IImageRendererConfig;
}

export interface IPlaneRenderer extends IRenderTree {
  type: "plane";
  config: IPlaneRendererConfig;
}

export interface IMaskRenderer extends IRenderTree {
  type: "mask";
  config: IMaskRenderingConfig;
  children: Renderers[];
}

export type Renderers = IImageRenderer | IMaskRenderer | IPlaneRenderer;

export interface ILayerConfig {
  /** Disable Layer */
  isDisabled?: boolean;

  /** Expand renderer options Config */
  isRenderConfigExpanded?: boolean;

  /** Expand the layer options */
  isLayerOptionExpanded?: boolean;

  /** Layer composition */
  composition?: GlobalCompositeOperation;
}

export interface ILayer {
  name?: string;
  config?: ILayerConfig;
  renderTree: Renderers;
}

export interface IPackshotConfig {
  width: number;
  height: number;
}

export interface IPackshot {
  name?: string;
  config: IPackshotConfig;
  layers: ILayer[];
}
