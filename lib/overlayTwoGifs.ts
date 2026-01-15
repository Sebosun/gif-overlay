import { Jimp, type Bitmap } from "jimp";
import { GifFrame, GifCodec, Gif, GifUtil, type JimpBitmap } from "gifwrap";
import { getPositions, type Placement } from "./positions";
import { getRatio } from "./ratio";
import type { JimpRead } from "./overlayGifImage";

interface CombinerOpts {
  gifPrimary: Gif;
  gifSecondary: Gif | JimpRead;
  placement: Placement;
}

export class GifCombiner {
  gifPrimary: Gif;
  gifSecondary: Gif | JimpRead;
  placement: Placement;

  totalFrames!: number;

  aggregateImage!: Gif | JimpRead;
  elementImage!: Gif | JimpRead;

  constructor(options: CombinerOpts) {
    this.gifPrimary = options.gifPrimary;
    this.gifSecondary = options.gifSecondary;
    this.placement = options.placement;

    this.init();
  }

  guardMyType(gif: Gif | JimpRead): gif is JimpRead {
    return (gif as Gif).frames === undefined;
  }

  init() {
    const primarySize = this.gifPrimary.height * this.gifPrimary.width;
    const secondarySize = this.gifSecondary.height * this.gifSecondary.width;

    // gifPrimary.usesTransparency -- if at least one frame contains one transparent pixel

    if (primarySize > secondarySize) {
      this.aggregateImage = this.gifPrimary;
      this.elementImage = this.gifSecondary;
    } else {
      this.aggregateImage = this.gifSecondary;
      this.elementImage = this.gifPrimary;
    }

    if (this.guardMyType(this.gifSecondary)) {
      this.totalFrames = this.gifPrimary.frames.length;
      return;
    }

    this.totalFrames =
      this.gifPrimary.frames.length > this.gifSecondary.frames.length
        ? this.gifPrimary.frames.length
        : this.gifSecondary.frames.length;
  }

  getIndividualFrame(i: number) {
    let aggregateBitmap: Bitmap | undefined = undefined;
    let elementBitmap: Bitmap | undefined = undefined;
    let delay: undefined | number = undefined;

    if (!this.guardMyType(this.aggregateImage)) {
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
      console.log("Enters route that shouldnt happen");
      aggregateBitmap = this.aggregateImage.bitmap;
    }

    if (!this.guardMyType(this.elementImage)) {
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
      console.log("Enters route that shouldnt happen");
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

    GifUtil.quantizeDekker(framesAcc, 256); // quantize the image

    const encodedGif = await codec.encodeGif(framesAcc, { loops: 0 });
    return encodedGif;
  }
}

export const createComposite = (
  frame1: JimpBitmap,
  frame2: JimpBitmap,
  placement: Placement,
): JimpRead => {
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
};
