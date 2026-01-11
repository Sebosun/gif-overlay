import { Jimp, type JimpInstance } from "jimp";
import fs from "fs/promises";
import { GifFrame, GifCodec, Gif, GifUtil } from "gifwrap";

type JimpRead = Awaited<ReturnType<typeof Jimp.read>>;

export async function splitImageToGif(
  imagePath: string | Buffer,
  frameWidth: number,
  frameHeight: number,
) {
  const image = await Jimp.read(imagePath);

  const iterations = Math.floor(image.bitmap.width / frameWidth);
  // console.log(iterations, image.bitmap.width, frameWidth);

  const acc = [] as ReturnType<typeof image.crop>[];
  // console.log(`total w ${image.width}, total h: ${image.height}`);
  for (let i = 0; i < iterations; i++) {
    const y = 0; // left corner
    let x = frameWidth * i;
    if (x > image.bitmap.width) {
      const diff = x - image.bitmap.width;
      x = image.bitmap.width - diff;
    }

    // console.log(`x: ${x}, y: ${y}, fw: ${frameWidth}, h: ${frameHeight}`);

    const clone = image.clone();
    const crop = clone.crop({ y, x, w: frameWidth, h: frameHeight });
    acc.push(crop);
  }

  const gifFrames = acc.map((el) => {
    return new GifFrame(el.bitmap, {
      delayCentisecs: 10,
    });
  });

  const codec = new GifCodec();
  const gif = await codec.encodeGif(gifFrames, { loops: 0 });
  return gif;
}

export async function overlayGif(
  background: JimpRead,
  gif: Gif,
  x: number = 0,
  y: number = 0,
) {
  const codec = new GifCodec();

  const frames = gif.frames.map((frame) => {
    const jimpFrame = new Jimp(frame.bitmap);
    const composite = background.clone();
    composite.composite(jimpFrame, x, y);

    return new GifFrame(composite.bitmap, {
      delayCentisecs: frame.delayCentisecs,
    });
  });

  frames.forEach((frame) => {
    console.log("Quantizing that dekker");
    GifUtil.quantizeDekker(frame, 256); // quantize the image
  });

  const newGif = await codec.encodeGif(frames, { loops: 0 });
  return newGif;
}
