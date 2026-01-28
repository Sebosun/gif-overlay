import type { Gif } from "gifwrap";
import { GifCombinerTwoImagesStrategy } from "./GifCombinerTwoImagesStrategy";
import { GifCombinerMainStrategy } from "./GifCombinerMainStrategy";
import type { Placement } from "./placement";
import type { JimpRead } from "../types/Jimp";

export interface GifStrategy {
  run(): Promise<JimpRead | Gif>;
}

export interface CombinerOpts {
  base: Gif | JimpRead;
  overlay: Gif | JimpRead;
  placement: Placement;
  randomizePositions: boolean
  randomPlacement?: boolean
  ratio?: number
}

export function jimpGuardType(gif: Gif | JimpRead): gif is JimpRead {
  return (gif as Gif).frames === undefined;
}

export class GifCombiner {
  base: Gif | JimpRead;
  overlay: Gif | JimpRead;
  placement: Placement;
  randomizePositions: boolean
  randomPlacement = false

  strategy!: GifStrategy;

  totalFrames!: number;

  aggregateImage!: Gif | JimpRead;
  elementImage!: Gif | JimpRead;
  ratio: number = 0.25

  constructor(options: CombinerOpts) {
    this.base = options.base;
    this.overlay = options.overlay;
    this.placement = options.placement;
    this.randomizePositions = options.randomizePositions
    if (options.ratio) {
      this.ratio = options.ratio
    }

    if (options.randomPlacement) {
      this.randomPlacement = options.randomPlacement
    }

    this.init();
  }

  init() {
    if (this.guardMyType(this.base) && this.guardMyType(this.overlay)) {
      this.strategy = new GifCombinerTwoImagesStrategy({
        firstImage: this.base,
        secondImage: this.overlay,
        placement: this.placement,
        randomizePositions: this.randomizePositions,
        ratio: this.ratio,
        randomPlacement: this.randomPlacement
      });
      return;
    }

    this.strategy = new GifCombinerMainStrategy({
      gifPrimary: this.base,
      gifSecondary: this.overlay,
      placement: this.placement,
      randomizePositions: this.randomizePositions,
      ratio: this.ratio,
      randomPlacement: this.randomPlacement
    });
  }

  guardMyType(gif: Gif | JimpRead): gif is JimpRead {
    return (gif as Gif).frames === undefined;
  }

  async run() {
    return await this.strategy.run();
  }
}
