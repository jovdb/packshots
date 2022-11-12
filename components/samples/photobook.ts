import { ILayerConfig } from "../../src/layers/ILayerConfig";
import { IImageConfig } from "../config/ImageConfig";
import { IPlaneConfig } from "../config/PlaneConfig";
import { IPlaneConfig2 } from "../config/PlaneConfig2";

const background: ILayerConfig<IImageConfig> = {
    name: "Background",
    type: "image",
    config: {
        name: "Background.png",
        imageUrl: "./products/Book/Background.png"
    },
};

const spread: ILayerConfig<IPlaneConfig2> = {
    name: "Spread",
    type: "plane3",
    config: {
        image: {
            name: "Spread.jpg",
            imageUrl: "./products/Book/Spread.jpg"
        },
        controlPoints: [
            [-0.8, -0.8],
            [0.8, -0.8],
            [-0.8, 0.8],
            [0.8, 0.8],
        ],
    },
};

export const photobookLayers: ILayerConfig[] = [
    background,
    spread,
];