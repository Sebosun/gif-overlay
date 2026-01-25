import { Jimp, type Bitmap } from "jimp";
import { GifFrame, GifCodec, Gif, GifUtil } from "gifwrap";
import { getPositionsPredictable, getPositionsRandomized, type Positions } from "./positions";
import sharp from "sharp";
import { createCompositeJimp } from "./createComposite";
import type { GifStrategy } from "./GifCombiner";
import { getRatio } from "./ratio";
import type { Placement } from "./placement";
import type { JimpRead } from "../types/Jimp";

interface MainStrategyOpts {
  gifPrimary: Gif | JimpRead;
  gifSecondary: Gif | JimpRead;
  placement: Placement;
  randomizePositions: boolean
  ratio: number
}

type Frames = [Bitmap, Bitmap, number];

export class GifCombinerMainStrategy implements GifStrategy {
  useSharp: boolean = true;

  placement: Placement;

  totalFrames!: number;

  ratio!: number
  baseImage!: Gif | JimpRead;
  overlayImage!: Gif | JimpRead;

  isBaseTransparent: boolean = false;
  isOverlayTransparent: boolean = false;
  randomizePositions: boolean = false

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
    const { gifPrimary, gifSecondary, ratio } = options;

    // const primarySize = gifPrimary.height * gifPrimary.width;
    // const secondarySize = gifSecondary.height * gifSecondary.width;

    this.baseImage = gifPrimary;
    this.overlayImage = gifSecondary;
    this.randomizePositions = options.randomizePositions
    this.ratio = ratio

    // if (primarySize > secondarySize) {
    //   this.aggregateImage = gifPrimary;
    //   this.elementImage = gifSecondary;
    // } else {
    //   this.aggregateImage = gifSecondary;
    //   this.elementImage = gifPrimary;
    // }

    if (this.gifGuard(gifSecondary) && this.gifGuard(gifPrimary)) {
      this.isBaseTransparent = gifPrimary.usesTransparency;
      this.isOverlayTransparent = gifSecondary.usesTransparency;

      this.totalFrames =
        gifPrimary.frames.length > gifSecondary.frames.length
          ? gifPrimary.frames.length
          : gifSecondary.frames.length;
    } else if (this.gifGuard(gifSecondary) && !this.gifGuard(gifPrimary)) {
      this.isOverlayTransparent = gifSecondary.usesTransparency;
      this.totalFrames = gifSecondary.frames.length;
      return;
    } else if (this.gifGuard(gifPrimary) && !this.gifGuard(gifSecondary)) {
      this.isBaseTransparent = gifPrimary.usesTransparency;
      this.totalFrames = gifPrimary.frames.length;
    } else {
      throw new Error("Both inputs are an image, gifs not found.");
    }

  }

  getIndividualFrame(i: number): Frames {
    let baseBitmap: Bitmap | undefined = undefined;
    let overlayBitmap: Bitmap | undefined = undefined;
    let delay: undefined | number = undefined;

    if (!this.jimpReadGuard(this.baseImage)) {
      let idx = i;
      if (i >= this.baseImage.frames.length) {
        idx = i % (this.baseImage.frames.length - 1); // modulo so it wraps, -1 cause its an array
      }
      const frame = this.baseImage.frames[idx];
      if (frame) {
        baseBitmap = frame.bitmap;
        delay = frame.delayCentisecs;
      } else {
        console.log("No frame", this.baseImage.frames.length, i, idx);
      }
    } else {
      baseBitmap = this.baseImage.bitmap;
    }

    if (!this.jimpReadGuard(this.overlayImage)) {
      let idx = i;
      if (i >= this.overlayImage.frames.length) {
        idx = i % (this.overlayImage.frames.length - 1); // modulo so it wraps, -1 cause its an array
      }
      const frame = this.overlayImage.frames[idx];
      if (frame) {
        overlayBitmap = frame.bitmap;
        if (!delay) {
          delay = frame.delayCentisecs;
        }
      } else {
        console.log("No frame", this.overlayImage.frames.length, i, idx);
      }
    } else {
      overlayBitmap = this.overlayImage.bitmap;
    }

    if (!baseBitmap || !overlayBitmap) {
      throw new Error("No frames were found...");
    }

    if (!delay) {
      delay = 10;
    }

    return [baseBitmap, overlayBitmap, delay];
  }

  async generateSharpFrame(baseBitmap: Bitmap, overlayBitmap: Bitmap, positions: Positions, scale: number): Promise<Bitmap> {
    const composite = createCompositeJimp({
      frame1: baseBitmap,
      frame2: overlayBitmap,
      positions: positions,
      scale: scale
    });
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

  async generateJimpFrame(baseBitmap: Bitmap, overlayBitmap: Bitmap, positions: Positions, scale: number): Promise<Bitmap> {
    const composite = createCompositeJimp({
      frame1: baseBitmap,
      frame2: overlayBitmap,
      positions: positions,
      scale: scale
    });
    return composite.bitmap;
  }

  async loopAndCombine() {
    console.time(`${this.useSharp ? "Sharp" : "Sharpless"}`);
    const frames: Frames[] = [];

    for (let i = 0; i < this.totalFrames; i++) {
      frames.push(this.getIndividualFrame(i));
    }

    // likely rethink this, penalization for not having transparent frames should happen
    // but this might be wrong place for it
    const finalRatio = this.isOverlayTransparent ? this.ratio : 0.1

    const scale = getRatio({
      baseElem: this.baseImage,
      overlayElem: this.overlayImage,
      ratio: finalRatio
    });

    // dimensions after scaling will be done
    const overlayDimensions = {
      width: Math.floor(this.overlayImage.width * scale),
      height: Math.floor(this.overlayImage.height * scale)
    }

    let positions: Positions
    if (this.randomizePositions) {
      positions = getPositionsRandomized({
        base: this.baseImage,
        overlay: overlayDimensions,
        placement: this.placement,
      });

    } else {
      positions = getPositionsPredictable({
        base: this.baseImage,
        overlay: overlayDimensions,
        placement: this.placement,
      });
    }


    const acc = await Promise.all(
      frames.map(async (frame) => {
        const [baseBitmap, overlayBitmap, delay] = frame;
        if (this.useSharp) {
          const bitmap = await this.generateSharpFrame(baseBitmap, overlayBitmap, positions, scale);

          return new GifFrame(bitmap, { delayCentisecs: delay });
        } else {
          const bitmap = await this.generateJimpFrame(baseBitmap, overlayBitmap, positions, scale);

          return new GifFrame(bitmap, { delayCentisecs: delay });
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
