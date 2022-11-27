import { ILayerConfig } from "../src/IPackshot";



export function LayerConfig({
    config, onChange
}: {
    config: ILayerConfig;
    onChange: (newConfig: ILayerConfig) => void;
}) {
    let composition: GlobalCompositeOperation | "disabled" | "normal";
    if (config.isDisabled)
        composition = "disabled";
    else if (!config.composition)
        composition = "normal";
    else
        composition = config.composition;

    return (
        <table style={{
            backgroundColor: "#ccc",
            boxShadow: "0 5px 8px rgba(0, 0, 0, 0.2) inset",
            borderBottom: "1px solid #666",
            marginBottom: 5,
            padding: 5,

            /** HACK */
            width: "calc(100% + 10px)",
            margin: -5,
        }}>
            <tbody>
                <tr>
                    <td>Composition:</td>
                    <td>
                        <select
                            value={composition}
                            onChange={(e) => {
                                const { value }  = e.target;
                                if (value === "disable") {
                                    onChange({
                                        ...config,
                                        isDisabled: true,
                                    });
                                } else if (value === "normal") {
                                    onChange({
                                        ...config,
                                        isDisabled: false,
                                        composition: undefined,
                                    });
                                } else {
                                    onChange({
                                        ...config,
                                        isDisabled: false,
                                        composition: value as GlobalCompositeOperation,
                                    });
                                }
                            }}
                            style={{ minWidth: 150 }}
                        >
                            <option value="disable">Disable</option>
                            <option value="normal">Normal</option>
                            <option value="multiply">Multiply</option>
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
