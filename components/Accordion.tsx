import { ButtonHTMLAttributes, Children, PropsWithChildren, useState } from "react";

export function Accordion({
    title,
    isExpandedByDefault = false,
    children,
    right,
}: PropsWithChildren<{
    title: string;
    isExpandedByDefault?: boolean;
    right?: any;
}>) {
    const [isExpanded, setIsExpanded] = useState(isExpandedByDefault);
    return (
        <div>
            <div
                style={{
                    background: "#888",
                    color: "#eee",
                    padding: "0 0 0 10px",
                    minHeight: 33,
                    fontWeight: "bold",
                    borderTop: "1px solid #444",
                    boxShadow: "0 5px 5px rgba(0, 0, 0, 0.1) inset",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                    cursor: "pointer",
                    userSelect: "none",
                    display: "flex",
                    alignItems: "center",
                }}
                onClick={() => { setIsExpanded(!isExpanded); }}
            >
                <span style={{ display: "inline-block", width: "1em" }}>
                    {isExpanded ? "−" : "+"}
                </span>
                <span style={{ flex: "1" }}>{title}</span>
                <span style={{ display: "inline-flex" }}>{right}</span>
            </div>
            {isExpanded && (
                <div>
                    {children}
                </div>
            )}
        </div>
    )
}


export const AccordionButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            style={{
                background: "transparent",
                color: "#eee",
                padding: "5px 10px",
                fontWeight: "bold",
                borderTop: "1px solid #444",
                border: "none",
                // boxShadow: "0 5px 5px rgba(0, 0, 0, 0.2)",
                borderLeft: "1px solid rgba(0, 0, 0, 0.3)",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                cursor: "pointer",
                userSelect: "none",
                display: "flex",
                ...props.style || {},
            }}
            onClick={(e) => {
                e.stopPropagation();
                props.onClick?.(e);
            }}
        >{props.children}</button>
    );
}


export const AccordionPanel = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <div
            style={{
                padding: 5,
                boxShadow: "0 5px 5px rgba(0, 0, 0, 0.1) inset",
                ...props.style || {},
            }}
        >
            {props.children}
        </div>
    );
}
