import type { Gif } from "gifwrap";
import type { JimpRead } from "./overlayGifImage";
import type { Placement } from "./positions";
import { GifCombinerTwoImagesStrategy } from "./GifCombinerTwoImagesStrategy";
import { GifCombinerMainStrategy } from "./GifCombinerMainStrategy";

export interface GifStrategy {
  run(): Promise<JimpRead | Gif>;
}

export interface CombinerOpts {
  gifPrimary: Gif | JimpRead;
  gifSecondary: Gif | JimpRead;
  placement: Placement;
}

export function jimpGuardType(gif: Gif | JimpRead): gif is JimpRead {
  return (gif as Gif).frames === undefined;
}

export class GifCombiner {
  gifPrimary: Gif | JimpRead;
  gifSecondary: Gif | JimpRead;
  placement: Placement;

  strategy!: GifStrategy;

  totalFrames!: number;

  aggregateImage!: Gif | JimpRead;
  elementImage!: Gif | JimpRead;

  constructor(options: CombinerOpts) {
    this.gifPrimary = options.gifPrimary;
    this.gifSecondary = options.gifSecondary;
    this.placement = options.placement;
    this.init();
  }

  init() {
    if (
      this.guardMyType(this.gifPrimary) &&
      this.guardMyType(this.gifSecondary)
    ) {
      this.strategy = new GifCombinerTwoImagesStrategy({
        firstImage: this.gifPrimary,
        secondImage: this.gifSecondary,
        placement: this.placement,
      });
      return;
    }

    if (this.guardMyType(this.gifPrimary)) {
      this.strategy = new GifCombinerMainStrategy({
        gifPrimary: this.gifSecondary as Gif,
        gifSecondary: this.gifPrimary,
        placement: this.placement,
      });
    } else {
      this.strategy = new GifCombinerMainStrategy({
        gifPrimary: this.gifPrimary,
        gifSecondary: this.gifSecondary,
        placement: this.placement,
      });
    }
  }

  guardMyType(gif: Gif | JimpRead): gif is JimpRead {
    return (gif as Gif).frames === undefined;
  }

  async run() {
    return await this.strategy.run();
  }
}
