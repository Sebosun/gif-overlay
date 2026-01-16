import type { Gif } from "gifwrap";
import type { JimpRead } from "./overlayGifImage";
import type { Placement } from "./positions";
import { GifCombinerTwoImagesStrategy } from "./GifCombinerTwoImagesStrategy";
import { GifCombinerMainStrategy } from "./GifCombinerMainStrategy";

export interface GifStrategy {
  run(): Promise<JimpRead | Gif>;
}

export interface CombinerOpts {
  base: Gif | JimpRead;
  overlay: Gif | JimpRead;
  placement: Placement;
}

export function jimpGuardType(gif: Gif | JimpRead): gif is JimpRead {
  return (gif as Gif).frames === undefined;
}

export class GifCombiner {
  base: Gif | JimpRead;
  overlay: Gif | JimpRead;
  placement: Placement;

  strategy!: GifStrategy;

  totalFrames!: number;

  aggregateImage!: Gif | JimpRead;
  elementImage!: Gif | JimpRead;

  constructor(options: CombinerOpts) {
    this.base = options.base;
    this.overlay = options.overlay;
    this.placement = options.placement;
    this.init();
  }

  init() {
    if (this.guardMyType(this.base) && this.guardMyType(this.overlay)) {
      this.strategy = new GifCombinerTwoImagesStrategy({
        firstImage: this.base,
        secondImage: this.overlay,
        placement: this.placement,
      });
      return;
    }

    this.strategy = new GifCombinerMainStrategy({
      gifPrimary: this.base,
      gifSecondary: this.overlay,
      placement: this.placement,
    });
  }

  guardMyType(gif: Gif | JimpRead): gif is JimpRead {
    return (gif as Gif).frames === undefined;
  }

  async run() {
    return await this.strategy.run();
  }
}
