import { IPackshot } from "../../src/IPackshot";

export const photobookLayers: IPackshot = {
    name: "PhotoBook",
    config: {
        width: 900,
        height: 900,
    },
    layers: [
        {
            name: "Background",
            renderTree: {
                type: "image",
                config: {
                    image: {
                        name: "Background.png",
                        url: "./products/Book/Background.png",
                    }
                },
            },
        },
        /*
        {
            name: "Spread",
            renderTree: {
                type: "mask",
                config: {
                    image: {
                        name: "Mask.,png",
                        url: "./products/Book/Mask.png",
                    }
                },
                children: [
                    {
                        type: "plane",
                        config: {
                            image: {
                                name: "Spread.jpg",
                                url: "./products/Book/Spread.jpg",
                            },
                            controlPoints: [
                                [-0.414, -0.499],
                                [0.612, -0.37],
                                [0.614, 0.68],
                                [-0.414, 0.412],
                            ],
                        },
                    },
                ]
            },
        }*/
        {
            name: "Spread",
            renderTree: {
                type: "plane",
                config: {
                    image: {
                        name: "Spread.jpg",
                        url: "./products/Book/Spread.jpg",
                    },
                    controlPoints: [
                        [-0.414, -0.499],
                        [0.612, -0.37],
                        [0.614, 0.68],
                        [-0.414, 0.412],
                    ],
                },
            },
        }
    ]
};