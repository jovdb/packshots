import { IPackshotConfig } from "../IPackshot";
import { PackshotRoot } from "../stores/app";


/**
 * The IRenderResult is useful for nested renderings
 * When you expect child renderings, like Masking, ColorEffects
 */
export interface IRenderResult {
  /** The context on which the child nodes should draw */
  childContext?: CanvasRenderingContext2D | undefined;

  /** A function that will be executed after this node with it children is rendered. */
  afterChildren?: () => void;
}

export interface IRenderer {
  /**
   * Can return a function to call after the children are rendered
   * Can be used for nested renders like a mask renderer
   */
  render(
    drawOnContext: CanvasRenderingContext2D,
    config: {},
    packshotConfig: IPackshotConfig,
    isDragging: boolean,
  ): IRenderResult | undefined | void;

  // Prepare this renderer with the specified data
  // If missing or returns undefined, no async data is needed or already available.
  loadAsync?(
    config: {},
    root: PackshotRoot,
    packshotConfig: IPackshotConfig,
  ): void | Promise<void>;

  dispose?(): void;
}
