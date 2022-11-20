import { ConfigComponent } from "./factory";

export interface IExportConfig {
    width: number;
    height: number;
    isTransparent: boolean;
}

export const defaultExportConfig: IExportConfig = {
    width: 900,
    height: 900,
    isTransparent: true,
};

export const ExportConfig: ConfigComponent<IExportConfig> = ({
    config,
    onChange,
}) => {
    const {
        width = defaultExportConfig.width,
        height = defaultExportConfig.height,
        isTransparent = true,
    } = config || {};

    return (
        <fieldset>
            <legend>Export dimentions</legend>
            <table style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        <td>Width:</td>
                        <td>
                            <input
                                type="number"
                                value={width}
                                min={1}
                                step={1}
                                style={{ width: 60 }}
                                onChange={(e) => {
                                    const newValue = parseFloat(e.target.value) || 0;
                                    onChange({
                                        ...config,
                                        width: newValue,
                                    });
                                }}
                            />
                            &nbsp;px
                        </td>
                    </tr>
                    <tr>
                        <td>Height:</td>
                        <td>
                            <input
                                type="number"
                                value={height}
                                min={1}
                                step={1}
                                style={{ width: 60 }}
                                onChange={(e) => {
                                    const newValue = parseFloat(e.target.value) || 0;
                                    onChange({
                                        ...config,
                                        height: newValue,
                                    });
                                }}
                            />
                            &nbsp;px
                        </td>
                    </tr>
                    <tr>
                        <td>Transaprent:</td>
                        <td>
                            <input
                                type="checkbox"
                                checked={isTransparent}
                                onChange={(e) => {
                                    onChange({
                                        ...config,
                                        isTransparent: e.target.checked,
                                    });
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2} style={{ textAlign: "right" }}>
                            <button onClick={() => alert("todo")}>Export as {isTransparent ? "PNG" : "JPG"}</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </fieldset>
    );
}