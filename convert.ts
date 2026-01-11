import { Jimp } from "jimp";
import { GifFrame, GifCodec, Gif, GifUtil } from "gifwrap";

export type JimpRead = Awaited<ReturnType<typeof Jimp.read>>;

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
