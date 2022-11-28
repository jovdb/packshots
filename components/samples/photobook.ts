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
          },
        },
      },
    },

    {
      name: "Page 3",
      renderTree: {
        type: "mask",
        config: {
          image: {
            name: "Mask-Page3.png",
            url: "./products/Book/Mask-Page3.png",
          },
        },
        children: [
          {
            type: "plane",
            config: {
              image: {
                name: "Spread3.jpg",
                url: "./products/Book/Spread3.jpg",
              },
              controlPoints: [
                [-0.414, -0.499],
                [0.71, -0.425],
                [0.71, 0.56],
                [-0.414, 0.412],

              ],
            },
          },
        ],
      },
      config: {
        composition: "multiply",
      },
    },
    {
        name: "Page 2",
        renderTree: {
          type: "mask",
          config: {
            image: {
              name: "Mask-Page2.png",
              url: "./products/Book/Mask-Page2.png",
            },
          },
          children: [
            {
              type: "plane",
              config: {
                image: {
                  name: "Spread2.jpg",
                  url: "./products/Book/Spread2.jpg",
                },
                controlPoints: [
                  [-0.414, -0.499],
                  [0.612, -0.37],
                  [0.614, 0.68],
                  [-0.414, 0.412],
                ],
              },
            },
          ],
        },
        config: {
          composition: "multiply",
        },
      },
    {
      name: "Page 1",
      renderTree: {
        type: "mask",
        config: {
          image: {
            name: "Mask-Page1.png",
            url: "./products/Book/Mask-Page1.png",
          },
        },
        children: [
          {
            type: "plane",
            config: {
              image: {
                name: "Spread1.jpg",
                url: "./products/Book/Spread1.jpg",
              },
              controlPoints: [
                [-1.4, -0.499],
                [-0.414, -0.499],
                [-0.414, 0.412],
                [-1.4, 0.412],
              ],
            },
          },
        ],
      },
      config: {
        composition: "multiply",
      },
    },
  ],
};
