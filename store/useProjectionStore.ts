import create from 'zustand'
import { IProjectionData } from '../data/ProjectionData'
import { ConeData } from '../data/shapes/ConeData'

export const useProjectionStore = create<IProjectionData>((set) => ({
  shape: new ConeData({
    diameterTop: 10,
    height: 20,
  }),
  image: {
    shift: [0, 0],
    zoom: 1
  },
  isProductMaskEnabled: false,
}));
