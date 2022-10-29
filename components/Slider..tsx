export function Slider({
    value,
    onChange,
}: {
    value: number;
    onChange(value: number): void;
}) {
    return (
        <>
            <input
                value={value}
                style={{ width: 50, marginRight: 5 }}
                onChange={(e) => {
                    const el = e.target as HTMLInputElement;
                    onChange(parseFloat(el.value) || 0)
                }}
            />
            <input
                value={value}
                min={-100}
                max={100}
                type="range"
                onChange={(e) => {
                    const el = e.target as HTMLInputElement;
                    onChange(parseFloat(el.value) || 0)
                }}
            />
        </>
    )
}
