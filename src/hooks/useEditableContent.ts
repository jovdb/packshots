import { RefObject, useRef, useEffect } from "react";
import { useEvent } from "./useEvent";

export const useEditableContent = (
    ref: RefObject<HTMLElement>,
    html: string,
    onChange: (html: string) => void,
  ) => {
    /** To prevent updates when value is already OK */
    const lastHtml = useRef<string>("");
  
    // Notify on Change
    const onInputChange = useEvent(
      () => {
        const curHtml = ref.current?.innerHTML || "";
        if (curHtml !== lastHtml.current) {
          onChange(curHtml);
        }
        lastHtml.current = html;
      },
    );
  
    // update Content
    useEffect(() => {
      if (!ref.current) return;
      if (ref.current.innerHTML === html) return;
      ref.current.innerHTML = html;
    }, [html, ref]);
  
    // Add event listener
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      el.addEventListener("input", onInputChange);
      return () => el.removeEventListener("input", onInputChange);
    }, [onInputChange, ref]);
  };
  