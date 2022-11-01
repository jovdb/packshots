export interface IRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export function getAspectRatio(rect: Pick<IRect, "width" | "height">) {
    if (rect.height === 0) return Infinity;
    return Math.abs(rect.width / rect.height);
}

export function fitRectTransform(rectToFit: IRect, inRect: IRect) {
    const aspectRatioParent = getAspectRatio(inRect);
    const aspectRatioChild = getAspectRatio(rectToFit);
    
    const scale = aspectRatioParent > aspectRatioChild
        ? inRect.height / rectToFit.width
        : inRect.width / rectToFit.width;

    const moveX = inRect.left + (inRect.width - (rectToFit.width * scale)) / 2;
    const moveY = inRect.top + (inRect.height - (rectToFit.height * scale)) / 2;

    return {
        x: moveX,
        y: moveY,
        scale,
    };
}