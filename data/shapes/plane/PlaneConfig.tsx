import create from "zustand";
import { Slider } from "../../../components/Slider";

export interface IPlaneConfig {
    width: number;
    height: number;
}

// TODO: make something shape agnostic
export const usePlaneConfig = create<IPlaneConfig>(() => ({
    width: 10,
    height: 10,
}));

export function PlaneConfig() {

    const planeConfig = usePlaneConfig();
    return (
        <>
            <fieldset>
                <legend>Physical dimensions</legend>
                <table style={{ width: "100%" }}>
                    <tbody>
                        <tr>
                            <td>Width:</td>
                            {/*
                                <td>
                                    <Slider
                                        min={0}
                                        max={200}
                                        defaultValue={10}
                                        step={0.1}
                                        value={planeConfig.width}
                                        onChange={(newWidth) => {
                                            usePlaneConfig.setState({
                                                width: newWidth,
                                            })
                                        }}
                                    />
                                </td>
                                    */}
                                <td>
                                <input
                                    type="number"
                                    value={planeConfig.height}
                                    min={0}
                                    max={200}
                                    step={0.1}
                                    style={{ width: 60 }}
                                    onChange={(e) => {
                                        const newValue = parseFloat(e.target.value) || 0;
                                        usePlaneConfig.setState({
                                            width: newValue,
                                        })
                                    }}
                                />
                                &nbsp;cm
                            </td>
                        </tr>
                        <tr>
                            <td>Height:</td>
                            {/*
                            <td>
                                <Slider
                                    value={planeConfig.height}
                                    min={0}
                                    max={200}
                                    step={0.1}
                                    defaultValue={10}
                                    onChange={(newHeight) => {
                                        usePlaneConfig.setState({
                                            height: newHeight,
                                        })
                                    }}
                                />
                            </td>
                            */}
                            <td>
                                <input
                                    type="number"
                                    value={planeConfig.height}
                                    min={0}
                                    max={200}
                                    step={0.1}
                                    style={{ width: 60 }}
                                    onChange={(e) => {
                                        const newValue = parseFloat(e.target.value) || 0;
                                        usePlaneConfig.setState({
                                            height: newValue,
                                        })
                                    }}
                                />
                                &nbsp;cm
                            </td>
                        </tr>
                    </tbody>
                </table>
            </fieldset>
            <fieldset>
                <legend>Spread</legend>
            </fieldset>
            <fieldset>
                <legend><input type="checkbox" style={{transform: "translate(-2px, 2px)"}}/>Mask </legend>
            </fieldset>
        </>
    );
}
