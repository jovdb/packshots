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

import { IConeRendererConfig } from "../components/config/ConeRendererConfig";
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
  children?: IRenderTree[];
  /** Render Node Configuration */
  config: {};
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
  children: IRenderTree[];
}

export interface IConeRenderer extends IRenderTree {
  type: "cone";
  config: IConeRendererConfig;
}

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
  renderTree: IRenderTree;
}

export interface IPackshotConfig {
  width: number;
  height: number;
  /**
   * Root folder of the files we need, makes the configuration of file relative to root
   * This adds flexibility to:
   * - Switch from a url root to a file system folder without changing all relative path
   * - Makes it possible to add a layer in between for LOD (thumbs,quality medium)
   * 
  */

  root: string;
}

export interface IPackshot {
  name?: string;
  config: IPackshotConfig;
  layers: ILayer[];
}
