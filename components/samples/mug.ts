import { IPackshot } from "../../src/IPackshot";

export const mugPackshot: IPackshot = {
  name: "Mug",
  config: {
    width: 900,
    height: 900,
    root: "./products/Mug/",
  },
  layers: [
    {
      name: "Background",
      renderTree: {
        type: "image",
        config: {
          image: {
            name: "Mug.png",
            url: "Background.png",
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
            url: "Mask.png",
          },
        },
        children: [
          {
            type: "cone",
            config: {
              image: {
                name: "Spread3.jpg",
                url: "Spread.jpg",
              },
              controlPoints: [
                [-0.6683706155600259, -0.6204472745950229],
                [-0.04472837966090193, -0.5744409043187151],
                [0.5686900531902861, -0.630670907017522],
                [-0.6249201412018115, 0.4964856035031451],
                [-0.04472837966090193, 0.637060780875599],
                [0.5507987573885689, 0.519489032391923],
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
