import { ILayerState } from "../../state/Layer";
import { IImageConfig } from "../config/ImageConfig";
import { IPlaneConfig } from "../config/PlaneConfig";

const background: ILayerState<IImageConfig> = {
    name: "Background",
    type: "image",
    config: {
        name: "Background.png",
        imageUrl: "./products/Pot/Background.png"
    },
};

const spread: ILayerState<IPlaneConfig> = {
    name: "Spread",
    type: "plane2",
    config: {
        camera: {
            position: [0, 0, 0],
            direction: [0, 0, 50],
            fieldOfViewInDeg: 75,
        },
        image: {
            name: "Spread2.png",
            imageUrl: "./products/Pot/Spread2.jpg"
        },
        plane: {
            width: 10,
            height: 10,
        }
    },
};

export const flowerPotLayers: ILayerState[] = [
    spread,
    background,
];
