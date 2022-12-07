import { IPackshot } from "../../src/IPackshot";

export const flowerPotPackshot: IPackshot = {
  name: "Flowerpot",
  config: {
    width: 3600,
    height: 3600,
  },
  layers: [
    {
      name: "Background",
      renderTree: {
        type: "image",
        config: {
          image: {
            name: "Background.png",
            url: "./products/Pot/Background.png",
          },
        },
      },
    },
    {
      name: "Cone",
      renderTree: {
        type: "mask",
        config: {
          image: {
            name: "Mask.png",
            url: "./products/Pot/Mask.png",
          },
        },
        children: [
          {
            type: "cone",
            config: {
              image: {
                name: "Spread3.jpg",
                url: "./products/Pot/Spread.jpg",
              },
              diameterTop : 9.2,
              diameterBottom: 6.3,
              height: 10,
              controlPoints: [
                [-0.53444445, -0.34111112],
                [-0.007777778, -0.34],
                [0.5277778, -0.35777777],
                [-0.34888887, 0.77111113],
                [-0.0044444446, 0.8422222],
                [0.35555556, 0.77111113],
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
