import { PropsWithChildren } from "react";
import ArrowLeft from "../icons/dbl-arrow-left.svg";
import ArrowRight from "../icons/dbl-arrow-right.svg";

export function ConfigPanel({
  isOpen,
  setIsOpen,
  children,
}: PropsWithChildren<{
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
}>) {
  return (
    <div
      style={{
        borderLeft: "1px solid #888",
        background: "#f8f8f8",
        height: "100%",
        fontSize: "0.8em",
        boxShadow: "0px 0px 10px rgb(0 0 0 / 20%)",
        overflowY: "scroll",
      }}
    >
      <div
        style={{
          visibility: isOpen ? "visible" : "hidden",
          position: isOpen ? undefined : "absolute",
          minWidth: 375,
        }}
      >
        {children}
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "absolute",
          top: 0,
          transform: "translate(-100%, 10px)",
          paddingTop: 4,
          height: 32,
          width: 30,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          cursor: "pointer",
          background: "#888",
          color: "rgb(238, 238, 238)",
          fill: "currentcolor",
          border: "none",
          // boxShadow: "0 0 3px rgba(0 0 0, 0.2)",
        }}
      >
        {isOpen ? <ArrowRight width={16} /> : <ArrowLeft width={16} />}
      </button>
    </div>
  );
}
