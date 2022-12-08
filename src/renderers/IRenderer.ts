import { IPackshotConfig } from "../IPackshot";

export interface IRenderResult {
  /**
   * The context on which the childs nodes should draw
   * This previous draw context is restored after this node.
   */
  nextContext?: CanvasRenderingContext2D | undefined;

  /** A function that will executed after this node with it children is rendered. */
  afterChildren?: () => void;
}
export interface IRenderer {
  /**
   * Returns a function to call after the children are rendered
   * Can be used for nested renders like a mask renderer
   */
  render(
    drawOnContext: CanvasRenderingContext2D,
    config: {},
    packshotConfig: IPackshotConfig,
    isDragging: boolean,
  ): IRenderResult | undefined | void;

  // Prepare this renderer with the specified data
  // If missing or returns undefined, no async data is needed are already available.
  loadAsync?(config: {}, packshotConfig: IPackshotConfig): void | Promise<void>;

  dispose?(): void;
}
