import { Jimp } from "jimp";
import { GifFrame, GifCodec, Gif, GifUtil } from "gifwrap";
import { getPositions, type Placement } from "./positions";

export type JimpRead = Awaited<ReturnType<typeof Jimp.read>>;

export async function overlayGif(
  background: JimpRead,
  gif: Gif,
  placement: Placement,
) {
  const codec = new GifCodec();

  const frames = gif.frames.map((frame) => {
    const frameJimp = new Jimp(frame.bitmap);
    const composite = background.clone();

    const { x, y } = getPositions(placement, background, frameJimp);

    composite.composite(frameJimp, x, y);

    return new GifFrame(composite.bitmap, {
      delayCentisecs: frame.delayCentisecs,
    });
  });

  GifUtil.quantizeDekker(frames, 256); // quantize the image

  return await codec.encodeGif(frames, { loops: 0 });
}
