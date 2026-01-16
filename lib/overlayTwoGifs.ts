import { Jimp, type Bitmap } from "jimp";
import { GifFrame, GifCodec, Gif, GifUtil, type JimpBitmap } from "gifwrap";
import { getPositions, type Placement } from "./positions";
import { getRatio } from "./ratio";
import type { JimpRead } from "./overlayGifImage";

interface CombinerOpts {
  gifPrimary: Gif | JimpRead;
  gifSecondary: Gif | JimpRead;
  placement: Placement;
}

interface TwoImagesStategyOpts {
  firstImage: JimpRead;
  secondImage: JimpRead;
  placement: Placement;
}

interface GifStrategy {
  run(): Promise<JimpRead | Gif>;
}

export function jimpGuardType(gif: Gif | JimpRead): gif is JimpRead {
  return (gif as Gif).frames === undefined;
}

export function createComposite(
  frame1: JimpBitmap,
  frame2: JimpBitmap,
  placement: Placement,
): JimpRead {
  const scale = getRatio(frame1, frame2);
  const jimpFrameAggregate = new Jimp(frame1).clone();
  const jimpFrameElement = new Jimp(frame2).clone();

  if (scale !== 1) {
    jimpFrameElement.scale(scale);
  }

  const { x, y } = getPositions(
    placement,
    jimpFrameAggregate,
    jimpFrameElement,
  );

  const composite = jimpFrameAggregate.composite(
    jimpFrameElement,
    x,
    y,
  ) as JimpRead;
  return composite;
}

class TwoImagesStrategy implements GifStrategy {
  firstImage: JimpRead;
  secondImage: JimpRead;
  placement: Placement;

  constructor(options: TwoImagesStategyOpts) {
    this.firstImage = options.firstImage;
    this.secondImage = options.secondImage;
    this.placement = options.placement;
  }

  async run() {
    return createComposite(
      this.firstImage.bitmap,
      this.secondImage.bitmap,
      this.placement,
    );
  }
}

interface MainStrategyOpts {
  gifPrimary: Gif;
  gifSecondary: Gif | JimpRead;
  placement: Placement;
}

class GifCombinerMainStrategy implements GifStrategy {
  placement: Placement;

  totalFrames!: number;

  aggregateImage!: Gif | JimpRead;
  elementImage!: Gif | JimpRead;

  constructor(options: MainStrategyOpts) {
    this.placement = options.placement;
    this.init(options);
  }

  jimpReadGuard(gif: Gif | JimpRead): gif is JimpRead {
    return (gif as Gif).frames === undefined;
  }

  init(options: MainStrategyOpts) {
    const { gifPrimary, gifSecondary } = options;

    const primarySize = gifPrimary.height * gifPrimary.width;
    const secondarySize = gifSecondary.height * gifSecondary.width;

    // gifPrimary.usesTransparency -- if at least one frame contains one transparent pixel

    if (primarySize > secondarySize) {
      this.aggregateImage = gifPrimary;
      this.elementImage = gifSecondary;
    } else {
      this.aggregateImage = gifSecondary;
      this.elementImage = gifPrimary;
    }

    if (this.jimpReadGuard(gifSecondary)) {
      this.totalFrames = gifPrimary.frames.length;
      return;
    }

    this.totalFrames =
      gifPrimary.frames.length > gifSecondary.frames.length
        ? gifPrimary.frames.length
        : gifSecondary.frames.length;
  }

  getIndividualFrame(i: number) {
    let aggregateBitmap: Bitmap | undefined = undefined;
    let elementBitmap: Bitmap | undefined = undefined;
    let delay: undefined | number = undefined;

    if (!this.jimpReadGuard(this.aggregateImage)) {
      let idx = i;
      if (i >= this.aggregateImage.frames.length) {
        idx = i % (this.aggregateImage.frames.length - 1); // modulo so it wraps, -1 cause its an array
      }
      const frame = this.aggregateImage.frames[idx];
      if (frame) {
        aggregateBitmap = frame.bitmap;
        delay = frame.delayCentisecs;
      } else {
        console.log("No frame", this.aggregateImage.frames.length, i, idx);
      }
    } else {
      aggregateBitmap = this.aggregateImage.bitmap;
    }

    if (!this.jimpReadGuard(this.elementImage)) {
      let idx = i;
      if (i >= this.elementImage.frames.length) {
        idx = i % (this.elementImage.frames.length - 1); // modulo so it wraps, -1 cause its an array
      }
      const frame = this.elementImage.frames[idx];
      if (frame) {
        elementBitmap = frame.bitmap;
        if (!delay) {
          delay = frame.delayCentisecs;
        }
      } else {
        console.log("No frame", this.elementImage.frames.length, i, idx);
      }
    } else {
      elementBitmap = this.elementImage.bitmap;
    }

    if (!aggregateBitmap || !elementBitmap) {
      throw new Error("No frames were found...");
    }

    if (!delay) {
      delay = 10;
    }

    return [aggregateBitmap, elementBitmap, delay] as const;
  }

  async loopAndCombine() {
    const acc = [] as GifFrame[];

    for (let i = 0; i < this.totalFrames; i++) {
      const [aggregateBitmap, elementBitmap, delay] =
        this.getIndividualFrame(i);

      if (aggregateBitmap && elementBitmap) {
        const composite = createComposite(
          aggregateBitmap,
          elementBitmap,
          this.placement,
        );
        acc.push(
          new GifFrame(composite.bitmap, {
            delayCentisecs: delay,
          }),
        );
      }
    }

    return acc;
  }

  async run(): Promise<Gif> {
    const codec = new GifCodec();
    const framesAcc = await this.loopAndCombine();

    console.time("Quantizing");
    GifUtil.quantizeDekker(framesAcc, 256); // quantize the image
    // TODO: need to somehow improve this, its slow as fuuuck
    console.timeEnd("Quantizing");

    const encodedGif = await codec.encodeGif(framesAcc, { loops: 0 });
    return encodedGif;
  }
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
    console.log(options.placement);
    this.init();
  }

  init() {
    if (
      this.guardMyType(this.gifPrimary) &&
      this.guardMyType(this.gifSecondary)
    ) {
      this.strategy = new TwoImagesStrategy({
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
