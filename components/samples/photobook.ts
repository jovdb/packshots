import { ILayerConfig } from "../../src/layers/ILayerConfig";
import { IImageConfig } from "../config/ImageConfig";
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
    type: "plane",

    config: {
        image: {
            name: "Spread.jpg",
            imageUrl: "./products/Book/Spread.jpg",
        },
        controlPoints: [
            [-0.414, -0.499],
            [0.612, -0.37],
            [0.614, 0.68],
            [-0.414, 0.412],
        ],
    },

    mask: {
        name: "Mask.jpg",
        imageUrl: "./products/Book/Mask.png",
    },
};

export const photobookLayers: ILayerConfig[] = [
    background,
    spread,
];
