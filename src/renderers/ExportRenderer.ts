import { IExportConfig } from "../components/config/ExportConfig";
import type { IRenderer } from "./IRenderer";


export class ExportRenderer implements IRenderer {
    constructor(
        private config: IExportConfig,
    ) {
    }

    public render(targetContext: CanvasRenderingContext2D) {
        if (this.config.isTransparent === false) return;
        targetContext.fillStyle = "#fff";
        targetContext.fillRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);
    }
}