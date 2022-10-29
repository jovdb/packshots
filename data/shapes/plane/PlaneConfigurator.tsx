import { Slider } from "../../../components/Slider.";
import { IPlaneConfig } from "./PlaneData";

export function PlaneConfigurator({
    config,
    onChange,
}: {
    config: IPlaneConfig;
    onChange(config: IPlaneConfig): void;
}) {
    return (
        <table>
            <tbody>
                <tr>
                    <td>Width:</td>
                    <td>
                        <Slider value={config.width} onChange={(newWidth) => {
                            onChange({
                                ...config,
                                width: newWidth,
                            });
                        }} />
                    </td>
                </tr>
                <tr>
                    <td>Height:</td>
                    <td>
                        <Slider value={config.height} onChange={(newHeight) => {
                            onChange({
                                ...config,
                                height: newHeight,
                            });
                        }} />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
