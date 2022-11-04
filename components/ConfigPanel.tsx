import React, { PropsWithChildren, useRef, useState } from "react";

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
                boxShadow :"0px 0px 10px rgb(0 0 0 / 20%)",
                overflowY: "scroll",
            }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? ">>" : "<<"}
            </button>
            <div style={{
                visibility: isOpen ? "visible" : "hidden",
                position: isOpen ? undefined : "absolute",
                minWidth: 375,
            }}>
                {children}
            </div>
        </div>
    );
}
