import React, { useRef, useState } from "react";

export function ImageSelection({
    onSelect,
    onSelectError = (message) => alert(message),
}: {
    onSelect(data: { url: string, name: string }): void;
    onSelectError?(error: string): void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const max = 4 * 1024 * 1024;
    return (
        <span>
            <button onClick={() => inputRef.current && inputRef.current.click()}>File</button>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ visibility: "hidden", position: "absolute" }}
                onChange={(e) => {
                    const el = e.target as HTMLInputElement;
                    const file = el.files?.item(0);
                    if (!file) return;
                    if (file.size > max) {
                        const maxSizeString = Math.ceil(max / 1024 / 102.4) / 10;
                        const currentSizeString = Math.ceil(file.size / 1024 / 102.4) / 10;
                        const message = `file '${file.name}' is too large: ${currentSizeString} MB (maximum: ${maxSizeString} MB)`;
                        onSelectError(message);
                        return;
                    }
                    onSelect({
                        name: file.name,
                        url: URL.createObjectURL(file),
                    })
                }}
            />
        </span>
    )
}
