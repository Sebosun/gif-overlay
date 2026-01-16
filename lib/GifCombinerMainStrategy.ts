import { Jimp, type Bitmap } from "jimp";
import { GifFrame, GifCodec, Gif, GifUtil } from "gifwrap";
import { type Placement } from "./positions";
import type { JimpRead } from "./overlayGifImage";
import sharp from "sharp";
import { createCompositeJimp } from "./createComposite";
import type { GifStrategy } from "./GifCombiner";

interface MainStrategyOpts {
  gifPrimary: Gif | JimpRead;
  gifSecondary: Gif | JimpRead;
  placement: Placement;
}

type Frames = [Bitmap, Bitmap, number];

export class GifCombinerMainStrategy implements GifStrategy {
  useSharp: boolean = true;

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

  gifGuard(gif: Gif | JimpRead): gif is Gif {
    return (gif as Gif).frames !== undefined;
  }

  init(options: MainStrategyOpts) {
    const { gifPrimary, gifSecondary } = options;

    // const primarySize = gifPrimary.height * gifPrimary.width;
    // const secondarySize = gifSecondary.height * gifSecondary.width;

    this.aggregateImage = gifPrimary;
    this.elementImage = gifSecondary;

    // if (primarySize > secondarySize) {
    //   this.aggregateImage = gifPrimary;
    //   this.elementImage = gifSecondary;
    // } else {
    //   this.aggregateImage = gifSecondary;
    //   this.elementImage = gifPrimary;
    // }

    if (this.gifGuard(gifSecondary) && this.gifGuard(gifPrimary)) {
      this.totalFrames =
        gifPrimary.frames.length > gifSecondary.frames.length
          ? gifPrimary.frames.length
          : gifSecondary.frames.length;
    } else if (this.gifGuard(gifSecondary) && !this.gifGuard(gifPrimary)) {
      this.totalFrames = gifSecondary.frames.length;
      return;
    } else if (this.gifGuard(gifPrimary) && !this.gifGuard(gifSecondary)) {
      this.totalFrames = gifPrimary.frames.length;
    } else {
      throw new Error("Both inputs are an image, gifs not found.");
    }
  }

  getIndividualFrame(i: number): Frames {
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

    return [aggregateBitmap, elementBitmap, delay];
  }

  async generateSharpFrame(
    aggregateBitmap: Bitmap,
    elementBitmap: Bitmap,
  ): Promise<Bitmap> {
    const composite = createCompositeJimp(
      aggregateBitmap,
      elementBitmap,
      this.placement,
    );
    const buffer = await composite.getBuffer("image/jpeg");

    const processed = await sharp(buffer)
      .png({
        colors: 256,
        dither: 1,
      })
      .toBuffer();

    const jimpImage = await Jimp.read(processed);
    return jimpImage.bitmap;
  }

  async generateJimpFrame(
    aggregateBitmap: Bitmap,
    elementBitmap: Bitmap,
  ): Promise<Bitmap> {
    const composite = createCompositeJimp(
      aggregateBitmap,
      elementBitmap,
      this.placement,
    );
    return composite.bitmap;
  }

  async loopAndCombine() {
    console.time(`${this.useSharp ? "Sharp" : "Sharpless"}`);
    const frames: Frames[] = [];

    for (let i = 0; i < this.totalFrames; i++) {
      frames.push(this.getIndividualFrame(i));
    }

    const acc = await Promise.all(
      frames.map(async (frame) => {
        const [aggregateBitmap, elementBitmap, delay] = frame;
        if (this.useSharp) {
          console.time("Frame Generation");
          const bitmap = await this.generateSharpFrame(
            aggregateBitmap,
            elementBitmap,
          );
          console.timeEnd("Frame Generation");
          return new GifFrame(bitmap, {
            delayCentisecs: delay,
          });
        } else {
          console.time("Frame Generation");
          const bitmap = await this.generateJimpFrame(
            aggregateBitmap,
            elementBitmap,
          );
          console.timeEnd("Frame Generation");
          return new GifFrame(bitmap, {
            delayCentisecs: delay,
          });
        }
      }),
    );

    console.timeEnd(`${this.useSharp ? "Sharp" : "Sharpless"}`);

    return acc;
  }

  async run(): Promise<Gif> {
    const codec = new GifCodec();
    const framesAcc = await this.loopAndCombine();

    if (!this.useSharp) {
      GifUtil.quantizeDekker(framesAcc, 256); // quantize the image
    }

    const encodedGif = await codec.encodeGif(framesAcc, { loops: 0 });
    return encodedGif;
  }
}
