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
        <div style={{ padding: 5, borderLeft: "1px solid #888", background: "#f8f8f8", height: "100%" }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? ">>" : "<<"}
            </button>
            <div style={{
                visibility: isOpen ? "visible" : "hidden",
                position: isOpen ? undefined : "absolute",
                minWidth: 280,
            }}>
                {children}
            </div>
        </div>
    );
}
