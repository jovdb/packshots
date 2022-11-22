
/*
╔═════════════════╗    ╔═════════════════╗       ╔═══════════════════╗
║ Packshot        ║    ║ Layer           ║   ┌──→║ ImageRenderer     ║
╟─────────────────╢    ╟─────────────────╢   │   ╟───────────────────╢
║ -name?          ║    ║ -name?          ║   │   ║ -type: "image"    ║
║ -config         ║    ║ -config         ║   │   ║ -config           ║
║   -width        ║    ║   -isDisabled?  ║   │   ║   -image          ║
║   -height       ║    ║   -isExpanded?  ║   │   ╚═══════════════════╝
║ -layers:        ║    ║ -renderer   ────║───┤   ╔═══════════════════╗
║  ┌───────┐      ║    ╚═════════════════╝   ├──→║ PlaneRenderer     ║
║  │ Layer │ ┐    ║                          │   ╟───────────────────╢
║  └───────┘ │ ┐  ║                          │   ║ -type: "plane"    ║
║    └───────┘ │  ║                          │   ║ -config           ║
║      └───────┘  ║                          │   ║   -image          ║
╚═════════════════╝                          │   ║   -controlPoints  ║
                                             │   ╚═══════════════════╝
                                             │   ╔═══════════════════╗
                                             ├──→║ ConeRenderer      ║
                                             │   ╟───────────────────╢
                                             │   ║ -type: "cone"     ║
                                             │   ║ -config           ║
                                             │   ║   -image          ║
                                             │   ║   -controlPoints  ║
                                             │   ╚═══════════════════╝
                                             │   ╔═══════════════════╗
                                             └──→║ MaskRenderer      ║
                                                 ╟───────────────────╢
                                                 ║ -type: "mask"     ║
                                                 ║ -config           ║
                                                 ║   -image          ║
                                                 ║ -children         ║
                                                 ╚═══════════════════╝
*/

export interface IImageConfig {
    name?: string;
    url: string;
}

export interface IRendererConfig {
    isDisabled?: boolean;
}

export interface IRenderer {
    name?: string;
    type: string;
    children?: Renderers[];
}

export interface IImageRenderer extends IRenderer {
    type: "image";
    config: IRendererConfig & {
        image: IImageConfig;
    };
}

export interface IPlaneRenderer extends IRenderer {
    type: "plane";
    config: IRendererConfig & {
        image: IImageConfig;
        controlPoints: [number, number][];
    };
}

export interface IMaskRenderer extends IRenderer {
    type: "mask";
    config: IRendererConfig & {
        image: IImageConfig;
    };
    children: Renderers[];
}

export type Renderers = IImageRenderer | IMaskRenderer | IPlaneRenderer;

export interface ILayer {
    name?: string;
    config?: {
        isDisabled?: boolean;
        isExpanded?: boolean;
    }
    renderer: Renderers;
}

export interface IPackshotConfig {
    width: number;
    height: number;
}

export interface IPackshot{
    name?: string;
    config: IPackshotConfig,
    layers: ILayer[];
}

export const photobookLayers: IPackshot = {
    name: "PhotoBook",
    config: {
        width: 900,
        height: 900,
    },
    layers: [
        {
            name: "Background",
            renderer: {
                type: "image",
                config: {
                    image: {
                        name: "Background.png",
                        url: "./products/Book/Background.png",
                    }
                },
            },
        },
        {
            renderer: {
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
        }
    ]
};