import { createCompositeJimp } from "./createComposite";
import type { GifStrategy } from "./GifCombiner";
import type { JimpRead } from "./overlayGifImage";
import type { Placement } from "./positions";

export interface TwoImagesStategyOpts {
  firstImage: JimpRead;
  secondImage: JimpRead;
  placement: Placement;
}

export class GifCombinerTwoImagesStrategy implements GifStrategy {
  firstImage: JimpRead;
  secondImage: JimpRead;
  placement: Placement;

  constructor(options: TwoImagesStategyOpts) {
    this.firstImage = options.firstImage;
    this.secondImage = options.secondImage;
    this.placement = options.placement;
  }

  async run() {
    return createCompositeJimp(
      this.firstImage.bitmap,
      this.secondImage.bitmap,
      this.placement,
    );
  }
}
