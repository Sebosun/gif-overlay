import type { JimpRead } from "../types/Jimp";
import { createCompositeJimp } from "./createComposite";
import type { GifStrategy } from "./GifCombiner";
import type { Placement } from "./placement";
import { getPositionsPredictable, getPositionsRandomized, getRandomPosition, type Positions } from "./positions";
import { getRatio } from "./ratio";

export interface TwoImagesStategyOpts {
  firstImage: JimpRead;
  secondImage: JimpRead;
  placement: Placement;
  randomizePositions: boolean
  ratio: number
  randomPlacement: boolean

}

export class GifCombinerTwoImagesStrategy implements GifStrategy {
  baseImage: JimpRead;
  overlayImage: JimpRead;
  placement: Placement;
  randomizePositions: boolean
  ratio: number

  randomPlacement = false

  constructor(options: TwoImagesStategyOpts) {
    this.baseImage = options.firstImage;
    this.overlayImage = options.secondImage;
    this.placement = options.placement;
    this.randomizePositions = options.randomizePositions
    this.ratio = options.ratio
    this.randomPlacement = options.randomPlacement
  }

  async run() {
    const scale = getRatio({
      baseElem: this.baseImage,
      overlayElem: this.overlayImage,
    });

    // dimensions after scaling will be done
    const overlayDimensions = {
      width: Math.floor(this.overlayImage.width * scale),
      height: Math.floor(this.overlayImage.height * scale)
    }

    let positions: Positions
    if (this.randomizePositions) {
      positions = getPositionsRandomized({ base: this.baseImage, overlay: overlayDimensions, placement: this.placement });
    } else {
      positions = getPositionsPredictable({ base: this.baseImage, overlay: overlayDimensions, placement: this.placement });
    }

    if (this.randomPlacement) {
      positions = getRandomPosition({ base: this.baseImage, overlay: overlayDimensions, placement: this.placement })
    }




    return createCompositeJimp({
      frame1: this.baseImage.bitmap,
      frame2: this.overlayImage.bitmap,
      positions: positions,
      scale: scale
    });
  }
}
