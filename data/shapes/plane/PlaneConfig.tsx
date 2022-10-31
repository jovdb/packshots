import create from "zustand";
import { Slider } from "../../../components/Slider";

// TODO: make something shape agnostic
export const usePlaneConfig = create(() => ({
    width: 10,
    height: 10,
}));


export function PlaneConfig() {

    const planeConfig = usePlaneConfig();
    return (
        <table>
            <tbody>
                <tr>
                    <td>Width:</td>
                    <td>
                        <Slider
                            min={0}
                            max={200}
                            defaultValue={10}
                            value={planeConfig.width}
                            onChange={(newWidth) => {
                                usePlaneConfig.setState({
                                    width: newWidth,
                                })
                            }}
                        />
                    </td>
                </tr>
                <tr>
                    <td>Height:</td>
                    <td>
                        <Slider
                            value={planeConfig.height}
                            min={0}
                            max={200}
                            defaultValue={10}
                            onChange={(newHeight) => {
                                usePlaneConfig.setState({
                                    height: newHeight,
                                })
                            }}
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
