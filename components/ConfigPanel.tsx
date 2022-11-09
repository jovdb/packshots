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
            <div style={{
                visibility: isOpen ? "visible" : "hidden",
                position: isOpen ? undefined : "absolute",
                minWidth: 375,
            }}>
                {children}
            </div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "absolute",
                    top: 0,
                    transform: "translate(-100%, 10px)",
                    height: 32,
                    width: 32,
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                    cursor: "pointer",
                    background: "#888",
                    color: "rgb(238, 238, 238)",
                    border: "none",
                    //boxShadow: "0 0 3px rgba(0 0 0, 0.2)",
                }}
            >
                {isOpen ? ">>" : "<<"}
            </button>
        </div>
    );
}
