"use client";

// source: https://gist.github.com/morajabi/523d7a642d8c0a2f71fcfa0d8b3d2846
import { useLayoutEffect, useCallback, useState } from "react";

export interface IRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function getRect<T extends HTMLElement>(element?: T | null): IRect {
  return element?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
}

export function useElementSize<T extends HTMLElement>(
  ref: React.RefObject<T>
): IRect {
  const [rect, setRect] = useState<IRect>(
    () => getRect(ref?.current),
  );

  const handleResize = useCallback(() => {
    if (!ref.current) return;
    setRect(getRect(ref.current)); // Update client rect
  }, [ref]);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    handleResize();

    // @ts-ignore
    if (typeof ResizeObserver === "function") {
      let resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(element);
      return () => {
        if (!resizeObserver) return;
        resizeObserver.disconnect();
        (resizeObserver as any) = null;
      };
    }
  }, [handleResize, ref]);

  return rect;
}
