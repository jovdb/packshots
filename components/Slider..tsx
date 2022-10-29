export function Slider({
    value,
    onChange,
    defaultValue,
}: {
    value: number;
    onChange(value: number): void;
    defaultValue?: number;
}) {
    return (
        <>
            <input
                value={value}
                style={{ width: 50, marginRight: 5 }}
                onChange={(e) => {
                    const el = e.target as HTMLInputElement;
                    onChange(parseFloat(el.value) || 0);
                }}
            />
            <input
                value={value}
                min={-100}
                max={100}
                type="range"
                style={{ position: "relative", transform: "translateY(4px)" }}
                onChange={(e) => {
                    const el = e.target as HTMLInputElement;
                    onChange(parseFloat(el.value) || 0);
                }}
            />
            {typeof defaultValue === "number" &&
                <button
                    onClick={() => { onChange(defaultValue); }}
                    style={{ minWidth: 30, marginLeft: 5 }}
                >
                    {defaultValue}
                </button>
            }
        </>
    )
}
