import {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
} from "react";
import DownIcon from "../icons/down.svg";
import { useEvent } from "../src/hooks/useEvent";

const useEditableContent = (
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

export function Accordion({
  title,
  isExpanded = false,
  isTitleEditable = false,
  children,
  right,
  left,
  style,
  onTitleClick,
  onTitleChange,
  onExpandClick,
}: PropsWithChildren<{
  title: string;
  isExpanded?: boolean;
  isTitleEditable?: boolean;
  right?: ReactNode;
  left?: ReactNode;
  style?: CSSProperties;
  onTitleClick?(): void;
  onTitleChange?(newTitle: string): void;
  onExpandClick?(): void;
}>) {
  const isExpandable = !!onExpandClick;

  const contentEditableRef = useRef<HTMLSpanElement>(null);
  useEditableContent(contentEditableRef, title, (html) => {
    if (!isTitleEditable) return;
    const newTitle = html.replaceAll("\n", "").replaceAll("\r", "").replaceAll("\t", "");
    onTitleChange?.(newTitle);
  });

  return (
    <div>
      <AccordionBar
        style={{
          padding: "0 0 0 10px",
          fontWeight: "bold",
          cursor: isExpandable ? "pointer" : undefined,
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          ...style,
        }}
        onClick={() => {
          (onTitleClick || onExpandClick)?.();
        }}
      >
        <span style={{ display: isExpandable ? "inline-block" : "none", width: "1em", fill: "currentcolor" }}>
          <DownIcon
            width={10}
            style={{ transform: `rotateZ(${isExpanded ? "-180deg" : "0"})`, transitionDuration: "0.3s" }}
            onClick={(e: Event) => {
              if (onExpandClick) {
                e.stopPropagation();
                onExpandClick();
              }
            }}
          />
        </span>
        <span style={{ display: "inline-flex" }}>{left}</span>
        <span
          ref={contentEditableRef}
          style={{ flex: "1", padding: "0 5px" }}
          contentEditable={isTitleEditable}
          spellCheck={false}
        >
        </span>
        <span style={{ display: "inline-flex" }}>{right}</span>
      </AccordionBar>
      {(isExpanded) && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
}

export const AccordionButton = (props: { isActive?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, isActive = true, onClick, ...rest } = props;
  return (
    <button
      className={`accordion-button ${isActive ? "" : "accordion-button--off"}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      {...rest}
    >
      <style jsx>
        {`
                .accordion-button {
                    background: transparent;
                    fill: currentColor;
                    padding: 5px 5px;
                    border-top: 1px solid #444;
                    border: none;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    user-select: "none";
                    display: flex;
                    font-weight: bold;
                    color: #eee;
                }
                .accordion-button--off {
                    opacity: 0.5;
                }
                .accordion-button:hover {
                    color: #fff;
                }
            `}
      </style>
      {children}
    </button>
  );
};

export const AccordionPanel = (props: HTMLAttributes<HTMLDivElement>) => {
  const { children, ...rest } = props;
  return (
    <div
      className="accordion-panel"
      {...rest}
    >
      <style jsx>
        {`
                .accordion-panel {
                    padding: 5px;
                    box-shadow: 0 5px 8px rgba(0, 0, 0, 0.2) inset;
                    border-bottom: 1px solid #ccc;
                    background-color:"##e7e7e7;
                }
            `}
      </style>
      {children}
    </div>
  );
};
export const AccordionBar = (props: HTMLAttributes<HTMLDivElement>) => {
  const { children, ...rest } = props;
  return (
    <div
      className="accordion-bar"
      {...rest}
    >
      <style jsx>
        {`
                .accordion-bar {
                    background: #888;
                    color: #eee;
                    min-height: 33px;
                    border-top: 1px solid #444;
                    box-shadow: 0 5px 5px rgba(0, 0, 0, 0.1) inset;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
                }
            `}
      </style>
      {children}
    </div>
  );
};
