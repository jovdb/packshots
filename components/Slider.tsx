export function Slider({
    value,
    min = -100,
    max = 100,
    step = 1,
    onChange,
    defaultValue,
}: {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange(value: number): void;
    defaultValue?: number;
}) {
    return (
        <>
            <input
                type="number"
                min={Math.min(min, value)}
                max={Math.max(max, value)}
                step={step}
                value={value}
                style={{ width: 57, marginRight: 5 }}
                onChange={(e) => {
                    const el = e.target as HTMLInputElement;
                    onChange(parseFloat(el.value) || 0);
                }}
            />
            <input
                value={value}
                min={Math.min(min, value)}
                max={Math.max(max, value)}
                step={step}
                type="range"
                style={{ position: "relative", transform: "translateY(4px)", width: 120}}
                onChange={(e) => {
                    const el = e.target as HTMLInputElement;
                    onChange(parseFloat(el.value) || 0);
                }}
            />
            {typeof defaultValue === "number" &&
                <button
                    onClick={() => { onChange(defaultValue); }}
                    style={{ minWidth: 30, marginLeft: 5, padding: 0 }}
                >
                    {defaultValue}
                </button>
            }
        </>
    )
}
