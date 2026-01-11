import { Jimp } from "jimp";
import { GifFrame, GifCodec, Gif, GifUtil } from "gifwrap";

export type JimpRead = Awaited<ReturnType<typeof Jimp.read>>;

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

  GifUtil.quantizeDekker(frames, 256); // quantize the image

  const newGif = await codec.encodeGif(frames, { loops: 0 });
  return newGif;
}
