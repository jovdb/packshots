import { ButtonHTMLAttributes, Children, CSSProperties, PropsWithChildren, useState } from "react";
import UpIcon from "../icons/up.svg";
import DownIcon from "../icons/down.svg";

export function Accordion({
    title,
    isExpanded = false,
    children,
    right,
    left,
    style,
    setIsExpanded,
}: PropsWithChildren<{
    title: string;
    isExpanded?: boolean;
    right?: any;
    left?: any;
    style?: CSSProperties;
    setIsExpanded?(value: boolean): void;
}>) {
    const isExpandable = !!setIsExpanded;
    return (
        <div>
            <AccordionBar
                style={{
                    padding: "0 0 0 10px",
                    minHeight: 33,
                    fontWeight: "bold",
                    cursor: isExpandable ? "pointer" : undefined,
                    userSelect: "none",
                    display: "flex",
                    alignItems: "center",
                    ...style,
                }}
                onClick={() => { isExpandable && setIsExpanded?.(!isExpanded); }}
            >
                <span style={{ display: isExpandable ? "inline-block" : "none", width: "1em", fill: "currentcolor" }}>
                    <DownIcon width={10} style={{ transform: `rotateZ(${isExpanded ? "-180deg" : "0" })`, transitionDuration: "0.3s" }}/>
                </span>
                <span style={{ display: "inline-flex" }}>{left}</span>
                <span style={{ flex: "1", padding: "0 5px" }}>{title}</span>
                <span style={{ display: "inline-flex" }}>{right}</span>
            </AccordionBar>
            {(isExpanded) && (
                <div>
                    {children}
                </div>
            )}
        </div>
    )
}


export const AccordionButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { children, ...buttonProps } = props;
    const { style = {}, onClick, ...restButtonProps } = buttonProps;
    return (
        <button
            style={{
                background: "transparent",
                color: "#eee",
                fill: "currentColor",
                padding: "5px 5px",
                // fontWeight: "bold",
                borderTop: "1px solid #444",
                border: "none",
                // boxShadow: "0 5px 5px rgba(0, 0, 0, 0.2)",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                cursor: "pointer",
                userSelect: "none",
                display: "flex",
                fontWeight: "bold",
                ...style,
            }}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(e);
            }}
            {...restButtonProps}
        >{children}</button>
    );
}


export const AccordionPanel = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <div
            style={{
                padding: 5,
                boxShadow: "0 5px 8px rgba(0, 0, 0, 0.2) inset",
                borderBottom: "1px solid #ccc",
                backgroundColor: "##e7e7e7",
                ...props.style || {},
            }}
        >
            {props.children}
        </div>
    );
}
export const AccordionBar = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
    4
    const { children, style, ...rest } = props;
    return (
        <div
            style={{
                background: "#888",
                color: "#eee",
                minHeight: 33,
                borderTop: "1px solid #444",
                boxShadow: "0 5px 5px rgba(0, 0, 0, 0.1) inset",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                ...style
            }}
            {...rest as any}
        >
            {children}
        </div>
    );
}
