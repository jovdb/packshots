import { IPackshot } from "../../src/IPackshot";

export const photobookPackshot: IPackshot = {
  name: "PhotoBook",
  config: {
    width: 900,
    height: 900,
    root: "./products/Book/",
  },
  layers: [
    {
      name: "Background",
      renderTree: {
        type: "image",
        config: {
          image: {
            name: "Background.png",
            url: "Background.png",
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
            name: "Mask.jpg",
            url: "Mask.jpg",
          },
          colorChannel: 2,
        },
        children: [
          {
            type: "plane",
            config: {
              image: {
                name: "Spread3.jpg",
                url: "Spread3.jpg",
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
            name: "Mask.jpg",
            url: "Mask.jpg",
          },
          colorChannel: 1,
        },
        children: [
          {
            type: "plane",
            config: {
              image: {
                name: "Spread2.jpg",
                url: "Spread2.jpg",
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
            name: "Mask.jpg",
            url: "Mask.jpg",
          },
          colorChannel: 0,
        },
        children: [
          {
            type: "plane",
            config: {
              image: {
                name: "Spread1.jpg",
                url: "Spread1.jpg",
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
